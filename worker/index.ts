import cron from "node-cron";
import http from "http";
import { initializeSchema } from "./db/schema";
import { pruneChangeLog } from "./db/cache";

// Collectors
import { collectWeather } from "./collectors/weather";
import { collectFlights } from "./collectors/flights";
import { collectNews } from "./collectors/news";
import { collectGdelt } from "./collectors/gdelt";
import { collectEarthquakes } from "./collectors/earthquakes";
import { collectShelters } from "./collectors/shelters";

// Processors
import { processStatus } from "./processors/status";
import { processAlerts } from "./processors/alerts";
import { processThreats } from "./processors/threats";
import { processConnectivity } from "./processors/connectivity";

async function runCollectors() {
  console.log("[worker] Running collectors...");
  await Promise.allSettled([
    collectWeather(),
    collectFlights(),
    collectNews(),
    collectEarthquakes(),
    collectGdelt(),
  ]);
}

async function runProcessors() {
  console.log("[worker] Running processors...");
  await Promise.allSettled([
    processStatus(),
    processAlerts(),
    processThreats(),
    processConnectivity(),
  ]);
}

async function main() {
  console.log("[worker] Starting AegisUAE worker...");

  // Initialize database schema
  await initializeSchema();

  // Run everything once on startup
  await runCollectors();
  await runProcessors();
  console.log("[worker] Initial run complete");

  // --- Cron schedules ---

  // Weather: every 10 minutes
  cron.schedule("*/10 * * * *", async () => {
    await collectWeather();
    await processAlerts();
    await processStatus();
  });

  // Flights: every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    await collectFlights();
    await processConnectivity();
    await processStatus();
  });

  // News: every 5 minutes
  cron.schedule("*/5 * * * *", async () => {
    await collectNews();
  });

  // GDELT (intel + threats): every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    await collectGdelt();
    await processThreats();
    await processStatus();
  });

  // Earthquakes: every 15 minutes
  cron.schedule("*/15 * * * *", async () => {
    await collectEarthquakes();
    await processAlerts();
  });

  // Shelters: daily at 3 AM UTC
  cron.schedule("0 3 * * *", async () => {
    await collectShelters();
  });

  // Prune change_log: every hour
  cron.schedule("0 * * * *", () => {
    pruneChangeLog();
  });

  // Health check server for Railway
  const PORT = parseInt(process.env.PORT || "3001", 10);
  http
    .createServer((req, res) => {
      if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
      } else {
        res.writeHead(404);
        res.end();
      }
    })
    .listen(PORT, () => {
      console.log(`[worker] Health server on port ${PORT}`);
    });
}

main().catch((err) => {
  console.error("[worker] Fatal error:", err);
  process.exit(1);
});
