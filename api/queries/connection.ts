import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../lib/env.js";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;
let client: postgres.Sql | undefined;

export function getDb() {
  if (!instance) {
    client = postgres(env.databaseUrl, {
      prepare: false,
    });
    instance = drizzle(client, {
      schema: fullSchema,
    });
  }
  return instance;
}
