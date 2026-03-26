import { NextResponse } from "next/server";
import { getDb } from "@/lib/turso";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const authKey = request.headers.get("x-admin-key");
  const adminKey = process.env.ADMIN_KEY || "aegis2026";
  return authKey === adminKey;
}

const DEFAULT_CONFIG = {
  tone: "Warm, direct, and reassuring. Like a smart friend who works in security. Never robotic. Never bureaucratic.",
  responseStyle: "Lead with empathy or a direct answer first. Give 2-3 key facts. Recommend specific actions. Keep it to 3-4 short paragraphs max.",
  bannedTopics: "Politics, religion, personal opinions on government policy",
  customRules: "If someone is scared, acknowledge that FIRST before giving data.\nNever repeat yourself.\nFor emergencies: Police 999, Civil Defense 997, Ambulance 998.",
  signOff: "Stay safe. Follow official MOI/NCEMA updates for the latest.",
  maxResponseLength: "short",
  personality: "advisor",
  filters: "No profanity in responses. No speculation about military operations. No unverified casualty numbers.",
};

// GET - retrieve current AI config
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const result = await db.execute({
      sql: "SELECT data FROM data_cache WHERE key = ?",
      args: ["ai_config"],
    });

    if (result.rows.length === 0) {
      return NextResponse.json(DEFAULT_CONFIG);
    }

    const config = JSON.parse(result.rows[0].data as string);
    return NextResponse.json({ ...DEFAULT_CONFIG, ...config });
  } catch {
    return NextResponse.json(DEFAULT_CONFIG);
  }
}

// POST - update AI config
export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const config = await request.json();
    const db = getDb();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT OR REPLACE INTO data_cache (key, data, fetched_at, ttl_seconds) VALUES (?, ?, ?, ?)`,
      args: ["ai_config", JSON.stringify(config), now, 999999],
    });

    return NextResponse.json({ ok: true, saved: true });
  } catch (err: any) {
    console.error("[ai-config]", err);
    return NextResponse.json({ error: "Failed to save config" }, { status: 500 });
  }
}
