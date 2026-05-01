import { describe, expect, test } from "vitest";
import {
  applyAutoModerationDecision,
  buildAutoModerationReviewData,
  evaluatePostForAutoModeration,
} from "./auto-review.js";

const academicPost = {
  title: "PhD Position in Machine Learning",
  summary: "Fully funded PhD position in trustworthy machine learning.",
  originalText: "Our lab is recruiting a PhD student in AI research with full funding.",
  tags: "Machine Learning,AI,PhD",
  originalUrl: "https://university.edu/lab/phd-position",
};

describe("auto moderation", () => {
  test("auto-approves high-confidence academic opportunities", () => {
    const decision = evaluatePostForAutoModeration(academicPost);

    expect(decision.decision).toBe("approve");
    expect(decision.confidence).toBeGreaterThanOrEqual(80);
    expect(decision.reasons).toContain("academic_keywords");
  });

  test("auto-rejects obvious spam", () => {
    const decision = evaluatePostForAutoModeration({
      title: "Crypto casino bonus",
      summary: "Make money fast with crypto casino bonuses.",
      originalText: "Guaranteed profit casino crypto payday loan offer.",
      tags: "crypto,casino",
      originalUrl: "https://spam.example/promo",
    });

    expect(decision.decision).toBe("reject");
    expect(decision.confidence).toBeGreaterThanOrEqual(90);
    expect(decision.reasons).toContain("spam_keywords");
  });

  test("routes uncertain posts to crowd review", () => {
    const decision = evaluatePostForAutoModeration({
      title: "Looking for people to join",
      summary: "A project needs help.",
      originalText: "Message me if interested.",
      tags: "project",
      originalUrl: "https://example.com/post",
    });

    expect(decision.decision).toBe("needs_crowd");
    expect(decision.confidence).toBeLessThan(80);
  });

  test("maps approval decision to public lifecycle fields", () => {
    expect(applyAutoModerationDecision(evaluatePostForAutoModeration(academicPost))).toMatchObject({
      moderationStatus: "approved",
      visibilityStatus: "active",
      verifiedStatus: "source_checked",
      rejectionReason: null,
    });
  });

  test("builds an auditable review row from the automated decision", () => {
    expect(buildAutoModerationReviewData(99, evaluatePostForAutoModeration(academicPost))).toMatchObject({
      postId: 99,
      reviewerType: "heuristic",
      decision: "approve",
      reason: "academic_keywords, source_url_present",
    });
  });
});
