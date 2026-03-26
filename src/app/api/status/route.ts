import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cached = await getCachedData("status");
    if (!cached) {
      return NextResponse.json({ items: [] }, { headers: { "Cache-Control": "public, max-age=10" } });
    }
    return NextResponse.json({ ...cached.data, lastSynced: cached.fetchedAt }, {
      headers: { "Cache-Control": "public, max-age=10", "X-Fetched-At": cached.fetchedAt },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
