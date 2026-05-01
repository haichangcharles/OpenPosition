import { postEvents } from "../db/schema.js";
import { getDb } from "./queries/connection.js";

export const CLIENT_POST_EVENT_TYPES = [
  "detail_open",
  "page_view",
  "source_click",
  "contact_click",
  "search_performed",
  "zero_result_search",
] as const;

export const SERVER_POST_EVENT_TYPES = [
  "report_created",
  "submit_created",
  "admin_approved",
  "admin_rejected",
  "admin_expired",
  "crowd_vote_created",
  "crowd_approved",
  "crowd_rejected",
  "report_resolved",
] as const;

export type ClientPostEventType = (typeof CLIENT_POST_EVENT_TYPES)[number];
export type ServerPostEventType = (typeof SERVER_POST_EVENT_TYPES)[number];
export type PostEventType = ClientPostEventType | ServerPostEventType;

export function parseEventMetadata(metadata?: Record<string, unknown>) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return undefined;
  }
  return JSON.stringify(metadata);
}

type RecordPostEventInput = {
  postId?: number;
  userId?: number;
  anonymousId?: string;
  eventType: PostEventType;
  metadata?: Record<string, unknown>;
};

export async function recordPostEvent(input: RecordPostEventInput) {
  await getDb().insert(postEvents).values({
    postId: input.postId,
    userId: input.userId,
    anonymousId: input.anonymousId,
    eventType: input.eventType,
    metadata: parseEventMetadata(input.metadata),
  });
}
