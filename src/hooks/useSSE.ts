"use client";
import { useEffect, useRef, useCallback } from "react";
import { useSWRConfig } from "swr";

const CHANNEL_TO_KEY: Record<string, string[]> = {
  status: ["/api/status"],
  alerts: ["/api/alerts"],
  flights: ["/api/flights", "/api/stats"],
  weather: ["/api/weather", "/api/stats"],
  news: ["/api/news", "/api/news/ticker"],
  threats: ["/api/threats", "/api/threats/stats"],
  intel: ["/api/intel"],
  connectivity: ["/api/flights/connectivity"],
  earthquakes: ["/api/alerts"],
  shelters: ["/api/shelters"],
};

export function useSSE() {
  const { mutate } = useSWRConfig();
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (typeof window === "undefined") return;

    const es = new EventSource("/api/sse");
    eventSourceRef.current = es;

    es.addEventListener("update", (event) => {
      try {
        const { channel } = JSON.parse(event.data);
        const keys = CHANNEL_TO_KEY[channel] || [];
        for (const key of keys) {
          mutate(key);
        }
      } catch {
        // Ignore parse errors
      }
    });

    es.onerror = () => {
      es.close();
      // Reconnect after 3s
      setTimeout(connect, 3000);
    };
  }, [mutate]);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connect]);
}
