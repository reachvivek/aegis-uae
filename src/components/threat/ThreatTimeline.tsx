"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  CrosshairIcon, ShieldCheckIcon, WarningIcon, MapPinIcon,
  FunnelIcon, ClockIcon, AirplaneTiltIcon,
} from "@phosphor-icons/react";
import { useThreats } from "@/hooks/useThreats";

type ThreatType = "missile" | "drone" | "debris";
type Region = "all" | "dubai" | "abu_dhabi" | "sharjah" | "al_ain" | "qatar" | "oman";

interface ThreatEvent {
  id: string;
  timestamp: string;
  type: ThreatType;
  origin: string;
  target: string;
  region: Region;
  regionLabel: string;
  fired: number;
  intercepted: number;
  status: "intercepted" | "partial" | "impact";
  description: string;
}

const fallbackThreatEvents: ThreatEvent[] = [
  {
    id: "t1", timestamp: "2026-03-25T11:42:00Z", type: "drone", origin: "Unknown - Northern Vector",
    target: "Abu Dhabi Airspace", region: "abu_dhabi", regionLabel: "Abu Dhabi", fired: 5, intercepted: 5,
    status: "intercepted", description: "5 UAVs detected on northern approach. All neutralized by THAAD battery at 38,000ft. No debris in populated areas.",
  },
  {
    id: "t2", timestamp: "2026-03-25T10:15:00Z", type: "missile", origin: "Southern Iran (est.)",
    target: "Al Dhafra Airbase Vicinity", region: "abu_dhabi", regionLabel: "Abu Dhabi", fired: 2, intercepted: 2,
    status: "intercepted", description: "2 ballistic missiles intercepted at high altitude. Patriot PAC-3 engaged. No ground impact.",
  },
  {
    id: "t3", timestamp: "2026-03-25T08:30:00Z", type: "drone", origin: "Houthi-controlled Yemen",
    target: "Dubai Industrial Zone", region: "dubai", regionLabel: "Dubai", fired: 8, intercepted: 7,
    status: "partial", description: "8 Samad-3 UAVs. 7 intercepted, 1 crashed in uninhabited desert area SE of DIC. No casualties.",
  },
  {
    id: "t4", timestamp: "2026-03-25T06:00:00Z", type: "missile", origin: "Iraq-based militia (est.)",
    target: "Qatar Al Udeid Perimeter", region: "qatar", regionLabel: "Qatar", fired: 1, intercepted: 1,
    status: "intercepted", description: "Single cruise missile engaged by Qatari air defense. Intercept confirmed at 15km range.",
  },
  {
    id: "t5", timestamp: "2026-03-25T03:20:00Z", type: "drone", origin: "Unknown - Maritime",
    target: "Sharjah Port Area", region: "sharjah", regionLabel: "Sharjah", fired: 3, intercepted: 3,
    status: "intercepted", description: "3 maritime-launched UAVs detected. Electronic warfare systems jammed 1, kinetic intercept on 2.",
  },
  {
    id: "t6", timestamp: "2026-03-24T22:45:00Z", type: "debris", origin: "Intercept Fallout",
    target: "Al Ain Rural", region: "al_ain", regionLabel: "Al Ain", fired: 0, intercepted: 0,
    status: "impact", description: "Debris from earlier intercept fell in agricultural area. No injuries. Area cordoned by civil defense.",
  },
];

const typeConfig: Record<ThreatType, { label: string; color: string; bg: string }> = {
  missile: { label: "MISSILE", color: "text-danger", bg: "bg-danger-dim" },
  drone: { label: "UAV/DRONE", color: "text-amber", bg: "bg-amber-dim" },
  debris: { label: "DEBRIS", color: "text-muted-foreground", bg: "bg-muted" },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  intercepted: { label: "INTERCEPTED", color: "text-success", bg: "bg-success-dim" },
  partial: { label: "PARTIAL", color: "text-amber", bg: "bg-amber-dim" },
  impact: { label: "IMPACT", color: "text-danger", bg: "bg-danger-dim" },
};

