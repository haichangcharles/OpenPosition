import { describe, expect, test } from "vitest";
import { getOrCreateAnonymousId } from "./anonymous-id";

function createStorage(initial?: string) {
  const values = new Map<string, string>();
  if (initial) values.set("openposition.anonymousId", initial);
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
  };
}

describe("getOrCreateAnonymousId", () => {
  test("reuses an existing OpenPosition anonymous id", () => {
    expect(getOrCreateAnonymousId(createStorage("op_existing"))).toBe("op_existing");
  });

  test("creates and stores a stable anonymous id", () => {
    const storage = createStorage();
    const id = getOrCreateAnonymousId(storage, () => "abc123");

    expect(id).toBe("op_abc123");
    expect(getOrCreateAnonymousId(storage)).toBe("op_abc123");
  });
});
