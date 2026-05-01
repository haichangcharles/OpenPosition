import { describe, expect, test } from "vitest";
import {
  authorizeIngestionRequest,
  buildIngestionPostData,
  normalizeIngestionPostInput,
} from "../server/ingestion/posts-api.js";

const agentPayload = {
  source: "X",
  externalId: "tweet-123",
  originalUrl: "https://x.com/example/status/123",
  originalText: "I am recruiting a PhD student and research intern for LLM systems research.",
  title: "Recruiting PhD student and research intern for LLM systems",
  authorName: "Prof. Agent",
  authorAffiliation: "Example University",
  institution: "Example University",
  location: "Remote",
  type: "position",
  positionType: "Research Intern",
  deadline: "2026-06-01",
  tags: ["LLM", "PhD", "Research Intern"],
};

describe("agent ingestion API helpers", () => {
  test("accepts only the configured bearer token", () => {
    expect(
      authorizeIngestionRequest("Bearer secret-1", {
        ingestionAdminSecret: "secret-1",
      }),
    ).toBe(true);

    expect(
      authorizeIngestionRequest("Bearer wrong", {
        ingestionAdminSecret: "secret-1",
      }),
    ).toBe(false);
  });

  test("normalizes agent payloads into post creation input", () => {
    expect(normalizeIngestionPostInput(agentPayload)).toMatchObject({
      source: "X",
      originalUrl: "https://x.com/example/status/123",
      tags: "LLM,PhD,Research Intern",
      type: "position",
      positionType: "Research Intern",
      authorName: "Prof. Agent",
      authorAffiliation: "Example University",
    });
  });

  test("builds approved post data and a stable source hash for strong academic opportunities", () => {
    const normalized = normalizeIngestionPostInput(agentPayload);

    expect(buildIngestionPostData(normalized, "tweet-123")).toMatchObject({
      title: agentPayload.title,
      source: "X",
      sourceHash: "x:tweet-123",
      moderationStatus: "approved",
      visibilityStatus: "active",
      verifiedStatus: "source_checked",
      postedBy: null,
    });
  });
});
