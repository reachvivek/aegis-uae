import { getCache, setCache } from "../db/cache";

// Major routes from UAE - stability derived from flight count proximity
const TRACKED_ROUTES = [
  { from: "DXB", to: "LHR", city: "London" },
  { from: "DXB", to: "DEL", city: "Delhi" },
  { from: "DXB", to: "JFK", city: "New York" },
  { from: "DXB", to: "CDG", city: "Paris" },
  { from: "DXB", to: "BKK", city: "Bangkok" },
  { from: "DXB", to: "IST", city: "Istanbul" },
  { from: "DXB", to: "BEY", city: "Beirut" },
  { from: "AUH", to: "SIN", city: "Singapore" },
  { from: "AUH", to: "ICN", city: "Seoul" },
  { from: "AUH", to: "SYD", city: "Sydney" },
];

export async function processConnectivity(): Promise<void> {
  try {
    const flights = await getCache("flights");
    const airborne = flights?.data?.airborne || 0;

    // Compute a baseline stability score from overall activity
    // More aircraft = healthier airspace
    const baselineHealth = Math.min(100, Math.round((airborne / 200) * 100));

    const routes = TRACKED_ROUTES.map((route) => {
      // Beirut route is restricted (conflict zone)
      if (route.to === "BEY") {
        return { ...route, stability: 42, trend: "down" as const };
      }
      // Istanbul route rerouted (nearby conflict)
      if (route.to === "IST") {
        return { ...route, stability: Math.max(75, baselineHealth - 10), trend: "down" as const };
      }

      // Normal routes - derive from baseline with small variance
      const variance = Math.floor(Math.random() * 8) - 4;
      const stability = Math.min(100, Math.max(80, baselineHealth + variance));
      const trend = stability > 93 ? "up" as const : stability < 88 ? "down" as const : "stable" as const;

      return { ...route, stability, trend };
    });

    await setCache("connectivity", { routes, baselineHealth, airborne }, 3600);
    console.log(`[connectivity] Processed ${routes.length} routes, baseline health: ${baselineHealth}%`);
  } catch (err) {
    console.error("[connectivity] Processing failed:", err);
  }
}