const regions: { value: Region; label: string }[] = [
  { value: "all", label: "All Regions" },
  { value: "dubai", label: "Dubai" },
  { value: "abu_dhabi", label: "Abu Dhabi" },
  { value: "sharjah", label: "Sharjah" },
  { value: "al_ain", label: "Al Ain" },
  { value: "qatar", label: "Qatar" },
  { value: "oman", label: "Oman" },
];

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai",
  });
}

export default function ThreatTimeline() {
  const { events: apiEvents } = useThreats();
  const [regionFilter, setRegionFilter] = useState<Region>("all");
  const [typeFilter, setTypeFilter] = useState<ThreatType | "all">("all");

  // Map API events, fallback to mock
  const threatEvents: ThreatEvent[] = apiEvents.length > 0
    ? apiEvents.map((e: any) => ({
        id: e.id,
        timestamp: e.timestamp,
        type: (e.type || "drone") as ThreatType,
        origin: "GDELT Intelligence",
        target: e.headline || "Unknown",
        region: (e.region || "all") as Region,
        regionLabel: e.region || "UAE",
        fired: 0,
        intercepted: 0,
        status: "intercepted" as const,
        description: e.detail || e.headline || "",
      }))
    : fallbackThreatEvents;

  const filtered = threatEvents.filter((e) => {
    if (regionFilter !== "all" && e.region !== regionFilter) return false;
    if (typeFilter !== "all" && e.type !== typeFilter) return false;
    return true;
  });

  // Aggregates
  const totalFired = filtered.reduce((s, e) => s + e.fired, 0);
  const totalIntercepted = filtered.reduce((s, e) => s + e.intercepted, 0);
  const interceptRate = totalFired > 0 ? Math.round((totalIntercepted / totalFired) * 100) : 100;
  const missileCount = filtered.filter((e) => e.type === "missile").reduce((s, e) => s + e.fired, 0);
  const droneCount = filtered.filter((e) => e.type === "drone").reduce((s, e) => s + e.fired, 0);

  return (
    <Card className="h-full flex flex-col border-border/50">
      <CardHeader className="px-3 pt-3 pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-foreground flex items-center gap-1.5">
            <CrosshairIcon className="w-3.5 h-3.5 text-danger" weight="duotone" />
            Threat Timeline
          </CardTitle>
          <Badge variant="outline" className="text-[7px] text-danger border-danger/20 bg-danger-dim gap-0.5">
            <span className="relative flex h-1 w-1">
              <span className="animate-ping absolute h-full w-full rounded-full bg-danger opacity-60" />
              <span className="relative rounded-full h-1 w-1 bg-danger" />
            </span>
            ACTIVE
          </Badge>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-2 mt-2">
          <div className="bg-secondary/50 rounded-md p-2 text-center border border-border/30">
            <p className="text-lg font-bold font-mono leading-none">{totalFired}</p>
            <p className="text-[7px] text-muted-foreground uppercase mt-0.5">Launched</p>
          </div>
          <div className="bg-secondary/50 rounded-md p-2 text-center border border-border/30">
            <p className="text-lg font-bold font-mono leading-none text-success">{totalIntercepted}</p>
            <p className="text-[7px] text-muted-foreground uppercase mt-0.5">Intercepted</p>
          </div>
          <div className="bg-secondary/50 rounded-md p-2 text-center border border-border/30">
            <p className={cn("text-lg font-bold font-mono leading-none", interceptRate >= 95 ? "text-success" : interceptRate >= 80 ? "text-amber" : "text-danger")}>{interceptRate}%</p>
            <p className="text-[7px] text-muted-foreground uppercase mt-0.5">Rate</p>
          </div>
          <div className="bg-secondary/50 rounded-md p-2 text-center border border-border/30">
            <div className="flex items-center justify-center gap-1.5">
              <div className="text-center">
                <p className="text-xs font-bold font-mono text-danger leading-none">{missileCount}</p>
                <p className="text-[6px] text-muted-foreground">MSL</p>
              </div>
              <div className="w-px h-5 bg-border/50" />
              <div className="text-center">
                <p className="text-xs font-bold font-mono text-amber leading-none">{droneCount}</p>
                <p className="text-[6px] text-muted-foreground">UAV</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <FunnelIcon className="w-2.5 h-2.5 text-muted-foreground" weight="bold" />
          <div className="flex gap-1 flex-wrap">
            {regions.map((r) => (
              <Button key={r.value} variant={regionFilter === r.value ? "secondary" : "ghost"} size="sm"
                className={cn("h-5 text-[7px] px-1.5", regionFilter === r.value && "bg-secondary text-foreground")}
                onClick={() => setRegionFilter(r.value)}>
                {r.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1 mt-1">
          {(["all", "missile", "drone", "debris"] as const).map((t) => (
            <Button key={t} variant={typeFilter === t ? "secondary" : "ghost"} size="sm"
              className={cn("h-5 text-[7px] px-1.5", typeFilter === t && "bg-secondary text-foreground")}
              onClick={() => setTypeFilter(t)}>
              {t === "all" ? "All Types" : typeConfig[t].label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="px-3 pb-3 flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-0 bottom-0 w-px bg-border/50" />

            <div className="space-y-3">
              {filtered.map((event) => {
                const tc = typeConfig[event.type];
                const sc = statusConfig[event.status];
                return (
                  <div key={event.id} className="relative pl-5">
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 flex items-center justify-center",
                      event.status === "intercepted" ? "border-success bg-success-dim" :
                      event.status === "partial" ? "border-amber bg-amber-dim" : "border-danger bg-danger-dim"
                    )}>
                      {event.status === "intercepted" ? (
                        <ShieldCheckIcon className="w-2 h-2 text-success" weight="bold" />
                      ) : event.status === "impact" ? (
                        <WarningIcon className="w-2 h-2 text-danger" weight="bold" />
                      ) : (
                        <ShieldCheckIcon className="w-2 h-2 text-amber" weight="bold" />
                      )}
                    </div>

                    <div className="bg-secondary/30 rounded-lg p-2.5 border border-border/30 hover:border-border/60 transition-colors">
                      {/* Header */}
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        <Badge variant="outline" className={cn("text-[6px] border-0 px-1 py-0 font-bold", tc.color, tc.bg)}>
                          {tc.label}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[6px] border-0 px-1 py-0 font-bold", sc.color, sc.bg)}>
                          {sc.label}
                        </Badge>
                        <span className="text-[7px] font-mono text-muted-foreground flex items-center gap-0.5 ml-auto">
                          <ClockIcon className="w-2 h-2" weight="bold" />
                          {formatTime(event.timestamp)} GST
                        </span>
                      </div>

                      {/* Target + Origin */}
                      <p className="text-[10px] font-semibold text-foreground/90 leading-snug">{event.target}</p>
                      <p className="text-[8px] text-muted-foreground mt-0.5">
                        <MapPinIcon className="w-2 h-2 inline mr-0.5" weight="bold" />
                        {event.regionLabel} · Origin: {event.origin}
                      </p>

                      {/* Fired vs Intercepted */}
                      {event.fired > 0 && (
                        <div className="flex items-center gap-3 mt-1.5">
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] text-muted-foreground">Fired:</span>
                            <span className="text-[10px] font-bold font-mono text-danger">{event.fired}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[8px] text-muted-foreground">Intercepted:</span>
                            <span className="text-[10px] font-bold font-mono text-success">{event.intercepted}</span>
                          </div>
                          {/* Mini bar */}
                          <div className="flex-1 h-1.5 bg-danger/20 rounded-full overflow-hidden">
                            <div className="h-full bg-success rounded-full transition-all"
                              style={{ width: `${(event.intercepted / event.fired) * 100}%` }} />
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-[8px] text-foreground/60 mt-1.5 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
