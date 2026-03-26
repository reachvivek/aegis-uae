import { NextResponse } from "next/server";

// Collectors
import { collectWeather } from "@worker/collectors/weather";
import { collectFlights } from "@worker/collectors/flights";
import { collectNews } from "@worker/collectors/news";
import { collectGdelt } from "@worker/collectors/gdelt";
import { collectEarthquakes } from "@worker/collectors/earthquakes";

// Processors
import { processStatus } from "@worker/processors/status";
import { processAlerts } from "@worker/processors/alerts";
import { processThreats } from "@worker/processors/threats";
import { processConnectivity } from "@worker/processors/connectivity";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel Hobby allows up to 60s for cron

// Protect with CRON_SECRET so only Vercel cron can trigger this
function isAuthorized(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  // If no secret configured, allow (dev mode)
  if (!cronSecret) return true;
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const start = Date.now();
  const results: Record<string, string> = {};

  // Run all collectors in parallel
  const collectors = await Promise.allSettled([
    collectWeather(),
    collectFlights(),
    collectNews(),
    collectEarthquakes(),
    collectGdelt(),
  ]);

  const collectorNames = ["weather", "flights", "news", "earthquakes", "gdelt"];
  collectors.forEach((r, i) => {
    results[collectorNames[i]] = r.status === "fulfilled" ? "ok" : `error: ${(r as PromiseRejectedResult).reason}`;
  });

  // Run all processors in parallel (after collectors finish)
  const processors = await Promise.allSettled([
    processStatus(),
    processAlerts(),
    processThreats(),
    processConnectivity(),
  ]);

  const processorNames = ["status", "alerts", "threats", "connectivity"];
  processors.forEach((r, i) => {
    results[processorNames[i]] = r.status === "fulfilled" ? "ok" : `error: ${(r as PromiseRejectedResult).reason}`;
  });

  const duration = Date.now() - start;

  return NextResponse.json({
    ok: true,
    duration: `${duration}ms`,
    results,
    timestamp: new Date().toISOString(),
  });
}
