import { z } from "zod";
import { createHash } from "node:crypto";
import { eq, or } from "drizzle-orm";
import { posts, moderationReviews } from "../../db/schema.js";
import { getDb } from "../queries/connection.js";
import { env } from "../lib/env.js";
import {
  applyAutoModerationDecision,
  buildAutoModerationReviewData,
  evaluatePostForAutoModeration,
} from "../moderation/auto-review.js";
import { decidePostModeration, readCreatedPostId } from "../posts-router.js";

const ingestionPostSchema = z.object({
  source: z.enum(["LinkedIn", "X", "RedBook", "Other"]),
  externalId: z.string().max(255).optional(),
  originalUrl: z.string().url().max(500),
  originalText: z.string().min(1),
  title: z.string().min(1).max(500),
  authorName: z.string().min(1).max(255).default("Unknown"),
  authorAffiliation: z.string().min(1).max(255).default("Unknown"),
  institution: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  type: z.enum(["position", "collaborator"]).default("position"),
  positionType: z
    .enum(["PhD Student", "Research Intern", "PostDoc", "Research Assistant"])
    .optional(),
  domain: z
    .enum(["Long-term Research", "Short-term Project", "Co-author Needed"])
    .optional(),
  summary: z.string().optional(),
  deadline: z.string().max(50).optional(),
  tags: z.union([z.array(z.string()), z.string()]).optional(),
});

export type IngestionPostPayload = z.input<typeof ingestionPostSchema>;
export type NormalizedIngestionPost = ReturnType<typeof normalizeIngestionPostInput>;

type IngestionRuntime = {
  ingestionAdminSecret: string;
};

export function authorizeIngestionRequest(
  authorization: string | null | undefined,
  runtime: IngestionRuntime,
) {
  if (!runtime.ingestionAdminSecret) {
    return false;
  }
  return authorization === `Bearer ${runtime.ingestionAdminSecret}`;
}

function normalizeTags(tags: string[] | string | undefined) {
  if (Array.isArray(tags)) {
    return tags.map((tag) => tag.trim()).filter(Boolean).join(",");
  }
  return tags?.trim() ?? "";
}

function buildSummary(input: z.output<typeof ingestionPostSchema>) {
  if (input.summary?.trim()) {
    return input.summary.trim();
  }
  return input.originalText.length > 300
    ? `${input.originalText.slice(0, 297)}...`
    : input.originalText;
}

export function buildIngestionSourceHash(source: string, externalId: string | undefined, originalUrl: string) {
  if (externalId?.trim()) {
    return `${source.toLowerCase()}:${externalId.trim()}`;
  }
  return `${source.toLowerCase()}:url:${createHash("sha256").update(originalUrl).digest("hex")}`;
}

export function normalizeIngestionPostInput(payload: unknown) {
  const input = ingestionPostSchema.parse(payload);
  return {
    title: input.title.trim(),
    type: input.type,
    positionType: input.positionType,
    domain: input.domain,
    source: input.source,
    institution: input.institution?.trim(),
    location: input.location?.trim(),
    authorName: input.authorName.trim(),
    authorAffiliation: input.authorAffiliation.trim(),
    summary: buildSummary(input),
    originalText: input.originalText.trim(),
    tags: normalizeTags(input.tags),
    originalUrl: input.originalUrl,
    deadline: input.deadline?.trim(),
  };
}

export function buildIngestionPostData(
  input: NormalizedIngestionPost,
  externalId?: string,
  autoDecision = evaluatePostForAutoModeration(input),
) {
  return {
    ...input,
    postedBy: null,
    sourceHash: buildIngestionSourceHash(input.source, externalId, input.originalUrl),
    submittedAt: new Date(),
    ...applyAutoModerationDecision(autoDecision),
  };
}

export async function ingestPostFromAgent(payload: unknown) {
  const parsed = ingestionPostSchema.parse(payload);
  const input = normalizeIngestionPostInput(parsed);
  const sourceHash = buildIngestionSourceHash(input.source, parsed.externalId, input.originalUrl);
  const db = getDb();

  const existing = await db
    .select({
      id: posts.id,
      moderationStatus: posts.moderationStatus,
      visibilityStatus: posts.visibilityStatus,
    })
    .from(posts)
    .where(or(eq(posts.originalUrl, input.originalUrl), eq(posts.sourceHash, sourceHash)))
    .limit(1);

  if (existing[0]) {
    return {
      status: "duplicate" as const,
      postId: existing[0].id,
      moderationStatus: existing[0].moderationStatus,
      visibilityStatus: existing[0].visibilityStatus,
    };
  }

  const moderation = await decidePostModeration(input, env);
  const insertData = buildIngestionPostData(input, parsed.externalId, moderation.decision);
  const created = await db.insert(posts).values(insertData).returning({ id: posts.id });
  const postId = readCreatedPostId(created);
  await db
    .insert(moderationReviews)
    .values(buildAutoModerationReviewData(postId, moderation.decision, moderation.reviewerType));

  return {
    status: "created" as const,
    postId,
    moderationStatus: insertData.moderationStatus,
    visibilityStatus: insertData.visibilityStatus,
  };
}
