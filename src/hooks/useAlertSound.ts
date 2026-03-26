"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAlerts } from "./useAlerts";

// Generate emergency alert tone using Web Audio API
// Mimics the Wireless Emergency Alert (WEA) tone pattern
function playAlertTone(severity: "critical" | "warning") {
  try {
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    if (severity === "critical") {
      // Critical: WEA-style dual-tone burst (853Hz + 960Hz alternating)
      // 3 bursts, each 0.25s, 0.1s gap
      for (let burst = 0; burst < 3; burst++) {
        const startTime = now + burst * 0.35;

        // First tone (853 Hz)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "square";
        osc1.frequency.value = 853;
        gain1.gain.setValueAtTime(0.15, startTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        osc1.connect(gain1).connect(ctx.destination);
        osc1.start(startTime);
        osc1.stop(startTime + 0.25);

        // Second tone (960 Hz) - offset by half
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = "square";
        osc2.frequency.value = 960;
        gain2.gain.setValueAtTime(0.12, startTime);
        gain2.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        osc2.connect(gain2).connect(ctx.destination);
        osc2.start(startTime);
        osc2.stop(startTime + 0.25);
      }

      // Close context after tones finish
      setTimeout(() => ctx.close(), 1500);
    } else {
      // Warning: gentler two-tone chime (440Hz + 554Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554, now + 0.2);
      osc.frequency.setValueAtTime(440, now + 0.4);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.6);

      setTimeout(() => ctx.close(), 1000);
    }
  } catch {
    // Web Audio not supported or blocked by browser
  }
}

// Request browser notification permission and show notification
function showBrowserNotification(title: string, body: string, severity: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon: "/favicon.svg",
      tag: `aegis-alert-${severity}`,
      requireInteraction: severity === "critical",
    });
  }
}

export function useAlertSound() {
  const { alerts } = useAlerts();
  const seenAlertIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);
  const permissionRequested = useRef(false);

  // Request notification permission on first user interaction
  const requestPermission = useCallback(() => {
    if (permissionRequested.current) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      Notification.requestPermission();
      permissionRequested.current = true;
    }
  }, []);

  // Listen for first user interaction to enable audio + notifications
  useEffect(() => {
    const handler = () => {
      requestPermission();
      document.removeEventListener("click", handler);
      document.removeEventListener("keydown", handler);
    };
    document.addEventListener("click", handler, { once: true });
    document.addEventListener("keydown", handler, { once: true });
    return () => {
      document.removeEventListener("click", handler);
      document.removeEventListener("keydown", handler);
    };
  }, [requestPermission]);

  useEffect(() => {
    if (alerts.length === 0) return;

    // On first load, just record existing alert IDs without playing sounds
    if (!initialized.current) {
      alerts.forEach((a: any) => seenAlertIds.current.add(a.id));
      initialized.current = true;
      return;
    }

    // Check for new alerts
    const newAlerts = alerts.filter((a: any) => !seenAlertIds.current.has(a.id));
    if (newAlerts.length === 0) return;

    // Mark as seen
    newAlerts.forEach((a: any) => seenAlertIds.current.add(a.id));

    // Find highest severity among new alerts
    const hasCritical = newAlerts.some((a: any) => a.severity === "critical");
    const hasWarning = newAlerts.some((a: any) => a.severity === "warning");

    if (hasCritical) {
      playAlertTone("critical");
      const a = newAlerts.find((a: any) => a.severity === "critical");
      showBrowserNotification(
        "CRITICAL ALERT - AegisUAE",
        a?.title || "New critical alert detected",
        "critical"
      );
    } else if (hasWarning) {
      playAlertTone("warning");
      const a = newAlerts.find((a: any) => a.severity === "warning");
      showBrowserNotification(
        "Warning Alert - AegisUAE",
        a?.title || "New warning alert detected",
        "warning"
      );
    }
  }, [alerts]);
}
