import { describe, expect, test } from "vitest";
import { buildXRecentSearchUrl, normalizeXTweet } from "./x";

describe("X ingestion helpers", () => {
  test("builds a recent search URL with academic opportunity fields", () => {
    const url = buildXRecentSearchUrl("PhD position AI", "token-1");

    expect(url.toString()).toContain("https://api.x.com/2/tweets/search/recent");
    expect(url.searchParams.get("query")).toBe("PhD position AI");
    expect(url.searchParams.get("pagination_token")).toBe("token-1");
    expect(url.searchParams.get("max_results")).toBe("100");
    expect(url.searchParams.get("tweet.fields")).toContain("created_at");
    expect(url.searchParams.get("expansions")).toContain("author_id");
  });

  test("normalizes an X tweet into an OpenPosition candidate", () => {
    expect(
      normalizeXTweet({
        id: "123",
        text: "Hiring a PhD student in trustworthy ML. Full funding available.",
        author_id: "u1",
        created_at: "2026-04-29T12:00:00.000Z",
      }),
    ).toMatchObject({
      source: "X",
      externalId: "123",
      originalUrl: "https://x.com/i/web/status/123",
      originalText: "Hiring a PhD student in trustworthy ML. Full funding available.",
      title: "Hiring a PhD student in trustworthy ML. Full funding available.",
    });
  });
});
