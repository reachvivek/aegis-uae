import { getDb } from "../db/client";
import { setCache } from "../db/cache";

export async function processThreats(): Promise<void> {
  try {
    const db = getDb();

    // Read all threat events from last 7 days
    const result = await db.execute({
      sql: `SELECT * FROM events WHERE timestamp > datetime('now', '-7 days') ORDER BY timestamp DESC LIMIT 50`,
      args: [],
    });

    const events = result.rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      type: row.type,
      headline: row.headline,
      detail: row.detail,
      source: row.source,
      sentiment: row.sentiment,
      region: row.region,
    }));

    // Compute threat stats by time range
    const now = Date.now();
    const ranges = {
      "24h": 24 * 3600 * 1000,
      "48h": 48 * 3600 * 1000,
      "7d": 7 * 24 * 3600 * 1000,
    };

    const stats: Record<string, any> = {};
    for (const [range, ms] of Object.entries(ranges)) {
      const cutoff = new Date(now - ms).toISOString();
      const rangeEvents = events.filter((e) => (e.timestamp as string) > cutoff);
      const missiles = rangeEvents.filter((e) => e.type === "missile");
      const drones = rangeEvents.filter((e) => e.type === "drone");

      stats[range] = {
        total: rangeEvents.length,
        missiles: missiles.length,
        drones: drones.length,
        escalations: rangeEvents.filter((e) => e.sentiment === "escalation").length,
      };
    }

    await setCache("threats", { events, stats }, 120);
    console.log(`[threats] Processed ${events.length} threat events`);
  } catch (err) {
    console.error("[threats] Processing failed:", err);
  }
}
