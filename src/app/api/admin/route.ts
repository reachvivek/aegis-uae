import { NextResponse } from "next/server";
import { getDb } from "@/lib/turso";

export const dynamic = "force-dynamic";

function isAuthorized(request: Request): boolean {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const adminKey = process.env.ADMIN_KEY || "aegis2026";
  return key === adminKey;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getDb();
    const url = new URL(request.url);
    const section = url.searchParams.get("section") || "overview";

    if (section === "overview") {
      const [views, convos, uniqueSessions, todayViews] = await Promise.all([
        db.execute("SELECT COUNT(*) as count FROM page_views"),
        db.execute("SELECT COUNT(DISTINCT session_id) as count FROM conversations"),
        db.execute("SELECT COUNT(DISTINCT session_id) as count FROM page_views"),
        db.execute("SELECT COUNT(*) as count FROM page_views WHERE created_at > datetime('now', '-1 day')"),
      ]);

      // Views by day (last 7 days)
      const viewsByDay = await db.execute(
        "SELECT date(created_at) as day, COUNT(*) as count FROM page_views WHERE created_at > datetime('now', '-7 days') GROUP BY date(created_at) ORDER BY day"
      );

      // Device breakdown
      const devices = await db.execute(
        "SELECT device, COUNT(*) as count FROM page_views GROUP BY device ORDER BY count DESC"
      );

      // Top referrers
      const referrers = await db.execute(
        "SELECT referrer, COUNT(*) as count FROM page_views WHERE referrer != '' GROUP BY referrer ORDER BY count DESC LIMIT 10"
      );

      // Location data + hourly breakdown
      const [topCountries, topCities, viewsByHour] = await Promise.all([
        db.execute(
          "SELECT country, COUNT(*) as count FROM page_views WHERE country IS NOT NULL AND country != '' GROUP BY country ORDER BY count DESC LIMIT 20"
        ),
        db.execute(
          "SELECT city, country, COUNT(*) as count FROM page_views WHERE city IS NOT NULL AND city != '' GROUP BY city, country ORDER BY count DESC LIMIT 20"
        ),
        db.execute(
          "SELECT CAST(strftime('%H', created_at) AS INTEGER) as hour, COUNT(*) as count FROM page_views WHERE created_at > datetime('now', '-1 day') GROUP BY hour ORDER BY hour"
        ),
      ]);

      // Peak hour
      const hourRows = viewsByHour.rows.map((r) => ({ hour: r.hour as number, count: r.count as number }));
      const peakHour = hourRows.length > 0 ? hourRows.reduce((a, b) => a.count > b.count ? a : b).hour : null;

      return NextResponse.json({
        totalViews: (views.rows[0]?.count as number) || 0,
        totalConversations: (convos.rows[0]?.count as number) || 0,
        uniqueVisitors: (uniqueSessions.rows[0]?.count as number) || 0,
        todayViews: (todayViews.rows[0]?.count as number) || 0,
        viewsByDay: viewsByDay.rows.map((r) => ({ day: r.day, count: r.count })),
        viewsByHour: hourRows,
        devices: devices.rows.map((r) => ({ device: r.device, count: r.count })),
        referrers: referrers.rows.map((r) => ({ referrer: r.referrer, count: r.count })),
        countries: topCountries.rows.map((r) => ({ country: r.country, count: r.count })),
        cities: topCities.rows.map((r) => ({ city: r.city, country: r.country, count: r.count })),
        peakHour,
      });
    }

    if (section === "conversations") {
      // Get all unique sessions with their message count and last activity
      const sessions = await db.execute(`
        SELECT session_id, COUNT(*) as messages,
               MIN(created_at) as started_at, MAX(created_at) as last_activity,
               SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as user_msgs,
               SUM(CASE WHEN has_image = 1 THEN 1 ELSE 0 END) as images
        FROM conversations
        GROUP BY session_id
        ORDER BY last_activity DESC
        LIMIT 50
      `);

      return NextResponse.json({
        sessions: sessions.rows.map((r) => ({
          sessionId: r.session_id,
          messages: r.messages,
          userMessages: r.user_msgs,
          images: r.images,
          startedAt: r.started_at,
          lastActivity: r.last_activity,
        })),
      });
    }

    if (section === "conversation") {
      const sessionId = url.searchParams.get("sessionId");
      if (!sessionId) return NextResponse.json({ error: "sessionId required" }, { status: 400 });

      const msgs = await db.execute({
        sql: "SELECT role, content, has_image, created_at FROM conversations WHERE session_id = ? ORDER BY created_at ASC",
        args: [sessionId],
      });

      return NextResponse.json({
        messages: msgs.rows.map((r) => ({
          role: r.role,
          content: r.content,
          hasImage: r.has_image,
          createdAt: r.created_at,
        })),
      });
    }

    if (section === "popular-queries") {
      const queries = await db.execute(
        "SELECT content, COUNT(*) as count FROM conversations WHERE role = 'user' GROUP BY content ORDER BY count DESC LIMIT 20"
      );

      return NextResponse.json({
        queries: queries.rows.map((r) => ({ query: r.content, count: r.count })),
      });
    }

    return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  } catch (err: any) {
    console.error("[admin]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
