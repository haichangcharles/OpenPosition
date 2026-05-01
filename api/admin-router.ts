import { createRouter } from "./middleware.js";
import { adminPostsRouter } from "./admin-posts-router.js";
import { adminReportsRouter } from "./admin-reports-router.js";

export const adminRouter = createRouter({
  posts: adminPostsRouter,
  reports: adminReportsRouter,
});
