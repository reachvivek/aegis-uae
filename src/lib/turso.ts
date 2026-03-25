import { createClient, type Client } from "@libsql/client";

let client: Client | null = null;

export function getDb(): Client {
  if (!client) {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) {
      throw new Error("TURSO_DATABASE_URL is not configured");
    }
    client = createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN || undefined,
    });
  }
  return client;
}

export async function getCachedData(key: string): Promise<{ data: any; fetchedAt: string } | null> {
  try {
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT data, fetched_at FROM data_cache WHERE key = ?",
      args: [key],
    });

    if (result.rows.length === 0) return null;

    return {
      data: JSON.parse(result.rows[0].data as string),
      fetchedAt: result.rows[0].fetched_at as string,
    };
  } catch {
    return null;
  }
}
