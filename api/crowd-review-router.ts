import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { crowdVotes, moderationReviews, posts } from "@db/schema";
import { authedQuery, createRouter } from "./middleware";
import { getDb } from "./queries/connection";
import { recordPostEvent } from "./post-events";

const crowdVoteInputSchema = z.object({
  postId: z.number(),
  vote: z.enum(["approve", "reject", "duplicate", "stale"]),
  reason: z.string().max(1000).optional(),
});

type CrowdVoteInput = z.infer<typeof crowdVoteInputSchema>;
type VoteSummaryInput = {
  vote: "approve" | "reject" | "duplicate" | "stale";
  weight: number;
};

export function buildCrowdVoteData(input: CrowdVoteInput, userId: number) {
  return {
    postId: input.postId,
    userId,
    vote: input.vote,
    reason: input.reason,
    weight: 1,
  };
}

export function summarizeCrowdVotes(votes: VoteSummaryInput[]) {
  const approveWeight = votes
    .filter((vote) => vote.vote === "approve")
    .reduce((sum, vote) => sum + vote.weight, 0);
  const rejectWeight = votes
    .filter((vote) => vote.vote !== "approve")
    .reduce((sum, vote) => sum + vote.weight, 0);
  const totalWeight = approveWeight + rejectWeight;

  if (totalWeight >= 4 && approveWeight / totalWeight >= 0.75) {
    return { approveWeight, rejectWeight, totalWeight, decision: "approve" as const };
  }

  if (totalWeight >= 4 && rejectWeight / totalWeight >= 0.75) {
    return { approveWeight, rejectWeight, totalWeight, decision: "reject" as const };
  }

  return { approveWeight, rejectWeight, totalWeight, decision: "needs_admin" as const };
}

export const crowdReviewRouter = createRouter({
  list: authedQuery
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }).optional())
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(posts)
        .where(and(eq(posts.moderationStatus, "pending"), eq(posts.visibilityStatus, "hidden")))
        .orderBy(desc(posts.submittedAt))
        .limit(input?.limit ?? 20);
    }),

  vote: authedQuery
    .input(crowdVoteInputSchema)
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const reviewablePost = await db
        .select({ id: posts.id })
        .from(posts)
        .where(
          and(
            eq(posts.id, input.postId),
            eq(posts.moderationStatus, "pending"),
            eq(posts.visibilityStatus, "hidden"),
          ),
        )
        .limit(1);

      if (!reviewablePost[0]) {
        throw new Error("Post is not available for crowd review");
      }

      await db.insert(crowdVotes).values(buildCrowdVoteData(input, ctx.user.id));
      await recordPostEvent({
        postId: input.postId,
        userId: ctx.user.id,
        eventType: "crowd_vote_created",
        metadata: { vote: input.vote },
      });

      const votes = await db
        .select({ vote: crowdVotes.vote, weight: crowdVotes.weight })
        .from(crowdVotes)
        .where(eq(crowdVotes.postId, input.postId));
      const summary = summarizeCrowdVotes(votes);

      if (summary.decision === "approve") {
        await db
          .update(posts)
          .set({
            moderationStatus: "approved",
            visibilityStatus: "active",
            verifiedStatus: "source_checked",
            approvedAt: new Date(),
            lastReviewedAt: new Date(),
          })
          .where(eq(posts.id, input.postId));
        await db.insert(moderationReviews).values({
          postId: input.postId,
          reviewerType: "crowd",
          decision: "approve",
          confidence: Math.round((summary.approveWeight / summary.totalWeight) * 100),
          reason: "Crowd consensus approved",
          metadata: JSON.stringify(summary),
        });
        await recordPostEvent({
          postId: input.postId,
          eventType: "crowd_approved",
          metadata: summary,
        });
      }

      if (summary.decision === "reject") {
        await db
          .update(posts)
          .set({
            moderationStatus: "rejected",
            visibilityStatus: "hidden",
            rejectedAt: new Date(),
            rejectionReason: "Crowd consensus rejected",
            lastReviewedAt: new Date(),
          })
          .where(eq(posts.id, input.postId));
        await db.insert(moderationReviews).values({
          postId: input.postId,
          reviewerType: "crowd",
          decision: "reject",
          confidence: Math.round((summary.rejectWeight / summary.totalWeight) * 100),
          reason: "Crowd consensus rejected",
          metadata: JSON.stringify(summary),
        });
        await recordPostEvent({
          postId: input.postId,
          eventType: "crowd_rejected",
          metadata: summary,
        });
      }

      return { success: true, summary };
    }),
});
