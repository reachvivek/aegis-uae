import { getDb } from "../db/client";
import { getCache, setCache } from "../db/cache";

export async function processAlerts(): Promise<void> {
  try {
    const db = getDb();

    // Expire old alerts
    await db.execute({
      sql: "UPDATE alerts SET active = 0 WHERE expires_at < datetime('now') AND active = 1",
      args: [],
    });

    // Generate alerts from weather data
    const weather = await getCache("weather");
    if (weather) {
      for (const zone of weather.data.zones || []) {
        const id = `weather-${zone.location}-${zone.type}`;
        const severity = zone.severity === "high" ? "critical" : zone.severity === "moderate" ? "warning" : "advisory";
        const title = `${zone.type === "thunder" ? "Thunderstorm" : zone.type === "rain" ? "Rainfall" : "Wind"} ${severity === "critical" ? "Warning" : severity === "warning" ? "Watch" : "Advisory"} - ${zone.location}`;

        await db.execute({
          sql: `INSERT OR REPLACE INTO alerts (id, severity, category, title, description, source, regions, issued_at, expires_at, active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          args: [id, severity, "WEATHER", title, `Weather conditions: ${zone.type} with ${zone.severity} intensity in ${zone.location}`, "Open-Meteo", JSON.stringify([zone.location]), new Date().toISOString(), new Date(Date.now() + 6 * 3600 * 1000).toISOString()],
        });
      }
    }

    // Generate alerts from earthquake data
    // Only for quakes M3.5+ within ~500km of UAE center (24.5, 54.5)
    const UAE_CENTER_LAT = 24.5;
    const UAE_CENTER_LNG = 54.5;
    const MAX_DISTANCE_KM = 500;

    function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
      const toRad = (d: number) => (d * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLng = toRad(lng2 - lng1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
      return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    const quakes = await getCache("earthquakes");
    if (quakes) {
      const relevantQuakes = (quakes.data.quakes || []).filter((q: any) =>
        q.magnitude >= 3.5 && haversineKm(UAE_CENTER_LAT, UAE_CENTER_LNG, q.lat, q.lng) <= MAX_DISTANCE_KM
      );

      for (const q of relevantQuakes) {
        const id = `quake-${q.id}`;
        const severity = q.magnitude >= 6.0 ? "critical" : q.magnitude >= 5.0 ? "warning" : "advisory";

        await db.execute({
          sql: `INSERT OR IGNORE INTO alerts (id, severity, category, title, description, source, regions, issued_at, expires_at, active)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          args: [id, severity, "SEISMIC", `M${q.magnitude} Earthquake - ${q.place}`, `Magnitude ${q.magnitude} at ${q.depth}km depth`, "USGS", JSON.stringify([q.place]), q.time, new Date(Date.now() + 24 * 3600 * 1000).toISOString()],
        });
      }
    }

    // Read all active alerts
    const result = await db.execute("SELECT * FROM alerts WHERE active = 1 ORDER BY issued_at DESC LIMIT 20");
    const alerts = result.rows.map((row) => ({
      id: row.id,
      severity: row.severity,
      category: row.category,
      title: row.title,
      description: row.description,
      source: row.source,
      regions: JSON.parse((row.regions as string) || "[]"),
      issuedAt: row.issued_at,
      expiresAt: row.expires_at,
    }));

    await setCache("alerts", { alerts, count: alerts.length }, 60);
    console.log(`[alerts] ${alerts.length} active alerts`);
  } catch (err) {
    console.error("[alerts] Processing failed:", err);
  }
}
