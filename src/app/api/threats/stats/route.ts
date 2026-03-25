import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cached = await getCachedData("threats");
    if (!cached) {
      return NextResponse.json({ "24h": { total: 0 }, "48h": { total: 0 }, "7d": { total: 0 } }, { headers: { "Cache-Control": "public, max-age=15" } });
    }
    return NextResponse.json(cached.data.stats || {}, {
      headers: { "Cache-Control": "public, max-age=15", "X-Fetched-At": cached.fetchedAt },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch threat stats" }, { status: 500 });
  }
}
