import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cached = await getCachedData("flights");
    if (!cached) {
      return NextResponse.json({ flights: [], airports: [], airborne: 0 }, { headers: { "Cache-Control": "public, max-age=60" } });
    }
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, max-age=60", "X-Fetched-At": cached.fetchedAt },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch flights" }, { status: 500 });
  }
}
