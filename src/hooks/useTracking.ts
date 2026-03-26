"use client";

import { useEffect, useRef } from "react";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem("aegis_session");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("aegis_session", id);
  }
  return id;
}

export function useTracking() {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    const sessionId = getSessionId();

    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "pageview",
        path: window.location.pathname,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        sessionId,
      }),
    }).catch(() => {});
  }, []);
}
