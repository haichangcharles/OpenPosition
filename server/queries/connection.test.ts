import { describe, expect, test } from "vitest";
import { buildPostgresOptions } from "./connection.js";

describe("database connection options", () => {
  test("limits postgres-js connections for serverless pooled databases", () => {
    expect(buildPostgresOptions()).toMatchObject({
      max: 1,
      idle_timeout: 10,
      connect_timeout: 10,
      prepare: false,
    });
  });
});
