import { setCache } from "../db/cache";
import { getDb } from "../db/client";

const GDELT_URL = "https://api.gdeltproject.org/api/v2/doc/doc?query=UAE%20OR%20%22United%20Arab%20Emirates%22%20OR%20Dubai%20OR%20%22Abu%20Dhabi%22&mode=ArtList&maxrecords=50&format=json&sort=DateDesc";

interface GdeltArticle {
  url: string;
  title: string;
  seendate: string;
  domain: string;
  language: string;
  sourcecountry: string;
  tone: number;
}

function classifySentiment(tone: number): "escalation" | "de-escalation" | "neutral" {
  if (tone < -3) return "escalation";
  if (tone > 3) return "de-escalation";
  return "neutral";
}

function classifyThreatType(title: string): string | null {
  const lower = title.toLowerCase();
  if (lower.includes("missile") || lower.includes("ballistic")) return "missile";
  if (lower.includes("drone") || lower.includes("uav")) return "drone";
  if (lower.includes("cyber") || lower.includes("hack")) return "cyber";
  if (lower.includes("gps") || lower.includes("jamming")) return "gps";
  return null;
}

export async function collectGdelt(): Promise<void> {
  try {
    const res = await fetch(GDELT_URL);
    if (!res.ok) {
      console.warn(`[gdelt] API returned ${res.status}`);
      return;
    }

    const data = await res.json();
    const articles: GdeltArticle[] = data.articles || [];

    // Process into intel developments
    const developments = articles.slice(0, 20).map((a, i) => ({
      id: `gdelt-${Buffer.from(a.url).toString("base64").slice(0, 16)}`,
      timestamp: a.seendate ? new Date(a.seendate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, "$1-$2-$3T$4:$5:$6Z")).toISOString() : new Date().toISOString(),
      headline: a.title,
      source: a.domain,
      sentiment: classifySentiment(a.tone || 0),
      tone: a.tone || 0,
      url: a.url,
    }));

    await setCache("intel", { developments, totalArticles: articles.length }, 900);

    // Write threat-related events to events table
    const db = getDb();
    const threatArticles = articles.filter((a) => classifyThreatType(a.title));

    for (const a of threatArticles.slice(0, 10)) {
      const id = `gdelt-${Buffer.from(a.url).toString("base64").slice(0, 16)}`;
      const type = classifyThreatType(a.title);
      const timestamp = a.seendate ? new Date(a.seendate.replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z/, "$1-$2-$3T$4:$5:$6Z")).toISOString() : new Date().toISOString();

      await db.execute({
        sql: `INSERT OR IGNORE INTO events (id, timestamp, type, headline, source, sentiment, region, raw_data)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [id, timestamp, type, a.title, a.domain, classifySentiment(a.tone || 0), "uae", JSON.stringify(a)],
      });
    }

    console.log(`[gdelt] Collected ${developments.length} developments, ${threatArticles.length} threat events`);
  } catch (err) {
    console.error("[gdelt] Collection failed:", err);
  }
}
