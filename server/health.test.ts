import { describe, expect, test } from "vitest";
import { authorizeCronRequest, checkDatabaseHealth } from "./health.js";

describe("health checks", () => {
  test("authorizes cron keepalive requests with the configured bearer token", () => {
    expect(authorizeCronRequest("Bearer cron-secret", "cron-secret")).toBe(true);
    expect(authorizeCronRequest("Bearer wrong", "cron-secret")).toBe(false);
    expect(authorizeCronRequest(undefined, "cron-secret")).toBe(false);
  });

  test("reports a reachable database", async () => {
    await expect(checkDatabaseHealth(async () => 69)).resolves.toMatchObject({
      status: 200,
      body: {
        ok: true,
        database: "reachable",
        publicPostsSample: 69,
      },
    });
  });

  test("reports an unavailable database without throwing", async () => {
    await expect(
      checkDatabaseHealth(async () => {
        throw new Error("database is sleeping");
      }),
    ).resolves.toMatchObject({
      status: 503,
      body: {
        ok: false,
        database: "unreachable",
        message: "database is sleeping",
      },
    });
  });
});
