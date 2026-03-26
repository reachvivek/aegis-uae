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
      // Critical: Loud continuous siren ~5 seconds
      const duration = 5;

      // Main siren - sweeping sawtooth
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sawtooth";
      for (let t = 0; t < duration; t += 0.5) {
        osc1.frequency.setValueAtTime(600, now + t);
        osc1.frequency.linearRampToValueAtTime(1200, now + t + 0.25);
        osc1.frequency.linearRampToValueAtTime(600, now + t + 0.5);
      }
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.setValueAtTime(0.35, now + duration - 0.3);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc1.connect(gain1).connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + duration);

      // Harmonic layer
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "square";
      for (let t = 0; t < duration; t += 0.5) {
        osc2.frequency.setValueAtTime(800, now + t);
        osc2.frequency.linearRampToValueAtTime(1400, now + t + 0.25);
        osc2.frequency.linearRampToValueAtTime(800, now + t + 0.5);
      }
      gain2.gain.setValueAtTime(0.2, now);
      gain2.gain.setValueAtTime(0.2, now + duration - 0.3);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc2.connect(gain2).connect(ctx.destination);
      osc2.start(now);
      osc2.stop(now + duration);

      // Pulsing low bass for urgency
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = "sine";
      osc3.frequency.value = 150;
      for (let t = 0; t < duration; t += 0.25) {
        gain3.gain.setValueAtTime(0.25, now + t);
        gain3.gain.linearRampToValueAtTime(0.05, now + t + 0.125);
        gain3.gain.linearRampToValueAtTime(0.25, now + t + 0.25);
      }
      gain3.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc3.connect(gain3).connect(ctx.destination);
      osc3.start(now);
      osc3.stop(now + duration);

      setTimeout(() => ctx.close(), (duration + 0.5) * 1000);
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
