import { NextResponse } from "next/server";
import { getDb } from "@/lib/turso";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const authKey = request.headers.get("x-admin-key");
  const adminKey = process.env.ADMIN_KEY || "aegis2026";
  return authKey === adminKey;
}

// Rebuild alerts cache and notify SSE
async function rebuildAlertsCache() {
  const db = getDb();
  const now = new Date().toISOString();
  const result = await db.execute("SELECT * FROM alerts WHERE active = 1 ORDER BY issued_at DESC");
  const alerts = result.rows.map((r) => ({
    id: r.id,
    severity: r.severity,
    category: r.category,
    title: r.title,
    titleAr: r.title_ar || "",
    description: r.description,
    descriptionAr: r.description_ar || "",
    source: r.source,
    regions: r.regions ? (r.regions as string).split(",").map((s: string) => s.trim()) : [],
    issuedAt: r.issued_at,
    expiresAt: r.expires_at,
  }));

  await db.execute({
    sql: `INSERT OR REPLACE INTO data_cache (key, data, fetched_at, ttl_seconds) VALUES (?, ?, ?, ?)`,
    args: ["alerts", JSON.stringify(alerts), now, 60],
  });

  await db.execute({
    sql: "INSERT INTO change_log (channel, changed_at) VALUES (?, ?)",
    args: ["alerts", now],
  });

  return alerts;
}

// GET - list all alerts (active + archived)
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const result = await db.execute("SELECT * FROM alerts ORDER BY issued_at DESC");
    const alerts = result.rows.map((r) => ({
      id: r.id,
      severity: r.severity,
      category: r.category,
      title: r.title,
      titleAr: r.title_ar || "",
      description: r.description,
      descriptionAr: r.description_ar || "",
      source: r.source,
      regions: r.regions,
      issuedAt: r.issued_at,
      expiresAt: r.expires_at,
      active: r.active,
    }));

    return NextResponse.json({ alerts });
  } catch (err: any) {
    console.error("[admin/alert GET]", err);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

// POST - create new alert
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { severity, category, title, titleAr, description, descriptionAr, regions, expiresInHours } = await request.json();

    if (!title || !severity) {
      return NextResponse.json({ error: "title and severity required" }, { status: 400 });
    }

    const db = getDb();
    const id = `manual-${Date.now()}`;
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + (expiresInHours || 24) * 3600 * 1000).toISOString();

    // Ensure Arabic columns exist (safe migration)
    try {
      await db.execute("ALTER TABLE alerts ADD COLUMN title_ar TEXT DEFAULT ''");
    } catch { /* column already exists */ }
    try {
      await db.execute("ALTER TABLE alerts ADD COLUMN description_ar TEXT DEFAULT ''");
    } catch { /* column already exists */ }

    await db.execute({
      sql: `INSERT OR REPLACE INTO alerts (id, severity, category, title, title_ar, description, description_ar, source, regions, issued_at, expires_at, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      args: [id, severity, category || "GENERAL", title, titleAr || "", description || "", descriptionAr || "", "ADMIN", regions || "UAE", now, expiresAt],
    });

    const alerts = await rebuildAlertsCache();
    return NextResponse.json({ ok: true, id, alertCount: alerts.length });
  } catch (err: any) {
    console.error("[admin/alert POST]", err);
    return NextResponse.json({ error: "Failed to push alert" }, { status: 500 });
  }
}

// PATCH - toggle alert active status (archive/restore)
export async function PATCH(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, active } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }

    const db = getDb();
    await db.execute({
      sql: "UPDATE alerts SET active = ? WHERE id = ?",
      args: [active ? 1 : 0, id],
    });

    const alerts = await rebuildAlertsCache();
    return NextResponse.json({ ok: true, alertCount: alerts.length });
  } catch (err: any) {
    console.error("[admin/alert PATCH]", err);
    return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
  }
}
