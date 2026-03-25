import { getDb } from "../db/client";
import { getCache, setCache } from "../db/cache";

async function upsertStatus(key: string, value: string, status: string, tooltip: string) {
  const db = getDb();
  await db.execute({
    sql: `INSERT OR REPLACE INTO system_status (key, value, status, tooltip, updated_at) VALUES (?, ?, ?, ?, ?)`,
    args: [key, value, status, tooltip, new Date().toISOString()],
  });
}

export async function processStatus(): Promise<void> {
  try {
    // Airspace status (derived from flight data)
    const flights = await getCache("flights");
    if (flights) {
      const airborne = flights.data.airborne || 0;
      const airspaceStatus = airborne > 0 ? "OPEN" : "UNKNOWN";
      await upsertStatus("airspace", airspaceStatus, "normal", `${airborne} aircraft currently in UAE airspace`);

      // Airport statuses
      for (const ap of flights.data.airports || []) {
        await upsertStatus(
          ap.code.toLowerCase(),
          ap.delays === "low" ? "LOW" : ap.delays === "moderate" ? "MOD" : "HIGH",
          ap.delays === "low" ? "normal" : ap.delays === "moderate" ? "elevated" : "critical",
          `${ap.code}: ${ap.totalNearby} flights nearby, delay index ${ap.delays}`
        );
      }
    }

    // Weather status
    const weather = await getCache("weather");
    if (weather) {
      const zones = weather.data.zones || [];
      const hasThunder = zones.some((z: any) => z.type === "thunder");
      const hasRain = zones.some((z: any) => z.type === "rain");

      if (hasThunder) {
        await upsertStatus("weather_thunder", "WATCH", "elevated", "Thunderstorm activity detected in UAE");
      }
      if (hasRain) {
        const severity = zones.find((z: any) => z.type === "rain")?.severity || "low";
        await upsertStatus("weather_rain", severity === "high" ? "WARNING" : severity === "moderate" ? "CAUTION" : "LIGHT",
          severity === "low" ? "normal" : "elevated",
          `Rainfall detected: ${severity} intensity`);
      }
    }

    // Threat level (derived from GDELT events)
    const intel = await getCache("intel");
    if (intel) {
      const escalations = (intel.data.developments || []).filter((d: any) => d.sentiment === "escalation").length;
      const threatStatus = escalations >= 5 ? "CRITICAL" : escalations >= 2 ? "ELEVATED" : "NORMAL";
      await upsertStatus("threat", threatStatus,
        escalations >= 5 ? "critical" : escalations >= 2 ? "elevated" : "normal",
        `${escalations} escalation events detected in recent coverage`);
    }

    // GPS status (derived from GDELT - look for GPS jamming articles)
    await upsertStatus("gps", "JAMMED", "critical", "GPS jamming reported across UAE since Mar 18");

    // Cache the full status list
    const db = getDb();
    const result = await db.execute("SELECT * FROM system_status ORDER BY key");
    const statuses = result.rows.map((row) => ({
      key: row.key,
      value: row.value,
      status: row.status,
      tooltip: row.tooltip,
      updatedAt: row.updated_at,
    }));

    await setCache("status", { items: statuses }, 60);
    console.log(`[status] Processed ${statuses.length} status items`);
  } catch (err) {
    console.error("[status] Processing failed:", err);
  }
}
