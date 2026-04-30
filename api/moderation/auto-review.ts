export type AutoModerationDecision = {
  decision: "approve" | "reject" | "needs_crowd";
  confidence: number;
  reasons: string[];
};

type ModerationInput = {
  title: string;
  summary: string;
  originalText: string;
  tags: string;
  originalUrl: string;
};

const ACADEMIC_KEYWORDS = [
  "phd",
  "postdoc",
  "postdoctoral",
  "research",
  "intern",
  "internship",
  "assistant",
  "fellow",
  "professor",
  "lab",
  "university",
  "machine learning",
  "ai",
  "robotics",
  "nlp",
  "computer vision",
  "co-author",
  "collaboration",
];

const SPAM_KEYWORDS = [
  "casino",
  "crypto",
  "payday",
  "loan",
  "guaranteed profit",
  "betting",
  "forex",
  "adult",
];

function countMatches(text: string, keywords: string[]) {
  return keywords.filter((keyword) => text.includes(keyword)).length;
}

export function evaluatePostForAutoModeration(input: ModerationInput): AutoModerationDecision {
  const text = `${input.title} ${input.summary} ${input.originalText} ${input.tags}`.toLowerCase();
  const reasons: string[] = [];
  const academicMatches = countMatches(text, ACADEMIC_KEYWORDS);
  const spamMatches = countMatches(text, SPAM_KEYWORDS);
  const hasUrl = input.originalUrl.startsWith("http://") || input.originalUrl.startsWith("https://");

  if (spamMatches > 0) {
    return {
      decision: "reject",
      confidence: Math.min(100, 90 + spamMatches * 3),
      reasons: ["spam_keywords"],
    };
  }

  if (academicMatches >= 3 && hasUrl) {
    reasons.push("academic_keywords", "source_url_present");
    return {
      decision: "approve",
      confidence: Math.min(95, 72 + academicMatches * 4),
      reasons,
    };
  }

  if (academicMatches > 0) {
    reasons.push("weak_academic_signal");
  }
  if (!hasUrl) {
    reasons.push("missing_source_url");
  }

  return {
    decision: "needs_crowd",
    confidence: Math.max(30, Math.min(79, 45 + academicMatches * 8)),
    reasons: reasons.length > 0 ? reasons : ["insufficient_signal"],
  };
}

export function applyAutoModerationDecision(decision: AutoModerationDecision) {
  const now = new Date();

  if (decision.decision === "approve") {
    return {
      moderationStatus: "approved" as const,
      visibilityStatus: "active" as const,
      verifiedStatus: "source_checked" as const,
      approvedAt: now,
      approvedBy: null,
      rejectedAt: null,
      rejectedBy: null,
      rejectionReason: null,
      lastReviewedAt: now,
      lastSourceCheckedAt: now,
    };
  }

  if (decision.decision === "reject") {
    return {
      moderationStatus: "rejected" as const,
      visibilityStatus: "hidden" as const,
      verifiedStatus: "unverified" as const,
      approvedAt: null,
      approvedBy: null,
      rejectedAt: now,
      rejectedBy: null,
      rejectionReason: `Automated moderation: ${decision.reasons.join(", ")}`,
      lastReviewedAt: now,
      lastSourceCheckedAt: null,
    };
  }

  return {
    moderationStatus: "pending" as const,
    visibilityStatus: "hidden" as const,
    verifiedStatus: "unverified" as const,
    approvedAt: null,
    approvedBy: null,
    rejectedAt: null,
    rejectedBy: null,
    rejectionReason: null,
    lastReviewedAt: now,
    lastSourceCheckedAt: null,
  };
}

export function buildAutoModerationReviewData(
  postId: number,
  decision: AutoModerationDecision,
  reviewerType: "heuristic" | "ai" = "heuristic",
) {
  return {
    postId,
    reviewerType,
    decision: decision.decision,
    confidence: decision.confidence,
    reason: decision.reasons.join(", "),
    metadata: JSON.stringify({ reasons: decision.reasons }),
  };
}
