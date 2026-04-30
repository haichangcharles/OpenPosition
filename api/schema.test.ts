import { describe, expect, test } from "vitest";
import { crowdVotes, moderationReviews, postEvents, postReports, posts } from "../db/schema";

describe("OpenPosition V0 schema", () => {
  test("posts table exposes moderation, visibility, verification, and review fields", () => {
    expect(posts).toHaveProperty("moderationStatus");
    expect(posts).toHaveProperty("visibilityStatus");
    expect(posts).toHaveProperty("verifiedStatus");
    expect(posts).toHaveProperty("submittedAt");
    expect(posts).toHaveProperty("approvedAt");
    expect(posts).toHaveProperty("approvedBy");
    expect(posts).toHaveProperty("rejectedAt");
    expect(posts).toHaveProperty("rejectedBy");
    expect(posts).toHaveProperty("rejectionReason");
    expect(posts).toHaveProperty("lastReviewedAt");
    expect(posts).toHaveProperty("lastSourceCheckedAt");
    expect(posts).toHaveProperty("sourceHash");
  });

  test("post reports table captures community quality signals", () => {
    expect(postReports).toHaveProperty("postId");
    expect(postReports).toHaveProperty("reporterUserId");
    expect(postReports).toHaveProperty("type");
    expect(postReports).toHaveProperty("message");
    expect(postReports).toHaveProperty("status");
    expect(postReports).toHaveProperty("resolvedBy");
    expect(postReports).toHaveProperty("resolvedAt");
  });

  test("post events table captures product actions", () => {
    expect(postEvents).toHaveProperty("postId");
    expect(postEvents).toHaveProperty("userId");
    expect(postEvents).toHaveProperty("anonymousId");
    expect(postEvents).toHaveProperty("eventType");
    expect(postEvents).toHaveProperty("metadata");
  });

  test("moderation reviews table stores automated and crowd review decisions", () => {
    expect(moderationReviews).toHaveProperty("postId");
    expect(moderationReviews).toHaveProperty("reviewerType");
    expect(moderationReviews).toHaveProperty("decision");
    expect(moderationReviews).toHaveProperty("confidence");
    expect(moderationReviews).toHaveProperty("reason");
    expect(moderationReviews).toHaveProperty("metadata");
  });

  test("crowd votes table stores community review signals", () => {
    expect(crowdVotes).toHaveProperty("postId");
    expect(crowdVotes).toHaveProperty("userId");
    expect(crowdVotes).toHaveProperty("vote");
    expect(crowdVotes).toHaveProperty("reason");
    expect(crowdVotes).toHaveProperty("weight");
  });
});
