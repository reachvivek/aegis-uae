"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { cn, formatTimeAgo } from "@/lib/utils";
import {
  CloudRainIcon, CloudLightningIcon, AirplaneTiltIcon, WarningIcon,
  MapPinIcon, ClockIcon, WarningCircleIcon, WarningDiamondIcon,
  ShieldWarning, X, Siren,
} from "@phosphor-icons/react";
import { useAlerts } from "@/hooks/useAlerts";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

type AlertSeverity = "critical" | "warning" | "advisory";

interface CriticalAlert {
  id: string;
  severity: AlertSeverity;
  category: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  icon: React.ReactNode;
  source: string;
  regions: string[];
  issuedAt: string;
  expiresAt: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  WEATHER: <CloudRainIcon className="w-3 h-3" weight="duotone" />,
  SEISMIC: <WarningIcon className="w-3 h-3" weight="duotone" />,
  AIRSPACE: <AirplaneTiltIcon className="w-3 h-3" weight="duotone" />,
};

const fallbackAlerts: CriticalAlert[] = [
  {
    id: "1", severity: "warning", category: "WEATHER",
    title: "Heavy Rainfall Warning - Abu Dhabi, Dubai & Northern Emirates",
    description: "NCM: Expect 30-50mm rainfall over 24h. Flash flooding in low-lying areas. Reduced highway visibility.",
    icon: <CloudRainIcon className="w-3 h-3" weight="duotone" />, source: "NCM",
    regions: ["Abu Dhabi", "Dubai", "Sharjah"],
    issuedAt: "2026-03-25T11:00:00Z", expiresAt: "2026-03-26T11:00:00Z",
  },
  {
    id: "2", severity: "warning", category: "WEATHER",
    title: "Thunderstorm Watch - Eastern UAE & Al Ain",
    description: "Isolated thunderstorms with lightning activity. Secure outdoor items and avoid open areas.",
    icon: <CloudLightningIcon className="w-3 h-3" weight="duotone" />, source: "NCM",
    regions: ["Al Ain", "Fujairah"],
    issuedAt: "2026-03-25T09:00:00Z", expiresAt: "2026-03-25T21:00:00Z",
  },
  {
    id: "3", severity: "advisory", category: "AIRSPACE",
    title: "DXB RWY 12L/30R Maintenance 0200-0600 UTC",
    description: "Single runway operations. 15-25 min additional delays expected.",
    icon: <AirplaneTiltIcon className="w-3 h-3" weight="duotone" />, source: "GCAA",
    regions: ["DXB"],
    issuedAt: "2026-03-25T08:00:00Z", expiresAt: "2026-03-26T06:00:00Z",
  },
];

const severityConfig: Record<AlertSeverity, {
  text: string; bg: string; border: string; dot: string; label: string;
}> = {
  critical: { text: "text-danger", bg: "bg-danger-dim", border: "border-danger/20", dot: "bg-danger", label: "CRITICAL" },
  warning: { text: "text-amber", bg: "bg-amber-dim", border: "border-amber/20", dot: "bg-amber", label: "WARNING" },
  advisory: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", dot: "bg-blue-400", label: "ADVISORY" },
};

