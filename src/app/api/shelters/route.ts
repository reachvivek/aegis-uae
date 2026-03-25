import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cached = await getCachedData("shelters");
    if (!cached) {
      return NextResponse.json({ shelters: [], count: 0 }, { headers: { "Cache-Control": "public, max-age=86400" } });
    }
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, max-age=86400", "X-Fetched-At": cached.fetchedAt },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch shelters" }, { status: 500 });
  }
}
