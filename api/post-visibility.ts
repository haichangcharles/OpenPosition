import { and, eq } from "drizzle-orm";
import { posts } from "@db/schema";

export function publicPostFilters() {
  return and(
    eq(posts.moderationStatus, "approved"),
    eq(posts.visibilityStatus, "active"),
  );
}
