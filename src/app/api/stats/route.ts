import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [flights, threats, weather] = await Promise.all([
      getCachedData("flights"),
      getCachedData("threats"),
      getCachedData("weather"),
    ]);

    const stats = {
      aviation: {
        airborne: flights?.data?.airborne || 0,
        airports: flights?.data?.airports?.length || 0,
        trackedFlights: flights?.data?.flights?.length || 0,
      },
      defense: {
        totalEvents: threats?.data?.stats?.["24h"]?.total || 0,
        missiles: threats?.data?.stats?.["24h"]?.missiles || 0,
        drones: threats?.data?.stats?.["24h"]?.drones || 0,
        escalations: threats?.data?.stats?.["24h"]?.escalations || 0,
      },
      weather: {
        zones: weather?.data?.zones?.length || 0,
        hasThunder: weather?.data?.zones?.some((z: any) => z.type === "thunder") || false,
        hasRain: weather?.data?.zones?.some((z: any) => z.type === "rain") || false,
      },
    };

    return NextResponse.json(stats, { headers: { "Cache-Control": "public, max-age=30" } });
  } catch {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
