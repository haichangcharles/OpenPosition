import type { SourceCandidate } from "./types";

type XTweet = {
  id: string;
  text: string;
  author_id?: string;
  created_at?: string;
};

type XRecentSearchResponse = {
  data?: XTweet[];
  meta?: {
    next_token?: string;
  };
};

export function buildXRecentSearchUrl(query: string, paginationToken?: string) {
  const url = new URL("https://api.x.com/2/tweets/search/recent");
  url.searchParams.set("query", query);
  url.searchParams.set("max_results", "100");
  url.searchParams.set("tweet.fields", "created_at,author_id,entities,lang");
  url.searchParams.set("expansions", "author_id");
  url.searchParams.set("user.fields", "name,username,verified");
  if (paginationToken) {
    url.searchParams.set("pagination_token", paginationToken);
  }
  return url;
}

export function normalizeXTweet(tweet: XTweet): SourceCandidate {
  const text = tweet.text.trim();
  return {
    source: "X",
    externalId: tweet.id,
    originalUrl: `https://x.com/i/web/status/${tweet.id}`,
    originalText: text,
    title: text.length > 120 ? `${text.slice(0, 117)}...` : text,
    authorExternalId: tweet.author_id,
    createdAt: tweet.created_at,
  };
}

export async function fetchXRecentCandidates(input: {
  bearerToken: string;
  query: string;
  paginationToken?: string;
}) {
  const response = await fetch(buildXRecentSearchUrl(input.query, input.paginationToken), {
    headers: {
      Authorization: `Bearer ${input.bearerToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`X recent search failed (${response.status}): ${await response.text()}`);
  }

  const payload = (await response.json()) as XRecentSearchResponse;
  return {
    candidates: (payload.data ?? []).map(normalizeXTweet),
    nextToken: payload.meta?.next_token,
  };
}
