import { NextResponse } from "next/server";
import { getDb } from "@/lib/turso";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const authKey = request.headers.get("x-admin-key");
  const adminKey = process.env.ADMIN_KEY || "aegis2026";
  return authKey === adminKey;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { severity, category, title, description, regions, expiresInHours } = await request.json();

    if (!title || !severity) {
      return NextResponse.json({ error: "title and severity required" }, { status: 400 });
    }

    const db = getDb();
    const id = `manual-${Date.now()}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + (expiresInHours || 24) * 3600 * 1000).toISOString();

    // Insert into alerts table
    await db.execute({
      sql: `INSERT OR REPLACE INTO alerts (id, severity, category, title, description, source, regions, issued_at, expires_at, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      args: [id, severity, category || "GENERAL", title, description || "", "ADMIN", regions || "UAE", now, expiresAt],
    });

    // Also update data_cache for alerts so SSE/SWR picks it up immediately
    const result = await db.execute("SELECT * FROM alerts WHERE active = 1 ORDER BY issued_at DESC");
    const alerts = result.rows.map((r) => ({
      id: r.id,
      severity: r.severity,
      category: r.category,
      title: r.title,
      description: r.description,
      source: r.source,
      regions: r.regions ? (r.regions as string).split(",").map((s: string) => s.trim()) : [],
      issuedAt: r.issued_at,
      expiresAt: r.expires_at,
    }));

    await db.execute({
      sql: `INSERT OR REPLACE INTO data_cache (key, data, fetched_at, ttl_seconds) VALUES (?, ?, ?, ?)`,
      args: ["alerts", JSON.stringify(alerts), now, 60],
    });

    // Log change for SSE
    await db.execute({
      sql: "INSERT INTO change_log (channel, changed_at) VALUES (?, ?)",
      args: ["alerts", now],
    });

    return NextResponse.json({ ok: true, id, alertCount: alerts.length });
  } catch (err: any) {
    console.error("[admin/alert]", err);
    return NextResponse.json({ error: "Failed to push alert" }, { status: 500 });
  }
}
