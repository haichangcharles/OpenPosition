import { describe, expect, test } from "vitest";
import { buildGoogleOAuthUrl } from "./Login.js";

describe("Google login URL", () => {
  test("requires a Google client id before redirecting to Google", () => {
    expect(() => buildGoogleOAuthUrl("", "http://localhost:3000")).toThrow(
      "VITE_GOOGLE_CLIENT_ID is not configured",
    );
  });

  test("builds an OAuth URL with the local callback redirect URI", () => {
    const url = new URL(buildGoogleOAuthUrl("google-client", "http://localhost:3000"));

    expect(url.origin).toBe("https://accounts.google.com");
    expect(url.searchParams.get("client_id")).toBe("google-client");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "http://localhost:3000/api/oauth/google/callback",
    );
    expect(url.searchParams.get("scope")).toBe("openid email profile");
  });
});
