import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Evacuation routes are derived from flights + connectivity data
    const [flights, connectivity] = await Promise.all([
      getCachedData("flights"),
      getCachedData("connectivity"),
    ]);

    const routes = (connectivity?.data?.routes || []).map((route: any) => ({
      from: route.from,
      to: route.to,
      city: route.city,
      stability: route.stability,
      trend: route.trend,
      available: route.stability > 60,
    }));

    return NextResponse.json(
      { routes, airborne: flights?.data?.airborne || 0 },
      { headers: { "Cache-Control": "public, max-age=1800" } }
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch evacuation data" }, { status: 500 });
  }
}
