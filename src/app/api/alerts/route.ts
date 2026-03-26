import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/turso";
import { processAlerts } from "@worker/processors/alerts";

export const dynamic = "force-dynamic";

const STALE_THRESHOLD_MS = 15 * 60 * 1000; // 15 minutes

function isStale(fetchedAt: string): boolean {
  return Date.now() - new Date(fetchedAt).getTime() > STALE_THRESHOLD_MS;
}

export async function GET() {
  try {
    const cached = await getCachedData("alerts");

    // If no cache or stale, trigger background refresh
    if (!cached || isStale(cached.fetchedAt)) {
      processAlerts().catch((err) => console.error("[alerts] Background refresh failed:", err));
    }

    if (!cached) {
      return NextResponse.json({ alerts: [], count: 0 }, { headers: { "Cache-Control": "public, max-age=10" } });
    }
    const alerts = Array.isArray(cached.data) ? cached.data : cached.data?.alerts || [];
    return NextResponse.json({ alerts, count: alerts.length }, {
      headers: { "Cache-Control": "public, max-age=10", "X-Fetched-At": cached.fetchedAt },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
