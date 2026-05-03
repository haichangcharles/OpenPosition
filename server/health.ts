import { posts } from "../db/schema.js";
import { publicPostFilters } from "./post-visibility.js";
import { getDb } from "./queries/connection.js";

type HealthBody =
  | {
      ok: true;
      database: "reachable";
      publicPostsSample: number;
      checkedAt: string;
    }
  | {
      ok: false;
      database: "unreachable";
      message: string;
      checkedAt: string;
    };

export type HealthResponse = {
  status: 200 | 503;
  body: HealthBody;
};

export function authorizeCronRequest(
  authorizationHeader: string | undefined,
  cronSecret: string,
) {
  return Boolean(cronSecret) && authorizationHeader === `Bearer ${cronSecret}`;
}

async function queryPublicPostSampleCount() {
  const rows = await getDb()
    .select({ id: posts.id })
    .from(posts)
    .where(publicPostFilters())
    .limit(1);
  return rows.length;
}

export async function checkDatabaseHealth(
  getPublicPostSampleCount = queryPublicPostSampleCount,
): Promise<HealthResponse> {
  const checkedAt = new Date().toISOString();

  try {
    const publicPostsSample = await getPublicPostSampleCount();
    return {
      status: 200,
      body: {
        ok: true,
        database: "reachable",
        publicPostsSample,
        checkedAt,
      },
    };
  } catch (error) {
    return {
      status: 503,
      body: {
        ok: false,
        database: "unreachable",
        message: error instanceof Error ? error.message : "Database unavailable",
        checkedAt,
      },
    };
  }
}
