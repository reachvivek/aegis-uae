import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cached = await getCachedData("connectivity");
    if (!cached) {
      return NextResponse.json({ routes: [], baselineHealth: 0, airborne: 0 }, { headers: { "Cache-Control": "public, max-age=3600" } });
    }
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, max-age=3600", "X-Fetched-At": cached.fetchedAt },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch connectivity" }, { status: 500 });
  }
}
