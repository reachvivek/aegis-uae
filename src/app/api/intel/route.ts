import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cached = await getCachedData("intel");
    if (!cached) {
      return NextResponse.json({ developments: [], totalArticles: 0 }, { headers: { "Cache-Control": "public, max-age=900" } });
    }
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, max-age=900", "X-Fetched-At": cached.fetchedAt },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch intel" }, { status: 500 });
  }
}
