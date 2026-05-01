import { z } from "zod";
import { desc, eq } from "drizzle-orm";
import { postReports } from "../db/schema.js";
import { createRouter, adminQuery } from "./middleware.js";
import { recordPostEvent } from "./post-events.js";
import { getDb } from "./queries/connection.js";

export function buildResolveReportData(adminUserId: number) {
  return {
    status: "resolved" as const,
    resolvedBy: adminUserId,
    resolvedAt: new Date(),
  };
}

export function buildDismissReportData(adminUserId: number) {
  return {
    status: "dismissed" as const,
    resolvedBy: adminUserId,
    resolvedAt: new Date(),
  };
}

export const adminReportsRouter = createRouter({
  list: adminQuery
    .input(
      z
        .object({
          status: z.enum(["open", "resolved", "dismissed"]).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      return getDb()
        .select()
        .from(postReports)
        .where(input?.status ? eq(postReports.status, input.status) : undefined)
        .orderBy(desc(postReports.createdAt));
    }),

  resolve: adminQuery
    .input(z.object({ id: z.number(), postId: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      await getDb()
        .update(postReports)
        .set(buildResolveReportData(ctx.user.id))
        .where(eq(postReports.id, input.id));
      await recordPostEvent({
        postId: input.postId,
        userId: ctx.user.id,
        eventType: "report_resolved",
      });
      return { success: true };
    }),

  dismiss: adminQuery
    .input(z.object({ id: z.number(), postId: z.number().optional() }))
    .mutation(async ({ input, ctx }) => {
      await getDb()
        .update(postReports)
        .set(buildDismissReportData(ctx.user.id))
        .where(eq(postReports.id, input.id));
      await recordPostEvent({
        postId: input.postId,
        userId: ctx.user.id,
        eventType: "report_resolved",
        metadata: { status: "dismissed" },
      });
      return { success: true };
    }),
});
