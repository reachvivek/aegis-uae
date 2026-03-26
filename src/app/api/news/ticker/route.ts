import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/turso";
import { collectNews } from "@worker/collectors/news";

export const dynamic = "force-dynamic";

const STALE_THRESHOLD_MS = 15 * 60 * 1000;

export async function GET() {
  try {
    const cached = await getCachedData("news");

    // Auto-refresh stale cache in background
    if (!cached || isStale(cached.fetchedAt)) {
      collectNews().catch((err) => console.error("[news/ticker] Background refresh failed:", err));
    }

    if (!cached) {
      return NextResponse.json({ items: [] }, { headers: { "Cache-Control": "public, max-age=30" } });
    }

    // Extract top 10 headlines for the ticker
    const articles = cached.data.articles || [];
    const items = articles.slice(0, 10).map((a: any) => ({
      headline: a.title,
      source: a.source,
      severity: a.severity || "info",
      timestamp: a.publishedAt || a.pubDate,
      link: a.link || "",
    }));

    return NextResponse.json({ items }, {
      headers: { "Cache-Control": "public, max-age=30", "X-Fetched-At": cached.fetchedAt },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch news ticker" }, { status: 500 });
  }
}

function isStale(fetchedAt: string): boolean {
  const age = Date.now() - new Date(fetchedAt).getTime();
  return age > STALE_THRESHOLD_MS;
}
