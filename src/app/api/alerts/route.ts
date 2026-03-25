import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cached = await getCachedData("alerts");
    if (!cached) {
      return NextResponse.json({ alerts: [], count: 0 }, { headers: { "Cache-Control": "public, max-age=10" } });
    }
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, max-age=10", "X-Fetched-At": cached.fetchedAt },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
