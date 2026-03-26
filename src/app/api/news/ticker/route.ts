import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cached = await getCachedData("news");
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
