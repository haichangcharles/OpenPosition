import { describe, expect, test } from "vitest";
import { buildApprovePostData, buildExpirePostData, buildRejectPostData } from "./admin-posts-router.js";

describe("admin post lifecycle helpers", () => {
  test("approval publishes a post and records reviewer metadata", () => {
    expect(buildApprovePostData(7)).toMatchObject({
      moderationStatus: "approved",
      visibilityStatus: "active",
      approvedBy: 7,
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null,
    });
  });

  test("rejection hides a post with a reason", () => {
    expect(buildRejectPostData(9, "Missing original source")).toMatchObject({
      moderationStatus: "rejected",
      visibilityStatus: "hidden",
      rejectedBy: 9,
      rejectionReason: "Missing original source",
    });
  });

  test("expiry keeps moderation approval but removes public visibility", () => {
    expect(buildExpirePostData()).toMatchObject({
      visibilityStatus: "expired",
    });
  });
});
