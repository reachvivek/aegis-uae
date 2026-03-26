import { getDb } from "./client";

export async function initializeSchema() {
  const db = getDb();

  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS data_cache (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      fetched_at TEXT NOT NULL,
      ttl_seconds INTEGER NOT NULL DEFAULT 300
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      severity TEXT NOT NULL,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      source TEXT,
      regions TEXT,
      issued_at TEXT,
      expires_at TEXT,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      type TEXT,
      headline TEXT,
      detail TEXT,
      source TEXT,
      sentiment TEXT,
      region TEXT,
      raw_data TEXT
    );

    CREATE TABLE IF NOT EXISTS shelters (
      id TEXT PRIMARY KEY,
      name TEXT,
      type TEXT,
      lat REAL,
      lng REAL,
      capacity INTEGER,
      amenities TEXT,
      last_verified TEXT
    );

    CREATE TABLE IF NOT EXISTS system_status (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'normal',
      tooltip TEXT,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS change_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel TEXT NOT NULL,
      changed_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS page_views (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL DEFAULT '/',
      referrer TEXT,
      user_agent TEXT,
      country TEXT,
      city TEXT,
      device TEXT,
      session_id TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      has_image INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      target TEXT,
      meta TEXT,
      session_id TEXT,
      created_at TEXT NOT NULL
    );
  `);

  console.log("[schema] Database tables initialized");
}
