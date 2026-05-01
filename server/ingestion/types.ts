import type { Source } from "../../src/types/index.js";

export type SourceCandidate = {
  source: Source;
  externalId: string;
  originalUrl: string;
  originalText: string;
  title: string;
  authorName?: string;
  authorExternalId?: string;
  createdAt?: string;
};
