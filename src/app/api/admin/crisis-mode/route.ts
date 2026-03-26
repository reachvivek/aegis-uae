import { NextResponse } from "next/server";
import { getDb } from "@/lib/turso";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const authKey = request.headers.get("x-admin-key");
  const adminKey = process.env.ADMIN_KEY || "aegis2026";
  return authKey === adminKey;
}

// GET - read current crisis mode state
export async function GET() {
  try {
    const db = getDb();
    const result = await db.execute("SELECT data FROM data_cache WHERE key = 'crisis_mode'");
    if (result.rows.length === 0) {
      return NextResponse.json({ active: false }, { headers: { "Cache-Control": "no-store" } });
    }
    const data = JSON.parse(result.rows[0].data as string);
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ active: false }, { headers: { "Cache-Control": "no-store" } });
  }
}

// POST - toggle crisis mode on/off
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { active } = await request.json();
    const db = getDb();
    const now = new Date().toISOString();

    const payload = JSON.stringify({ active: !!active, activatedAt: active ? now : null });

    await db.execute({
      sql: `INSERT OR REPLACE INTO data_cache (key, data, fetched_at, ttl_seconds) VALUES (?, ?, ?, ?)`,
      args: ["crisis_mode", payload, now, 86400],
    });

    // Notify SSE so dashboard picks it up immediately
    await db.execute({
      sql: "INSERT INTO change_log (channel, changed_at) VALUES (?, ?)",
      args: ["crisis_mode", now],
    });

    return NextResponse.json({ ok: true, active: !!active });
  } catch (err: any) {
    console.error("[admin/crisis-mode POST]", err);
    return NextResponse.json({ error: "Failed to update crisis mode" }, { status: 500 });
  }
}
