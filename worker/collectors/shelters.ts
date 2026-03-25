import { getDb } from "../db/client";
import { setCache } from "../db/cache";

// Overpass API query for shelters, bunkers, civil defense in UAE
const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const OVERPASS_QUERY = `
[out:json][timeout:30];
area["ISO3166-1"="AE"]->.uae;
(
  node["emergency"="assembly_point"](area.uae);
  node["amenity"="shelter"](area.uae);
  node["bunker_type"](area.uae);
  node["amenity"="hospital"](area.uae);
  way["amenity"="hospital"](area.uae);
);
out center 100;
`;

export async function collectShelters(): Promise<void> {
  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(OVERPASS_QUERY)}`,
    });

    if (!res.ok) {
      console.warn(`[shelters] Overpass returned ${res.status}`);
      return;
    }

    const data = await res.json();
    const elements = data.elements || [];

    const db = getDb();
    let count = 0;

    for (const el of elements) {
      const lat = el.lat || el.center?.lat;
      const lng = el.lon || el.center?.lon;
      if (!lat || !lng) continue;

      const tags = el.tags || {};
      const name = tags.name || tags["name:en"] || tags.amenity || "Unknown Shelter";
      const type = tags.bunker_type ? "bunker" :
        tags.emergency === "assembly_point" ? "civil_defense" :
        tags.amenity === "hospital" ? "hospital" :
        tags.amenity === "shelter" ? "underground" : "civil_defense";

      const id = `osm-${el.id}`;
      const amenities = [];
      if (tags.drinking_water === "yes") amenities.push("water");
      if (tags.healthcare || tags.amenity === "hospital") amenities.push("medical");
      if (tags.power_supply === "yes") amenities.push("power");

      await db.execute({
        sql: `INSERT OR REPLACE INTO shelters (id, name, type, lat, lng, capacity, amenities, last_verified)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, name, type, lat, lng, tags.capacity ? parseInt(tags.capacity) : null, JSON.stringify(amenities), new Date().toISOString()],
      });
      count++;
    }

    // Also cache the full list for quick reads
    const result = await db.execute("SELECT * FROM shelters ORDER BY name");
    const shelters = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      type: row.type,
      lat: row.lat,
      lng: row.lng,
      capacity: row.capacity,
      amenities: JSON.parse((row.amenities as string) || "[]"),
      lastVerified: row.last_verified,
    }));

    await setCache("shelters", { shelters, count: shelters.length }, 86400);
    console.log(`[shelters] Collected ${count} shelters from OSM`);
  } catch (err) {
    console.error("[shelters] Collection failed:", err);
  }
}
