import { setCache } from "../db/cache";

const UAE_LOCATIONS = [
  { name: "Dubai", lat: 25.25, lng: 55.36 },
  { name: "Abu Dhabi", lat: 24.45, lng: 54.65 },
  { name: "Sharjah", lat: 25.33, lng: 55.52 },
  { name: "Al Ain", lat: 24.22, lng: 55.77 },
];

interface WeatherZone {
  center: [number, number];
  radius: number;
  type: "rain" | "thunder" | "wind";
  severity: "low" | "moderate" | "high";
  location: string;
}

export async function collectWeather(): Promise<void> {
  try {
    const zones: WeatherZone[] = [];
    const conditions: { location: string; temp: number; humidity: number; windSpeed: number; precipitation: number; weatherCode: number }[] = [];

    for (const loc of UAE_LOCATIONS) {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&hourly=precipitation_probability,weather_code&forecast_days=1&timezone=Asia/Dubai`;

      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      const current = data.current;

      conditions.push({
        location: loc.name,
        temp: current.temperature_2m,
        humidity: current.relative_humidity_2m,
        windSpeed: current.wind_speed_10m,
        precipitation: current.precipitation,
        weatherCode: current.weather_code,
      });

      // Determine weather zone type and severity from WMO weather codes
      const code = current.weather_code;
      let type: "rain" | "thunder" | "wind" | null = null;
      let severity: "low" | "moderate" | "high" = "low";

      if (code >= 95) {
        type = "thunder";
        severity = code >= 99 ? "high" : "moderate";
      } else if (code >= 61) {
        type = "rain";
        severity = code >= 67 ? "high" : code >= 63 ? "moderate" : "low";
      } else if (code >= 51) {
        type = "rain";
        severity = "low";
      } else if (current.wind_speed_10m > 40) {
        type = "wind";
        severity = current.wind_speed_10m > 60 ? "high" : "moderate";
      }

      if (type) {
        zones.push({
          center: [loc.lat, loc.lng],
          radius: severity === "high" ? 25000 : severity === "moderate" ? 20000 : 15000,
          type,
          severity,
          location: loc.name,
        });
      }
    }

    await setCache("weather", { zones, conditions, locationCount: UAE_LOCATIONS.length }, 600);
    console.log(`[weather] Collected ${zones.length} weather zones, ${conditions.length} conditions`);
  } catch (err) {
    console.error("[weather] Collection failed:", err);
  }
}
