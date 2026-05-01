import { authRouter } from "./auth-router.js";
import { postsRouter } from "./posts-router.js";
import { adminRouter } from "./admin-router.js";
import { crowdReviewRouter } from "./crowd-review-router.js";
import { createRouter, publicQuery } from "./middleware.js";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  posts: postsRouter,
  admin: adminRouter,
  crowdReview: crowdReviewRouter,
});

export type AppRouter = typeof appRouter;
