import { NextResponse } from "next/server";
import { getDb } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, path, referrer, userAgent, sessionId, target, meta } = body;
    const db = getDb();
    const now = new Date().toISOString();

    if (type === "pageview") {
      // Parse device from user agent
      const ua = (userAgent || "").toLowerCase();
      const device = ua.includes("mobile") ? "mobile" : ua.includes("tablet") ? "tablet" : "desktop";

      await db.execute({
        sql: `INSERT INTO page_views (path, referrer, user_agent, device, session_id, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [path || "/", referrer || "", userAgent || "", device, sessionId || "", now],
      });
    } else if (type === "interaction") {
      await db.execute({
        sql: `INSERT INTO interactions (type, target, meta, session_id, created_at) VALUES (?, ?, ?, ?, ?)`,
        args: [target || "unknown", meta || "", JSON.stringify(body.data || {}), sessionId || "", now],
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[track]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
