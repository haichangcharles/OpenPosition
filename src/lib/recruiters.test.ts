import { describe, expect, test } from "vitest";
import { getActiveRecruiters } from "./recruiters";
import type { Post } from "@/types";

function post(input: Partial<Post>): Post {
  return {
    id: input.id ?? 1,
    title: input.title ?? "Test post",
    type: input.type ?? "position",
    positionType: input.positionType ?? "PhD Student",
    domain: input.domain ?? null,
    source: input.source ?? "Other",
    institution: input.institution ?? null,
    location: input.location ?? null,
    authorName: input.authorName ?? "Author",
    authorAffiliation: input.authorAffiliation ?? "Fallback Lab",
    summary: input.summary ?? "Summary",
    originalText: input.originalText ?? "Original text",
    tags: input.tags ?? "",
    originalUrl: input.originalUrl ?? "https://example.com",
    status: input.status ?? "Open for Applications",
    projectStatus: input.projectStatus ?? null,
    deadline: input.deadline ?? null,
    moderationStatus: input.moderationStatus ?? "approved",
    visibilityStatus: input.visibilityStatus ?? "active",
    verifiedStatus: input.verifiedStatus ?? "source_checked",
    submittedAt: input.submittedAt ?? new Date("2026-05-01"),
    approvedAt: input.approvedAt ?? new Date("2026-05-01"),
    approvedBy: input.approvedBy ?? null,
    rejectedAt: input.rejectedAt ?? null,
    rejectedBy: input.rejectedBy ?? null,
    rejectionReason: input.rejectionReason ?? null,
    lastReviewedAt: input.lastReviewedAt ?? new Date("2026-05-01"),
    lastSourceCheckedAt: input.lastSourceCheckedAt ?? new Date("2026-05-01"),
    sourceHash: input.sourceHash ?? null,
    createdAt: input.createdAt ?? new Date("2026-05-01"),
    updatedAt: input.updatedAt ?? new Date("2026-05-01"),
    postedBy: input.postedBy ?? null,
  };
}

describe("getActiveRecruiters", () => {
  test("derives recruiters from real position posts ordered by activity", () => {
    const recruiters = getActiveRecruiters([
      post({ institution: "Abridge", createdAt: new Date("2026-05-01") }),
      post({ institution: "Cohere", createdAt: new Date("2026-04-30") }),
      post({ institution: "Abridge", createdAt: new Date("2026-04-29") }),
      post({ type: "collaborator", institution: "Johns Hopkins University" }),
      post({ institution: null, authorAffiliation: "NJU-LINK Lab" }),
    ]);

    expect(recruiters.map((recruiter) => recruiter.name)).toEqual([
      "Abridge",
      "NJU-LINK Lab",
      "Cohere",
    ]);
    expect(recruiters[0]).toMatchObject({ count: 2, search: "Abridge" });
  });
});
