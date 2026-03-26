import { NextResponse } from "next/server";
import { getDb } from "@/lib/turso";

export const dynamic = "force-dynamic";

// In-memory cache for IP geolocation results
const geoCache = new Map<string, { country: string; city: string; expires: number }>();
const GEO_CACHE_TTL = 1000 * 60 * 60; // 1 hour

async function getGeoFromIP(ip: string): Promise<{ country: string; city: string }> {
  // Check cache first
  const cached = geoCache.get(ip);
  if (cached && cached.expires > Date.now()) {
    return { country: cached.country, city: cached.city };
  }

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return { country: "", city: "" };
    const data = await res.json();
    const result = {
      country: data.country_name || "",
      city: data.city || "",
    };
    // Store in cache
    geoCache.set(ip, { ...result, expires: Date.now() + GEO_CACHE_TTL });
    // Evict old entries if cache grows too large
    if (geoCache.size > 5000) {
      const now = Date.now();
      for (const [key, val] of geoCache) {
        if (val.expires < now) geoCache.delete(key);
      }
    }
    return result;
  } catch {
    return { country: "", city: "" };
  }
}

function getClientIP(request: Request): string {
  const headers = new Headers(request.headers);
  // x-forwarded-for may contain a comma-separated list; take the first
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "";
}

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

      const ip = getClientIP(request);

      // Insert the page view immediately (without geo data)
      const insertResult = await db.execute({
        sql: `INSERT INTO page_views (path, referrer, user_agent, device, session_id, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [path || "/", referrer || "", userAgent || "", device, sessionId || "", now],
      });

      // Non-blocking: resolve geo in the background and update the row
      if (ip) {
        const rowId = insertResult.lastInsertRowid;
        if (rowId != null) {
          getGeoFromIP(ip).then(async (geo) => {
            if (geo.country || geo.city) {
              try {
                await db.execute({
                  sql: `UPDATE page_views SET country = ?, city = ? WHERE rowid = ?`,
                  args: [geo.country, geo.city, Number(rowId)],
                });
              } catch (e) {
                console.error("[track] geo update failed", e);
              }
            }
          }).catch(() => {});
        }
      }
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
