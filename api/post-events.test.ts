import { describe, expect, test } from "vitest";
import { CLIENT_POST_EVENT_TYPES, SERVER_POST_EVENT_TYPES, parseEventMetadata } from "./post-events";

describe("post event helpers", () => {
  test("separates client-trackable events from server-only events", () => {
    expect(CLIENT_POST_EVENT_TYPES).toEqual([
      "detail_open",
      "source_click",
      "contact_click",
      "search_performed",
      "zero_result_search",
    ]);
    expect(SERVER_POST_EVENT_TYPES).toContain("submit_created");
    expect(SERVER_POST_EVENT_TYPES).toContain("admin_approved");
  });

  test("serializes metadata objects and omits empty metadata", () => {
    expect(parseEventMetadata({ source: "detail" })).toBe('{"source":"detail"}');
    expect(parseEventMetadata()).toBeUndefined();
  });
});
