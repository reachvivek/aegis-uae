import { setCache } from "../db/cache";

// UAE bounding box
const BBOX = { lamin: 22.5, lomin: 51.5, lamax: 26.5, lomax: 56.5 };

const UAE_AIRPORTS = [
  { code: "DXB", name: "Dubai International", lat: 25.2532, lng: 55.3657, icao: "OMDB" },
  { code: "AUH", name: "Abu Dhabi International", lat: 24.4330, lng: 54.6511, icao: "OMAA" },
  { code: "SHJ", name: "Sharjah International", lat: 25.3286, lng: 55.5172, icao: "OMSJ" },
  { code: "DWC", name: "Al Maktoum International", lat: 24.8960, lng: 55.1614, icao: "OMDW" },
];

interface FlightState {
  icao24: string;
  callsign: string;
  origin: string;
  lat: number;
  lng: number;
  altitude: number;
  velocity: number;
  onGround: boolean;
}

export async function collectFlights(): Promise<void> {
  try {
    const url = `https://opensky-network.org/api/states/all?lamin=${BBOX.lamin}&lomin=${BBOX.lomin}&lamax=${BBOX.lamax}&lomax=${BBOX.lomax}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[flights] OpenSky returned ${res.status}`);
      return;
    }

    const data = await res.json();
    const states: FlightState[] = (data.states || []).map((s: any[]) => ({
      icao24: s[0],
      callsign: (s[1] || "").trim(),
      origin: s[2] || "",
      lat: s[6],
      lng: s[5],
      altitude: s[7] || 0,
      velocity: s[9] || 0,
      onGround: s[8],
    }));

    // Count flights near each airport (within ~30km)
    const airportStats = UAE_AIRPORTS.map((ap) => {
      const nearby = states.filter((f) => {
        if (!f.lat || !f.lng) return false;
        const dlat = f.lat - ap.lat;
        const dlng = f.lng - ap.lng;
        return Math.sqrt(dlat * dlat + dlng * dlng) < 0.3; // ~30km
      });

      const airborne = nearby.filter((f) => !f.onGround).length;
      const grounded = nearby.filter((f) => f.onGround).length;

      return {
        ...ap,
        totalNearby: nearby.length,
        airborne,
        grounded,
        delays: nearby.length < 5 ? "low" : nearby.length < 15 ? "moderate" : "high",
      };
    });

    // Create simplified flight paths from active flights
    const flightPaths = states
      .filter((f) => f.lat && f.lng && !f.onGround && f.callsign)
      .slice(0, 50) // Limit to 50 for performance
      .map((f) => ({
        icao24: f.icao24,
        callsign: f.callsign,
        lat: f.lat,
        lng: f.lng,
        altitude: Math.round(f.altitude),
        velocity: Math.round(f.velocity),
        origin: f.origin,
      }));

    await setCache("flights", {
      airports: airportStats,
      activeFlight: states.length,
      airborne: states.filter((f) => !f.onGround).length,
      flightPaths,
      timestamp: data.time,
    }, 300);

    console.log(`[flights] ${states.length} aircraft in UAE airspace, ${airportStats.length} airports tracked`);
  } catch (err) {
    console.error("[flights] Collection failed:", err);
  }
}
