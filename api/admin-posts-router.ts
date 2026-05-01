import { z } from "zod";
import { and, desc, eq } from "drizzle-orm";
import { posts } from "@db/schema";
import { createRouter, adminQuery } from "./middleware.js";
import { recordPostEvent } from "./post-events.js";
import { getDb } from "./queries/connection.js";

export function buildApprovePostData(adminUserId: number) {
  const now = new Date();
  return {
    moderationStatus: "approved" as const,
    visibilityStatus: "active" as const,
    approvedAt: now,
    approvedBy: adminUserId,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,
    lastReviewedAt: now,
  };
}

export function buildRejectPostData(adminUserId: number, reason: string) {
  const now = new Date();
  return {
    moderationStatus: "rejected" as const,
    visibilityStatus: "hidden" as const,
    rejectedAt: now,
    rejectedBy: adminUserId,
    rejectionReason: reason,
    lastReviewedAt: now,
  };
}

export function buildExpirePostData() {
  return {
    visibilityStatus: "expired" as const,
    lastReviewedAt: new Date(),
  };
}

export const adminPostsRouter = createRouter({
  list: adminQuery
    .input(
      z
        .object({
          moderationStatus: z.enum(["pending", "approved", "rejected"]).optional(),
          visibilityStatus: z.enum(["active", "expired", "hidden"]).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const filters = [];
      if (input?.moderationStatus) {
        filters.push(eq(posts.moderationStatus, input.moderationStatus));
      }
      if (input?.visibilityStatus) {
        filters.push(eq(posts.visibilityStatus, input.visibilityStatus));
      }

      return getDb()
        .select()
        .from(posts)
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(posts.createdAt));
    }),

  approve: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await getDb()
        .update(posts)
        .set(buildApprovePostData(ctx.user.id))
        .where(eq(posts.id, input.id));
      await recordPostEvent({
        postId: input.id,
        userId: ctx.user.id,
        eventType: "admin_approved",
      });
      return { success: true };
    }),

  reject: adminQuery
    .input(z.object({ id: z.number(), reason: z.string().min(1).max(1000) }))
    .mutation(async ({ input, ctx }) => {
      await getDb()
        .update(posts)
        .set(buildRejectPostData(ctx.user.id, input.reason))
        .where(eq(posts.id, input.id));
      await recordPostEvent({
        postId: input.id,
        userId: ctx.user.id,
        eventType: "admin_rejected",
        metadata: { reason: input.reason },
      });
      return { success: true };
    }),

  expire: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await getDb()
        .update(posts)
        .set(buildExpirePostData())
        .where(eq(posts.id, input.id));
      await recordPostEvent({
        postId: input.id,
        userId: ctx.user.id,
        eventType: "admin_expired",
      });
      return { success: true };
    }),
});
