"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAlerts } from "./useAlerts";

const CRISIS_DURATION_MS = 150_000; // 2.5 minutes

export function useCrisisMode() {
  const { alerts } = useAlerts();
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activatedIds = useRef<Set<string>>(new Set());

  const activate = useCallback(() => {
    setActive(true);
    document.documentElement.classList.add("crisis-mode");

    // Clear any existing timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Auto-deactivate after duration
    timeoutRef.current = setTimeout(() => {
      setActive(false);
      document.documentElement.classList.remove("crisis-mode");
    }, CRISIS_DURATION_MS);
  }, []);

  // Watch for critical alerts
  useEffect(() => {
    const criticals = alerts.filter(
      (a: any) => a.severity === "critical" && !activatedIds.current.has(a.id)
    );
    if (criticals.length > 0) {
      criticals.forEach((a: any) => activatedIds.current.add(a.id));
      activate();
    }
  }, [alerts, activate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      document.documentElement.classList.remove("crisis-mode");
    };
  }, []);

  return { crisisMode: active };
}
