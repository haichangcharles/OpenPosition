import { describe, expect, test } from "vitest";
import { buildCrowdVoteData, summarizeCrowdVotes } from "./crowd-review-router.js";

describe("crowd review helpers", () => {
  test("builds a weighted crowd vote tied to the signed-in reviewer", () => {
    expect(
      buildCrowdVoteData(
        {
          postId: 12,
          vote: "approve",
          reason: "Source is a real university lab post",
        },
        42,
      ),
    ).toMatchObject({
      postId: 12,
      userId: 42,
      vote: "approve",
      reason: "Source is a real university lab post",
      weight: 1,
    });
  });

  test("summarizes crowd votes into approve and reject weights", () => {
    expect(
      summarizeCrowdVotes([
        { vote: "approve", weight: 1 },
        { vote: "approve", weight: 2 },
        { vote: "reject", weight: 1 },
        { vote: "duplicate", weight: 1 },
        { vote: "stale", weight: 1 },
      ]),
    ).toEqual({
      approveWeight: 3,
      rejectWeight: 3,
      totalWeight: 6,
      decision: "needs_admin",
    });
  });

  test("auto-approves from crowd consensus once enough weighted votes agree", () => {
    expect(
      summarizeCrowdVotes([
        { vote: "approve", weight: 1 },
        { vote: "approve", weight: 1 },
        { vote: "approve", weight: 1 },
        { vote: "reject", weight: 1 },
      ]),
    ).toMatchObject({
      decision: "approve",
    });
  });
});
