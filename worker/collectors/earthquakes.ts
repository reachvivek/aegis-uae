import { setCache } from "../db/cache";

// Gulf region bounding box
const USGS_URL = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=20&maxlatitude=30&minlongitude=48&maxlongitude=60&minmagnitude=2.5&orderby=time&limit=20";

export async function collectEarthquakes(): Promise<void> {
  try {
    const res = await fetch(USGS_URL);
    if (!res.ok) {
      console.warn(`[earthquakes] USGS returned ${res.status}`);
      return;
    }

    const data = await res.json();
    const features = data.features || [];

    const quakes = features.map((f: any) => ({
      id: f.id,
      magnitude: f.properties.mag,
      place: f.properties.place,
      time: new Date(f.properties.time).toISOString(),
      depth: f.geometry.coordinates[2],
      lat: f.geometry.coordinates[1],
      lng: f.geometry.coordinates[0],
      tsunami: f.properties.tsunami === 1,
      significance: f.properties.sig,
      url: f.properties.url,
    }));

    await setCache("earthquakes", { quakes, count: quakes.length }, 900);
    console.log(`[earthquakes] Collected ${quakes.length} earthquakes in Gulf region`);
  } catch (err) {
    console.error("[earthquakes] Collection failed:", err);
  }
}
