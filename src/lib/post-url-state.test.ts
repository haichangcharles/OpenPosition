import { describe, expect, test } from "vitest";
import { clearSelectedPostId, getSelectedPostId, setSelectedPostId } from "./post-url-state";

describe("post URL state", () => {
  test("clears only the selected post id while preserving filters", () => {
    const params = new URLSearchParams("id=1&type=PhD+Student&q=robotics");

    expect(clearSelectedPostId(params).toString()).toBe("type=PhD+Student&q=robotics");
  });

  test("sets the selected post id without dropping existing filters", () => {
    const params = new URLSearchParams("type=PostDoc&q=nlp");

    expect(setSelectedPostId(params, 9).toString()).toBe("type=PostDoc&q=nlp&id=9");
  });

  test("parses selected post id only when it is numeric", () => {
    expect(getSelectedPostId(new URLSearchParams("id=12"))).toBe(12);
    expect(getSelectedPostId(new URLSearchParams("id=abc"))).toBeNull();
    expect(getSelectedPostId(new URLSearchParams(""))).toBeNull();
  });
});
