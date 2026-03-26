import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    return NextResponse.json({ error: "TURSO_DATABASE_URL not set", envKeys: Object.keys(process.env).filter(k => k.startsWith("TURSO")) });
  }

  try {
    const client = createClient({ url, authToken: token || undefined });
    const result = await client.execute("SELECT key, length(data) as size FROM data_cache");
    return NextResponse.json({
      status: "connected",
      url: url.substring(0, 30) + "...",
      tokenPresent: !!token,
      tables: result.rows,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message, url: url.substring(0, 30) + "...", tokenPresent: !!token }, { status: 500 });
  }
}
