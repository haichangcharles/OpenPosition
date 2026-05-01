import { describe, expect, test } from "vitest";
import { and, eq } from "drizzle-orm";
import { posts } from "../db/schema.js";
import { publicPostFilters } from "./post-visibility.js";

describe("publicPostFilters", () => {
  test("requires approved and active posts", () => {
    expect(publicPostFilters()).toEqual(
      and(
        eq(posts.moderationStatus, "approved"),
        eq(posts.visibilityStatus, "active"),
      ),
    );
  });
});
