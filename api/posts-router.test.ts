import { describe, expect, test } from "vitest";
import {
  buildCreatePostData,
  chooseModerationDecision,
  decidePostModeration,
  isClientPostEventType,
  readCreatedPostId,
} from "./posts-router.js";

const basePostInput = {
  title: "PhD Position in Trustworthy ML",
  type: "position" as const,
  positionType: "PhD Student" as const,
  source: "X" as const,
  institution: "OpenPosition University",
  authorName: "Prof. Test",
  authorAffiliation: "OpenPosition Lab",
  summary: "Fully funded PhD research position in machine learning.",
  originalText: "The university lab is recruiting a PhD student for AI research.",
  tags: "Machine Learning,AI,Research",
  originalUrl: "https://example.com/post/1",
};

describe("posts router helpers", () => {
  test("high-confidence academic submissions are auto-approved", () => {
    expect(buildCreatePostData(basePostInput, 42)).toMatchObject({
      ...basePostInput,
      postedBy: 42,
      moderationStatus: "approved",
      visibilityStatus: "active",
      verifiedStatus: "source_checked",
    });
  });

  test("uncertain submissions remain pending for crowd review", () => {
    expect(
      buildCreatePostData(
        {
          ...basePostInput,
          title: "Looking for people to join",
          summary: "A project needs help.",
          originalText: "Message me if interested.",
          tags: "project",
        },
        42,
      ),
    ).toMatchObject({
      moderationStatus: "pending",
      visibilityStatus: "hidden",
      verifiedStatus: "unverified",
    });
  });

  test("only allows client-safe event types from the public tracking API", () => {
    expect(isClientPostEventType("detail_open")).toBe(true);
    expect(isClientPostEventType("source_click")).toBe(true);
    expect(isClientPostEventType("admin_approved")).toBe(false);
    expect(isClientPostEventType("submit_created")).toBe(false);
  });

  test("uses AI moderation when an API key is configured", async () => {
    const decision = await chooseModerationDecision(basePostInput, {
      openAIApiKey: "test-key",
      openAIModerationModel: "gpt-test",
      evaluateWithAI: async () => ({
        decision: "reject",
        confidence: 94,
        reasons: ["not_academic"],
      }),
    });

    expect(decision).toEqual({
      decision: "reject",
      confidence: 94,
      reasons: ["not_academic"],
    });
  });

  test("falls back to heuristic moderation when no AI key is configured", async () => {
    await expect(
      chooseModerationDecision(basePostInput, {
        openAIApiKey: "",
        openAIModerationModel: "gpt-test",
      }),
    ).resolves.toMatchObject({
      decision: "approve",
    });
  });

  test("marks AI as the reviewer type when the AI call succeeds", async () => {
    await expect(
      decidePostModeration(basePostInput, {
        openAIApiKey: "test-key",
        openAIModerationModel: "gpt-test",
        evaluateWithAI: async () => ({
          decision: "needs_crowd",
          confidence: 68,
          reasons: ["weak_source_context"],
        }),
      }),
    ).resolves.toMatchObject({
      reviewerType: "ai",
      decision: {
        decision: "needs_crowd",
      },
    });
  });

  test("reads the created post id from a Postgres returning row", () => {
    expect(readCreatedPostId([{ id: 77 }])).toBe(77);
  });

  test("throws when Postgres does not return a created post id", () => {
    expect(() => readCreatedPostId([])).toThrow("Post creation did not return an id");
  });
});
