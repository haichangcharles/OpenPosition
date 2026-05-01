import type { Post } from "@/types";

export type RecruiterSummary = {
  name: string;
  search: string;
  count: number;
  latestAt: Date;
};

export function getRecruiterName(post: Post) {
  return (post.institution || post.authorAffiliation).trim();
}

export function getActiveRecruiters(posts: Post[], limit = 15): RecruiterSummary[] {
  const byName = new Map<string, RecruiterSummary>();

  for (const post of posts) {
    if (post.type !== "position") continue;

    const name = getRecruiterName(post);
    if (!name) continue;

    const latestAt = new Date(post.createdAt);
    const existing = byName.get(name);

    if (!existing) {
      byName.set(name, {
        name,
        search: name,
        count: 1,
        latestAt,
      });
      continue;
    }

    existing.count += 1;
    if (latestAt.getTime() > existing.latestAt.getTime()) {
      existing.latestAt = latestAt;
    }
  }

  return [...byName.values()]
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.latestAt.getTime() - a.latestAt.getTime();
    })
    .slice(0, limit);
}
