import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const cached = await getCachedData("news");
    if (!cached) {
      return NextResponse.json({ articles: [] }, { headers: { "Cache-Control": "public, max-age=300" } });
    }
    return NextResponse.json(cached.data, {
      headers: { "Cache-Control": "public, max-age=300", "X-Fetched-At": cached.fetchedAt },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
