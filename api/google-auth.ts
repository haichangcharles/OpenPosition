import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import { env } from "./lib/env.js";
import { getSessionCookieOptions } from "./lib/cookies.js";
import { Session } from "../contracts/constants.js";
import { signSessionToken } from "./session.js";
import { upsertUser } from "./queries/users.js";

async function exchangeGoogleCode(
  code: string,
  redirectUri: string,
): Promise<{ idToken: string; accessToken: string }> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: env.googleClientId,
    client_secret: env.googleClientSecret,
    redirect_uri: redirectUri,
  });

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Google token exchange failed (${resp.status}): ${text}`);
  }

  const data = (await resp.json()) as {
    access_token: string;
    id_token: string;
  };
  return { idToken: data.id_token, accessToken: data.access_token };
}

function parseGoogleIdToken(idToken: string) {
  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid Google ID token format");
  }
  const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
  return {
    sub: payload.sub as string,
    email: payload.email as string,
    name: payload.name as string,
    picture: payload.picture as string,
  };
}

export function createGoogleOAuthCallbackHandler() {
  return async (c: Context) => {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const error = c.req.query("error");

    if (error) {
      return c.redirect("/login", 302);
    }

    if (!code || !state) {
      return c.json({ error: "code and state are required" }, 400);
    }

    if (!env.googleClientId || !env.googleClientSecret) {
      return c.json(
        { error: "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment." },
        500,
      );
    }

    try {
      const redirectUri = atob(state);
      const { idToken } = await exchangeGoogleCode(code, redirectUri);
      const googleUser = parseGoogleIdToken(idToken);

      const unionId = `google_${googleUser.sub}`;

      await upsertUser({
        unionId,
        name: googleUser.name,
        email: googleUser.email,
        avatar: googleUser.picture,
        lastSignInAt: new Date(),
      });

      const token = await signSessionToken({
        unionId,
        clientId: env.googleClientId,
      });

      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, token, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1000,
      });

      return c.redirect("/", 302);
    } catch (error) {
      console.error("[Google OAuth] Callback failed", error);
      return c.json(
        { error: "Google OAuth callback failed", details: (error as Error).message },
        500,
      );
    }
  };
}
