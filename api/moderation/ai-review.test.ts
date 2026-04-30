import { describe, expect, test } from "vitest";
import {
  buildAIModerationPrompt,
  buildOpenAIModerationRequest,
  parseAIModerationResponse,
} from "./ai-review";

const moderationInput = {
  title: "PhD Position in AI Safety",
  summary: "A university lab is recruiting a PhD student for AI safety research.",
  originalText: "Applicants should have machine learning research experience.",
  tags: "AI,PhD,Research",
  originalUrl: "https://university.edu/lab/opening",
  source: "X" as const,
};

describe("AI moderation", () => {
  test("builds a compact prompt with the source content and decision rubric", () => {
    const prompt = buildAIModerationPrompt(moderationInput);

    expect(prompt).toContain("PhD Position in AI Safety");
    expect(prompt).toContain("approve");
    expect(prompt).toContain("needs_crowd");
    expect(prompt).toContain("reject");
  });

  test("builds an OpenAI Responses request with structured JSON output", () => {
    expect(buildOpenAIModerationRequest(moderationInput, "gpt-test")).toMatchObject({
      model: "gpt-test",
      text: {
        format: {
          type: "json_schema",
          name: "post_moderation_decision",
          strict: true,
        },
      },
    });
  });

  test("parses structured AI moderation output into the internal decision shape", () => {
    const decision = parseAIModerationResponse({
      output_text: JSON.stringify({
        decision: "approve",
        confidence: 91,
        reasons: ["academic_opportunity", "source_url_present"],
      }),
    });

    expect(decision).toEqual({
      decision: "approve",
      confidence: 91,
      reasons: ["academic_opportunity", "source_url_present"],
    });
  });

  test("routes malformed AI output to crowd review instead of publishing", () => {
    expect(parseAIModerationResponse({ output_text: "not json" })).toMatchObject({
      decision: "needs_crowd",
      confidence: 0,
      reasons: ["ai_parse_failed"],
    });
  });
});
