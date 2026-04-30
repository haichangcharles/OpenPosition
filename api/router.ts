import { authRouter } from "./auth-router";
import { postsRouter } from "./posts-router";
import { adminRouter } from "./admin-router";
import { crowdReviewRouter } from "./crowd-review-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  posts: postsRouter,
  admin: adminRouter,
  crowdReview: crowdReviewRouter,
});

export type AppRouter = typeof appRouter;
