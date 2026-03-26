import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/turso";
import { collectWeather } from "@worker/collectors/weather";
import { collectFlights } from "@worker/collectors/flights";
import { processStatus } from "@worker/processors/status";

export const dynamic = "force-dynamic";

const STALE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

function isStale(fetchedAt: string): boolean {
  return Date.now() - new Date(fetchedAt).getTime() > STALE_THRESHOLD_MS;
}

export async function GET() {
  try {
    const cached = await getCachedData("status");

    // If no cache or stale, trigger background refresh (collectors + processor)
    if (!cached || isStale(cached.fetchedAt)) {
      (async () => {
        try {
          await Promise.allSettled([collectWeather(), collectFlights()]);
          await processStatus();
        } catch (err) {
          console.error("[status] Background refresh failed:", err);
        }
      })();
    }

    if (!cached) {
      return NextResponse.json({ items: [], lastSynced: new Date().toISOString() }, { headers: { "Cache-Control": "public, max-age=10" } });
    }
    return NextResponse.json({ ...cached.data, lastSynced: cached.fetchedAt }, {
      headers: { "Cache-Control": "public, max-age=10", "X-Fetched-At": cached.fetchedAt },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}
