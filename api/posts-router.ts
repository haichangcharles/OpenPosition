import { z } from "zod";
import { eq, desc, and, or, like } from "drizzle-orm";
import { createRouter, publicQuery, authedQuery } from "./middleware.js";
import { moderationReviews, postReports, posts } from "@db/schema";
import { getDb } from "./queries/connection.js";
import { env } from "./lib/env.js";
import { CLIENT_POST_EVENT_TYPES, recordPostEvent, type ClientPostEventType } from "./post-events.js";
import { publicPostFilters } from "./post-visibility.js";
import {
  evaluatePostWithOpenAI,
  type AIModerationInput,
} from "./moderation/ai-review.js";
import {
  applyAutoModerationDecision,
  buildAutoModerationReviewData,
  evaluatePostForAutoModeration,
  type AutoModerationDecision,
} from "./moderation/auto-review.js";

const createPostInputSchema = z.object({
  title: z.string().min(1).max(500),
  type: z.enum(["position", "collaborator"]),
  positionType: z
    .enum(["PhD Student", "Research Intern", "PostDoc", "Research Assistant"])
    .optional(),
  domain: z
    .enum(["Long-term Research", "Short-term Project", "Co-author Needed"])
    .optional(),
  source: z.enum(["LinkedIn", "X", "RedBook", "Other"]),
  institution: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  authorName: z.string().min(1).max(255),
  authorAffiliation: z.string().min(1).max(255),
  summary: z.string().min(1),
  originalText: z.string().min(1),
  tags: z.string().min(1),
  originalUrl: z.string().url().max(500),
  projectStatus: z.string().max(100).optional(),
  deadline: z.string().max(50).optional(),
});

type CreatePostInput = z.infer<typeof createPostInputSchema>;

type ModerationRuntime = {
  openAIApiKey: string;
  openAIModerationModel: string;
  evaluateWithAI?: (
    input: AIModerationInput,
    options: { apiKey: string; model: string },
  ) => Promise<AutoModerationDecision>;
};

function toModerationInput(input: CreatePostInput): AIModerationInput {
  return {
    title: input.title,
    summary: input.summary,
    originalText: input.originalText,
    tags: input.tags,
    originalUrl: input.originalUrl,
    source: input.source,
  };
}

export async function chooseModerationDecision(
  input: CreatePostInput,
  runtime: ModerationRuntime,
) {
  return (await decidePostModeration(input, runtime)).decision;
}

export async function decidePostModeration(
  input: CreatePostInput,
  runtime: ModerationRuntime,
) {
  if (runtime.openAIApiKey) {
    const evaluateWithAI = runtime.evaluateWithAI ?? evaluatePostWithOpenAI;
    const decision = await evaluateWithAI(toModerationInput(input), {
      apiKey: runtime.openAIApiKey,
      model: runtime.openAIModerationModel,
    });
    if (!decision.reasons.includes("ai_request_failed")) {
      return { decision, reviewerType: "ai" as const };
    }
  }

  return {
    decision: evaluatePostForAutoModeration(toModerationInput(input)),
    reviewerType: "heuristic" as const,
  };
}

export function buildCreatePostData(
  input: CreatePostInput,
  userId: number,
  autoDecision = evaluatePostForAutoModeration(toModerationInput(input)),
) {
  return {
    ...input,
    postedBy: userId,
    submittedAt: new Date(),
    ...applyAutoModerationDecision(autoDecision),
  };
}

export function readCreatedPostId(rows: Array<{ id: number }>) {
  const id = rows[0]?.id;
  if (typeof id !== "number") {
    throw new Error("Post creation did not return an id");
  }
  return id;
}

export function isClientPostEventType(value: string): value is ClientPostEventType {
  return (CLIENT_POST_EVENT_TYPES as readonly string[]).includes(value);
}

export const postsRouter = createRouter({
  // List all posts with optional filtering
  list: publicQuery
    .input(
      z
        .object({
          type: z.enum(["position", "collaborator"]).optional(),
          positionType: z
            .enum(["PhD Student", "Research Intern", "PostDoc", "Research Assistant"])
            .optional(),
          domain: z
            .enum(["Long-term Research", "Short-term Project", "Co-author Needed"])
            .optional(),
          source: z.enum(["LinkedIn", "X", "RedBook", "Other"]).optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const filters = [publicPostFilters()];

      if (input?.type) filters.push(eq(posts.type, input.type));
      if (input?.positionType) filters.push(eq(posts.positionType, input.positionType));
      if (input?.domain) filters.push(eq(posts.domain, input.domain));
      if (input?.source) filters.push(eq(posts.source, input.source));
      if (input?.search && input.search.trim()) {
        const q = `%${input.search.trim()}%`;
        filters.push(
          or(
            like(posts.title, q),
            like(posts.summary, q),
            like(posts.institution, q),
            like(posts.authorAffiliation, q),
            like(posts.tags, q)
          )
        );
      }

      const results = await db
        .select()
        .from(posts)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(posts.createdAt));

      return results;
    }),

  // Get single post by ID
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(posts)
        .where(and(eq(posts.id, input.id), publicPostFilters()))
        .limit(1);
      return result[0] ?? null;
    }),

  // Create a new post (requires auth)
  create: authedQuery
    .input(createPostInputSchema)
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const moderation = await decidePostModeration(input, env);
      const autoDecision = moderation.decision;
      const insertData = buildCreatePostData(input, ctx.user.id, autoDecision);
      const result = await db
        .insert(posts)
        .values(insertData)
        .returning({ id: posts.id });
      const id = readCreatedPostId(result);
      await db
        .insert(moderationReviews)
        .values(buildAutoModerationReviewData(id, autoDecision, moderation.reviewerType));
      await recordPostEvent({
        postId: id,
        userId: ctx.user.id,
        eventType: "submit_created",
      });
      return { id };
    }),

  report: publicQuery
    .input(
      z.object({
        postId: z.number(),
        type: z.enum(["stale", "duplicate", "suspicious", "wrong_metadata", "other"]),
        message: z.string().max(1000).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const publicPost = await db
        .select({ id: posts.id })
        .from(posts)
        .where(and(eq(posts.id, input.postId), publicPostFilters()))
        .limit(1);

      if (!publicPost[0]) {
        throw new Error("Post not found");
      }

      await db.insert(postReports).values({
        postId: input.postId,
        reporterUserId: ctx.user?.id,
        type: input.type,
        message: input.message,
      });
      await recordPostEvent({
        postId: input.postId,
        userId: ctx.user?.id,
        eventType: "report_created",
        metadata: { type: input.type },
      });
      return { success: true };
    }),

  trackEvent: publicQuery
    .input(
      z.object({
        postId: z.number().optional(),
        anonymousId: z.string().max(128).optional(),
        eventType: z.string(),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!isClientPostEventType(input.eventType)) {
        throw new Error("Unsupported event type");
      }
      await recordPostEvent({
        postId: input.postId,
        userId: ctx.user?.id,
        anonymousId: input.anonymousId,
        eventType: input.eventType,
        metadata: input.metadata,
      });
      return { success: true };
    }),

  // Delete a post (requires auth, only owner or admin)
  delete: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1);

      if (!existing[0]) {
        throw new Error("Post not found");
      }

      // Only owner or admin can delete
      if (existing[0].postedBy !== ctx.user.id && ctx.user.role !== "admin") {
        throw new Error("Not authorized");
      }

      await db.delete(posts).where(eq(posts.id, input.id));
      return { success: true };
    }),
});
