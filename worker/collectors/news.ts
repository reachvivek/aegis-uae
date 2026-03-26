import RssParser from "rss-parser";
import { setCache } from "../db/cache";

const parser = new RssParser();

const RSS_FEEDS = [
  { url: "https://news.google.com/rss/search?q=UAE+crisis+OR+UAE+airspace+OR+Dubai+airport&hl=en&gl=AE&ceid=AE:en", source: "Google News" },
  { url: "https://news.google.com/rss/search?q=UAE+weather+OR+Dubai+rain+OR+Abu+Dhabi+storm&hl=en&gl=AE&ceid=AE:en", source: "Google News" },
  { url: "https://news.google.com/rss/search?q=Iran+Gulf+OR+Houthi+UAE+OR+Yemen+attack&hl=en&gl=AE&ceid=AE:en", source: "Google News" },
  { url: "https://news.google.com/rss/search?q=Abu+Dhabi+OR+Dubai+OR+UAE+breaking+news&hl=en&gl=AE&ceid=AE:en", source: "Google News" },
  { url: "https://news.google.com/rss/search?q=UAE+evacuation+OR+UAE+emergency+OR+UAE+death+OR+UAE+casualties&hl=en&gl=AE&ceid=AE:en", source: "Google News" },
  { url: "https://news.google.com/rss/search?q=UAE+schools+OR+UAE+university+OR+UAE+classes+OR+UAE+students+OR+ADEK&hl=en&gl=AE&ceid=AE:en", source: "Google News" },
  { url: "https://news.google.com/rss/search?q=UAE+remote+work+OR+UAE+office+OR+MOHRE+OR+UAE+government+policy&hl=en&gl=AE&ceid=AE:en", source: "Google News" },
];

interface NewsItem {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  link: string;
  severity: "breaking" | "alert" | "info";
  category: string;
}

function classifySeverity(title: string): "breaking" | "alert" | "info" {
  const lower = title.toLowerCase();
  if (lower.includes("attack") || lower.includes("intercept") || lower.includes("missile") || lower.includes("drone strike") || lower.includes("breaking")) {
    return "breaking";
  }
  if (lower.includes("warning") || lower.includes("alert") || lower.includes("threat") || lower.includes("storm") || lower.includes("flood")) {
    return "alert";
  }
  return "info";
}

function classifyCategory(title: string): string {
  const lower = title.toLowerCase();
  if (lower.includes("airport") || lower.includes("flight") || lower.includes("airspace") || lower.includes("airline")) return "AVIATION";
  if (lower.includes("rain") || lower.includes("storm") || lower.includes("weather") || lower.includes("flood") || lower.includes("cyclone")) return "WEATHER";
  if (lower.includes("missile") || lower.includes("drone") || lower.includes("attack") || lower.includes("defense") || lower.includes("intercept")) return "DEFENSE";
  if (lower.includes("iran") || lower.includes("houthi") || lower.includes("diplomat") || lower.includes("sanction") || lower.includes("government") || lower.includes("ministry") || lower.includes("cabinet") || lower.includes("federal") || lower.includes("policy")) return "GEOPOLITICS";
  if (lower.includes("school") || lower.includes("university") || lower.includes("student") || lower.includes("class") || lower.includes("exam") || lower.includes("adek") || lower.includes("education") || lower.includes("online learning")) return "EDUCATION";
  if (lower.includes("work") || lower.includes("remote") || lower.includes("office") || lower.includes("mohre") || lower.includes("employee") || lower.includes("wfh") || lower.includes("private sector")) return "EMPLOYMENT";
  return "GENERAL";
}

export async function collectNews(): Promise<void> {
  try {
    const allItems: NewsItem[] = [];
    const seen = new Set<string>();

    for (const feed of RSS_FEEDS) {
      try {
        const parsed = await parser.parseURL(feed.url);
        for (const item of (parsed.items || []).slice(0, 15)) {
          const title = item.title || "";
          if (seen.has(title)) continue;
          seen.add(title);

          allItems.push({
            id: Buffer.from(title).toString("base64").slice(0, 20),
            title,
            source: item.creator || feed.source,
            publishedAt: item.isoDate || new Date().toISOString(),
            link: item.link || "",
            severity: classifySeverity(title),
            category: classifyCategory(title),
          });
        }
      } catch (feedErr) {
        console.warn(`[news] Failed to parse feed ${feed.source}:`, feedErr);
      }
    }

    // Sort by date, newest first
    allItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Split into ticker items (breaking/alert) and articles
    const ticker = allItems.filter((n) => n.severity !== "info").slice(0, 15);
    const articles = allItems.slice(0, 30);

    await setCache("news", { articles, ticker, totalFetched: allItems.length }, 300);
    console.log(`[news] Collected ${allItems.length} articles, ${ticker.length} ticker items`);
  } catch (err) {
    console.error("[news] Collection failed:", err);
  }
}
