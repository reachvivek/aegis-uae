"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { cn, formatTimeAgo } from "@/lib/utils";
import {
  CloudRainIcon, CloudLightningIcon, AirplaneTiltIcon, WarningIcon,
  MapPinIcon, ClockIcon, WarningCircleIcon, WarningDiamondIcon,
} from "@phosphor-icons/react";

type AlertSeverity = "critical" | "warning" | "advisory";

interface CriticalAlert {
  id: string;
  severity: AlertSeverity;
  category: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  source: string;
  regions: string[];
  issuedAt: string;
  expiresAt: string;
}

const alerts: CriticalAlert[] = [
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => setMounted(true), []);

  // Auto-rotate every 4 seconds
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % alerts.length);
    }, 4000);
    return () => clearInterval(id);
  }, [paused]);

  if (alerts.length === 0) return null;

  const current = alerts[activeIndex];
  const s = severityConfig[current.severity];

  return (
    <div
      className={cn(
        "w-full border-b shrink-0 transition-colors duration-500 border-l-2",
        s.bg, s.border,
        current.severity === "critical" ? "border-l-danger pulse-urgent" :
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

          {/* Severity + category - hide category on mobile */}
          <Badge variant="outline" className={cn("text-[7px] shrink-0 border-0 font-bold", s.bg, s.text)}>
            {s.label}
          </Badge>
          <Badge variant="outline" className="text-[7px] shrink-0 border-0 bg-muted text-muted-foreground hidden sm:flex">
            {current.category}
          </Badge>

          {/* Icon + title - keyed for slide animation */}
          <div key={current.id} className="flex items-center gap-1.5 flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-1 duration-300">
            <span className={cn("shrink-0", s.text)}>{current.icon}</span>
            <p className={cn("text-[11px] font-medium truncate", s.text)}>
              {current.title}
            </p>
          </div>

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

          {/* Dot indicators - rightmost, clickable */}
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            {alerts.map((a, i) => {
              const ac = severityConfig[a.severity];
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
  );
}
