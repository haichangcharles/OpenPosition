import { z } from "zod";
import type { AutoModerationDecision } from "./auto-review";

export type AIModerationInput = {
  title: string;
  summary: string;
  originalText: string;
  tags: string;
  originalUrl: string;
  source: "LinkedIn" | "X" | "RedBook" | "Other";
};

const aiDecisionSchema = z.object({
  decision: z.enum(["approve", "reject", "needs_crowd"]),
  confidence: z.number().min(0).max(100),
  reasons: z.array(z.string()).min(1),
});

export function buildAIModerationPrompt(input: AIModerationInput) {
  return [
    "You are moderating an academic opportunity marketplace post.",
    "Decide whether this should be published, rejected, or routed to community review.",
    "",
    "Decision rubric:",
    "- approve: real academic position or research collaboration with credible source context.",
    "- reject: spam, scam, adult content, unrelated commercial offer, or clearly unsafe content.",
    "- needs_crowd: relevant but weak evidence, missing context, duplicate risk, stale risk, or uncertainty.",
    "",
    "Return only JSON that matches the provided schema.",
    "",
    `Title: ${input.title}`,
    `Source: ${input.source}`,
    `Original URL: ${input.originalUrl}`,
    `Summary: ${input.summary}`,
    `Tags: ${input.tags}`,
    `Original text: ${input.originalText}`,
  ].join("\n");
}

export function buildOpenAIModerationRequest(input: AIModerationInput, model: string) {
  return {
    model,
    input: [
      {
        role: "user",
        content: buildAIModerationPrompt(input),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "post_moderation_decision",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            decision: {
              type: "string",
              enum: ["approve", "reject", "needs_crowd"],
            },
            confidence: {
              type: "number",
              minimum: 0,
              maximum: 100,
            },
            reasons: {
              type: "array",
              minItems: 1,
              items: { type: "string" },
            },
          },
          required: ["decision", "confidence", "reasons"],
        },
      },
    },
  };
}

function extractOutputText(response: unknown) {
  if (typeof response === "object" && response !== null && "output_text" in response) {
    const outputText = (response as { output_text?: unknown }).output_text;
    return typeof outputText === "string" ? outputText : "";
  }
  return "";
}

export function parseAIModerationResponse(response: unknown): AutoModerationDecision {
  try {
    const parsed = aiDecisionSchema.parse(JSON.parse(extractOutputText(response)));
    return {
      decision: parsed.decision,
      confidence: Math.round(parsed.confidence),
      reasons: parsed.reasons,
    };
  } catch {
    return {
      decision: "needs_crowd",
      confidence: 0,
      reasons: ["ai_parse_failed"],
    };
  }
}

export async function evaluatePostWithOpenAI(
  input: AIModerationInput,
  options: {
    apiKey: string;
    model: string;
    fetchImpl?: typeof fetch;
  },
): Promise<AutoModerationDecision> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const response = await fetchImpl("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.apiKey}`,
    },
    body: JSON.stringify(buildOpenAIModerationRequest(input, options.model)),
  });

  if (!response.ok) {
    return {
      decision: "needs_crowd",
      confidence: 0,
      reasons: ["ai_request_failed"],
    };
  }

  return parseAIModerationResponse(await response.json());
}