export default function AlertBanner() {
  const { alerts: apiAlerts } = useAlerts();
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [criticalModalOpen, setCriticalModalOpen] = useState(false);
  const [criticalModalAlert, setCriticalModalAlert] = useState<CriticalAlert | null>(null);
  const dismissedCriticalIds = useRef<Set<string>>(new Set());
  const sirenCtxRef = useRef<AudioContext | null>(null);

  // Map API alerts to component format, fallback to mock data
  const alerts: CriticalAlert[] = (() => {
    if (apiAlerts.length === 0) return fallbackAlerts;

    const mapped: CriticalAlert[] = apiAlerts.map((a: any) => ({
      id: a.id,
      severity: a.severity as AlertSeverity,
      category: a.category || "GENERAL",
      title: a.title,
      titleAr: a.titleAr || "",
      description: a.description || "",
      descriptionAr: a.descriptionAr || "",
      icon: categoryIcons[a.category] || <WarningIcon className="w-3 h-3" weight="duotone" />,
      source: a.source || "System",
      regions: a.regions || [],
      issuedAt: a.issuedAt,
      expiresAt: a.expiresAt,
    }));

    // Group seismic alerts into a single summary item
    const seismic = mapped.filter((a) => a.category === "SEISMIC");
    const nonSeismic = mapped.filter((a) => a.category !== "SEISMIC");

    if (seismic.length > 1) {
      const maxMag = seismic.reduce((max, a) => {
        const match = a.title.match(/M([\d.]+)/);
        const mag = match ? parseFloat(match[1]) : 0;
        return mag > max ? mag : max;
      }, 0);
      const highestSeverity = seismic.some((a) => a.severity === "critical")
        ? "critical" as AlertSeverity
        : seismic.some((a) => a.severity === "warning")
          ? "warning" as AlertSeverity
          : "advisory" as AlertSeverity;

      const summary: CriticalAlert = {
        id: "seismic-summary",
        severity: highestSeverity,
        category: "SEISMIC",
        title: `${seismic.length} Seismic Events Detected – Highest M${maxMag.toFixed(1)}`,
        description: `${seismic.length} earthquakes recorded in the region. Strongest: M${maxMag.toFixed(1)}.`,
        icon: categoryIcons["SEISMIC"],
        source: "USGS",
        regions: ["UAE Region"],
        issuedAt: seismic[0].issuedAt,
        expiresAt: seismic[0].expiresAt,
      };
      return [...nonSeismic, summary];
    }

    return mapped;
  })();

  useEffect(() => setMounted(true), []);

  // Stop any playing siren immediately
  const stopSiren = useCallback(() => {
    if (sirenCtxRef.current) {
      try { sirenCtxRef.current.close(); } catch {}
      sirenCtxRef.current = null;
    }
  }, []);

  // Play loud continuous siren for critical alerts (max 5 seconds, stoppable)
  const playCriticalSiren = useCallback(() => {
    stopSiren(); // kill any existing siren first
    try {
      const ctx = new AudioContext();
      sirenCtxRef.current = ctx;
      const now = ctx.currentTime;
      const duration = 5;

      // Main siren oscillator - sweeping frequency
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

      // Second harmonic
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

      // Pulsing bass
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

      // Auto-cleanup after duration
      setTimeout(() => {
        if (sirenCtxRef.current === ctx) {
          try { ctx.close(); } catch {}
          sirenCtxRef.current = null;
        }
      }, (duration + 0.5) * 1000);
    } catch {
      // Web Audio not supported
    }
  }, [stopSiren]);

  // Auto-open modal for new critical alerts (track by alert IDs to avoid re-render loops)
  const shownCriticalIds = useRef<Set<string>>(new Set());
  useEffect(() => {
    const criticals = alerts.filter(
      (a) => a.severity === "critical"
        && !dismissedCriticalIds.current.has(a.id)
        && !shownCriticalIds.current.has(a.id)
    );
    if (criticals.length > 0) {
      shownCriticalIds.current.add(criticals[0].id);
      setCriticalModalAlert(criticals[0]);
      setCriticalModalOpen(true);
      playCriticalSiren();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiAlerts]);

  const dismissCriticalModal = useCallback(() => {
    stopSiren();
    if (criticalModalAlert) {
      dismissedCriticalIds.current.add(criticalModalAlert.id);
    }
    setCriticalModalOpen(false);
    setCriticalModalAlert(null);
  }, [criticalModalAlert, stopSiren]);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % alerts.length);
    }, 4000);
    return () => clearInterval(id);
  }, [paused, alerts.length]);

  if (alerts.length === 0) return null;

  const current = alerts[activeIndex % alerts.length];
  if (!current) return null;
  const s = severityConfig[current.severity] || severityConfig.advisory;

  return (
    <>
      {/* Critical Alert Modal */}
      <Dialog open={criticalModalOpen} onOpenChange={(open) => { if (!open) dismissCriticalModal(); }}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-xl border-danger/40 bg-[#0a0a0e] shadow-[0_0_60px_rgba(255,71,87,0.15)] p-5"
        >
          {/* Pulsing red header */}
          <div className="flex flex-col items-center gap-3 pt-2">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-danger/20 animate-ping" />
              <div className="relative w-14 h-14 rounded-full bg-danger/20 flex items-center justify-center border border-danger/30">
                <Siren className="w-7 h-7 text-danger" weight="duotone" />
              </div>
            </div>
            <Badge className="bg-danger text-white border-0 text-[10px] font-bold tracking-widest px-3">
              CRITICAL ALERT
            </Badge>
          </div>

          {criticalModalAlert && (
            <div className="space-y-4">
              {/* English */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[8px] border-danger/30 text-danger bg-danger/10">
                    {criticalModalAlert.category}
                  </Badge>
                  <span className="text-[9px] font-mono text-muted-foreground">
                    {criticalModalAlert.source}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-danger leading-snug">
                  {criticalModalAlert.title}
                </h3>
                {criticalModalAlert.description && (
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {criticalModalAlert.description}
                  </p>
                )}
              </div>

              {/* Arabic */}
              {criticalModalAlert.titleAr && (
                <div className="space-y-2 border-t border-danger/10 pt-3" dir="rtl">
                  <h3 className="text-sm font-semibold text-danger leading-snug text-right">
                    {criticalModalAlert.titleAr}
                  </h3>
                  {criticalModalAlert.descriptionAr && (
                    <p className="text-xs text-muted-foreground leading-relaxed text-right">
                      {criticalModalAlert.descriptionAr}
                    </p>
                  )}
                </div>
              )}

              {/* Meta */}
              <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground border-t border-border/50 pt-2">
                <div className="flex items-center gap-1.5">
                  <MapPinIcon className="w-2.5 h-2.5" weight="bold" />
                  {criticalModalAlert.regions.join(", ")}
                </div>
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-2.5 h-2.5" weight="bold" />
                  {mounted ? formatTimeAgo(criticalModalAlert.issuedAt) : "..."}
                </div>
              </div>

              {/* Safety instructions */}
              <div className="bg-danger/5 border border-danger/15 rounded-lg p-3 space-y-1.5">
                <p className="text-[10px] font-bold text-danger uppercase tracking-wider">Immediate Actions</p>
                <ul className="text-[11px] text-foreground/80 space-y-1 list-none">
                  <li>Move away from <strong className="text-danger">windows, glass & doors</strong></li>
                  <li>Seek shelter in an <strong className="text-danger">interior room or basement</strong></li>
                  <li>Stay away from <strong className="text-danger">open areas & balconies</strong></li>
                  <li>Await official instructions from <strong>MOI / NCEMA</strong></li>
                </ul>
                <div className="flex gap-4 pt-1 text-[9px] font-mono text-muted-foreground">
                  <span>Emergency <strong className="text-danger">999</strong></span>
                  <span>Civil Defense <strong className="text-danger">997</strong></span>
                  <span>Ambulance <strong className="text-danger">998</strong></span>
                </div>
              </div>

              {/* Dismiss */}
              <button
                onClick={dismissCriticalModal}
                className="w-full py-2.5 rounded-lg bg-danger/10 hover:bg-danger/20 border border-danger/20 text-danger text-xs font-semibold transition-colors cursor-pointer"
              >
                Acknowledge & Dismiss
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Regular banner */}
      <div
        className={cn(
          "w-full border-b shrink-0 transition-colors duration-500 border-l-2",
          s.bg, s.border,
          current.severity === "critical" ? "border-l-danger" :
          current.severity === "warning" ? "border-l-amber" : "border-l-blue-400"
        )}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="max-w-[1920px] mx-auto px-2 sm:px-3 py-1 sm:py-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Alert count badge */}
            <Badge variant="outline" className={cn("text-[7px] sm:text-[8px] gap-1 shrink-0 border-0 font-bold", s.bg, s.text)}>
              <WarningIcon className={cn("w-2.5 h-2.5", current.severity !== "advisory" && "pulse-live")} weight="bold" />
              <span className="hidden sm:inline">{alerts.length} ALERT{alerts.length > 1 ? "S" : ""}</span>
              <span className="sm:hidden">{alerts.length}</span>
            </Badge>

            {/* Severity + category */}
            <Badge variant="outline" className={cn("text-[7px] shrink-0 border-0 font-bold", s.bg, s.text)}>
              {s.label}
            </Badge>
            <Badge variant="outline" className="text-[7px] shrink-0 border-0 bg-muted text-muted-foreground hidden sm:flex">
              {current.category}
            </Badge>

            {/* Icon + title */}
            <div key={current.id} className="flex items-center gap-1.5 flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-1 duration-300">
              <span className={cn("shrink-0", s.text)}>{current.icon}</span>
              <p className={cn("text-[11px] font-medium truncate", s.text)}>
                {current.title}
              </p>
            </div>

            {/* Clickable to reopen critical modal */}
            {current.severity === "critical" && (
              <button
                onClick={() => {
                  dismissedCriticalIds.current.delete(current.id);
                  setCriticalModalAlert(current);
                  setCriticalModalOpen(true);
                }}
                className="text-[8px] text-danger font-bold hover:underline cursor-pointer shrink-0"
              >
                VIEW
              </button>
            )}

            {/* Region */}
            <span className="hidden lg:flex items-center gap-0.5 text-[7px] font-mono text-muted-foreground shrink-0">
              <MapPinIcon className="w-2 h-2" weight="bold" />
              {current.regions.join(" / ")}
            </span>

            {/* Time */}
            <div className="hidden md:flex items-center gap-1 shrink-0 text-[7px] font-mono text-muted-foreground">
              <ClockIcon className="w-2 h-2" weight="bold" />
              {mounted ? formatTimeAgo(current.issuedAt) : "..."}
              <span className="text-border/50">·</span>
              Until {new Date(current.expiresAt).toLocaleTimeString("en-US", {
                hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai",
              })} GST
            </div>

            {/* Dot indicators */}
            <div className="flex items-center gap-1 shrink-0 ml-auto">
              {alerts.map((a, i) => {
                const ac = severityConfig[a.severity] || severityConfig.advisory;
                return (
                  <button
                    key={a.id}
                    onClick={() => setActiveIndex(i)}
                    className={cn(
                      "rounded-full transition-all duration-300 cursor-pointer",
                      i === activeIndex
                        ? cn("w-4 h-1.5", ac.dot)
                        : cn("w-1.5 h-1.5 opacity-40 hover:opacity-70", ac.dot)
                    )}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
