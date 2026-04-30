import { createRouter } from "./middleware";
import { adminPostsRouter } from "./admin-posts-router";
import { adminReportsRouter } from "./admin-reports-router";

export const adminRouter = createRouter({
  posts: adminPostsRouter,
  reports: adminReportsRouter,
});
