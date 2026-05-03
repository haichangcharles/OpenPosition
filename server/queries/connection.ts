import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env.js";
import * as schema from "../../db/schema.js";
import * as relations from "../../db/relations.js";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;
let client: postgres.Sql | undefined;

export function buildPostgresOptions() {
  return {
    max: 1,
    idle_timeout: 10,
    connect_timeout: 10,
    prepare: false,
  };
}

export function getDb() {
  if (!instance) {
    client = postgres(env.databaseUrl, buildPostgresOptions());
    instance = drizzle(client, {
      schema: fullSchema,
    });
  }
  return instance;
}
