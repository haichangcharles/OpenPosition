import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "../server/router.js";
import { createContext } from "../server/context.js";
import { env } from "../server/lib/env.js";
import { createGoogleOAuthCallbackHandler } from "../server/google-auth.js";
import {
  authorizeIngestionRequest,
  ingestPostFromAgent,
} from "../server/ingestion/posts-api.js";
import { Paths } from "../contracts/constants.js";

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.googleOAuthCallback, createGoogleOAuthCallbackHandler());
app.post("/api/ingestion/posts", async (c) => {
  if (!authorizeIngestionRequest(c.req.header("authorization"), env)) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const result = await ingestPostFromAgent(await c.req.json());
    return c.json(result, result.status === "created" ? 201 : 200);
  } catch (error) {
    return c.json(
      { error: "Invalid ingestion payload", details: (error as Error).message },
      400,
    );
  }
});
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("../server/lib/vite.js");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
