import { getDb } from "./client";

export async function getCache(key: string): Promise<{ data: any; fetchedAt: string } | null> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT data, fetched_at, ttl_seconds FROM data_cache WHERE key = ?",
    args: [key],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    data: JSON.parse(row.data as string),
    fetchedAt: row.fetched_at as string,
  };
}

export async function getCacheIfFresh(key: string): Promise<{ data: any; fetchedAt: string } | null> {
  const db = getDb();
  const result = await db.execute({
    sql: `SELECT data, fetched_at, ttl_seconds FROM data_cache WHERE key = ?
          AND datetime(fetched_at, '+' || ttl_seconds || ' seconds') > datetime('now')`,
    args: [key],
  });

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    data: JSON.parse(row.data as string),
    fetchedAt: row.fetched_at as string,
  };
}

export async function setCache(key: string, data: any, ttlSeconds: number = 300): Promise<void> {
  const db = getDb();
  const now = new Date().toISOString();
  const json = JSON.stringify(data);

  await db.execute({
    sql: `INSERT OR REPLACE INTO data_cache (key, data, fetched_at, ttl_seconds)
          VALUES (?, ?, ?, ?)`,
    args: [key, json, now, ttlSeconds],
  });

  // Log the change for SSE
  await db.execute({
    sql: "INSERT INTO change_log (channel, changed_at) VALUES (?, ?)",
    args: [key, now],
  });
}

export async function getLatestChanges(sinceId: number): Promise<{ id: number; channel: string; changedAt: string }[]> {
  const db = getDb();
  const result = await db.execute({
    sql: "SELECT id, channel, changed_at FROM change_log WHERE id > ? ORDER BY id ASC LIMIT 50",
    args: [sinceId],
  });

  return result.rows.map((row) => ({
    id: row.id as number,
    channel: row.channel as string,
    changedAt: row.changed_at as string,
  }));
}

// Cleanup old change_log entries (keep last 1000)
export async function pruneChangeLog(): Promise<void> {
  const db = getDb();
  await db.execute({
    sql: `DELETE FROM change_log WHERE id < (
      SELECT COALESCE(MAX(id) - 1000, 0) FROM change_log
    )`,
    args: [],
  });
}
