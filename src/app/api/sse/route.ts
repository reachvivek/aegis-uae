import { getDb } from "@/lib/turso";

export const dynamic = "force-dynamic";

export async function GET() {
  const encoder = new TextEncoder();
  let lastId = 0;
  let closed = false;

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial heartbeat
      controller.enqueue(encoder.encode(": heartbeat\n\n"));

      const poll = async () => {
        if (closed) return;

        try {
          const db = getDb();
          const result = await db.execute({
            sql: "SELECT id, channel, changed_at FROM change_log WHERE id > ? ORDER BY id ASC LIMIT 20",
            args: [lastId],
          });

          for (const row of result.rows) {
            const id = row.id as number;
            const channel = row.channel as string;
            const changedAt = row.changed_at as string;

            controller.enqueue(
              encoder.encode(`id: ${id}\nevent: update\ndata: ${JSON.stringify({ channel, changedAt })}\n\n`)
            );
            lastId = id;
          }

          // Heartbeat to keep connection alive
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          // DB error, skip this cycle
        }

        if (!closed) {
          setTimeout(poll, 2000);
        }
      };

      // Start polling after 1s
      setTimeout(poll, 1000);

      // Auto-close after 25s (Vercel hobby limit)
      setTimeout(() => {
        closed = true;
        try {
          controller.close();
        } catch {
          // Already closed
        }
      }, 25000);
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
