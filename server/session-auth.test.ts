import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock("./queries/users", () => ({
  findUserByUnionId: vi.fn(async (unionId: string) =>
    unionId === "google_123"
      ? {
          id: 1,
          unionId,
          name: "Google User",
          email: "user@example.com",
          avatar: null,
          role: "user",
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignInAt: new Date(),
        }
      : null,
  ),
}));

describe("session authentication", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("APP_SECRET", "test-secret");
  });

  test("authenticates a Google-backed session without provider-specific OAuth config", async () => {
    const { authenticateRequest } = await import("./session-auth.js");
    const { signSessionToken } = await import("./session.js");
    const token = await signSessionToken({
      unionId: "google_123",
      clientId: "google-client",
    });

    await expect(
      authenticateRequest(new Headers({ cookie: `openposition_sid=${token}` })),
    ).resolves.toMatchObject({
      unionId: "google_123",
      email: "user@example.com",
    });
  });
});
