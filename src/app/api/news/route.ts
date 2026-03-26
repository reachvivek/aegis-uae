import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/turso";
import { collectNews } from "@worker/collectors/news";

export const dynamic = "force-dynamic";

// If news cache is older than 15 minutes, refresh in background
const STALE_THRESHOLD_MS = 15 * 60 * 1000;

export async function GET() {
  try {
    const cached = await getCachedData("news");

    // If no cache or cache is stale, trigger a background refresh
    if (!cached || isStale(cached.fetchedAt)) {
      // Don't await — return stale data now, refresh in background
      collectNews().catch((err) => console.error("[news] Background refresh failed:", err));
    }

    if (!cached) {
      return NextResponse.json({ articles: [] }, { headers: { "Cache-Control": "public, max-age=60" } });
    }

    return NextResponse.json(cached.data, {
      headers: {
        "Cache-Control": "public, max-age=60",
        "X-Fetched-At": cached.fetchedAt,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}

function isStale(fetchedAt: string): boolean {
  const age = Date.now() - new Date(fetchedAt).getTime();
  return age > STALE_THRESHOLD_MS;
}
