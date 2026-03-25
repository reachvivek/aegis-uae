"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  AirplaneTiltIcon, TrendUpIcon, TrendDownIcon, MinusIcon,
  CrosshairIcon, ShieldCheckIcon, WarningIcon, NavigationArrowIcon,
  SirenIcon, ShieldWarningIcon, GpsSlashIcon, MapPinIcon, WifiHighIcon,
} from "@phosphor-icons/react";

type TimeRange = "all" | "24h" | "48h" | "7d";

// ─── Mock data by time range ───
const threatData: Record<TimeRange, {
  missilesFired: number; missilesInt: number;
  dronesFired: number; dronesInt: number;
  debris: number;
  casualties: number; deaths: number; injured: number;
  missileSpark: number[]; droneSpark: number[];
  label: string;
}> = {
  all: {
    missilesFired: 84, missilesInt: 79, dronesFired: 312, dronesInt: 298, debris: 19,
    casualties: 23, deaths: 4, injured: 19,
    missileSpark: [5, 8, 12, 6, 10, 14, 8, 3, 6, 9, 2, 1],
    droneSpark: [18, 24, 35, 28, 42, 30, 26, 38, 22, 28, 16, 5],
    label: "Since Jan 15",
  },
  "24h": {
    missilesFired: 3, missilesInt: 3, dronesFired: 16, dronesInt: 15, debris: 1,
    casualties: 0, deaths: 0, injured: 0,
    missileSpark: [0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0],
    droneSpark: [0, 0, 3, 0, 5, 0, 0, 8, 0, 0, 0, 0],
    label: "Last 24h",
  },
  "48h": {
    missilesFired: 7, missilesInt: 7, dronesFired: 29, dronesInt: 27, debris: 3,
    casualties: 2, deaths: 0, injured: 2,
    missileSpark: [0, 1, 0, 2, 0, 0, 1, 0, 0, 2, 0, 1],
    droneSpark: [2, 3, 5, 0, 4, 6, 0, 3, 0, 4, 2, 0],
    label: "Last 48h",
  },
  "7d": {
    missilesFired: 12, missilesInt: 11, dronesFired: 47, dronesInt: 44, debris: 4,
    casualties: 6, deaths: 1, injured: 5,
    missileSpark: [0, 2, 1, 0, 3, 1, 2, 0, 1, 0, 2, 0],
    droneSpark: [3, 5, 2, 8, 4, 6, 3, 7, 2, 4, 3, 0],
    label: "Last 7 days",
  },
};

// ─── Sparkline component ───
function Sparkline({ data, color, height = 28 }: { data: number[]; color: string; height?: number }) {
  const max = Math.max(...data, 1);
  const w = 100;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - (v / max) * height;
    return `${x},${y}`;
  }).join(" ");

  // Area fill
  const areaPoints = `0,${height} ${points} ${w},${height}`;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }} preserveAspectRatio="none">
      <polygon points={areaPoints} fill={color} opacity="0.15" />
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Aviation Card ───
function AviationCard() {
  const airports = [
    { code: "DXB", total: 1247, onTime: 1089, delayed: 142, cancelled: 16, index: "low", trend: "up", delayDelta: -8, cancelDelta: -3 },
    { code: "AUH", total: 634, onTime: 571, delayed: 56, cancelled: 7, index: "low", trend: "stable", delayDelta: +2, cancelDelta: 0 },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-1">
        <AirplaneTiltIcon className="w-3 h-3 text-teal" weight="duotone" />
        <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Aviation Pulse</span>
        <span className="text-[7px] font-mono text-muted-foreground ml-auto">24h</span>
      </div>
      {airports.map((ap) => {
        const rate = Math.round((ap.onTime / ap.total) * 100);
        return (
          <div key={ap.code} className="bg-secondary/50 rounded-lg p-2 border border-border/30">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold font-mono">{ap.code}</span>
                {ap.trend === "up" ? <TrendUpIcon className="w-2.5 h-2.5 text-success" weight="bold" /> :
                 ap.trend === "down" ? <TrendDownIcon className="w-2.5 h-2.5 text-danger" weight="bold" /> :
                 <MinusIcon className="w-2.5 h-2.5 text-muted-foreground" weight="bold" />}
                <Badge variant="outline" className="text-[7px] font-bold uppercase border-0 py-0 px-1 text-success bg-success-dim">{ap.index}</Badge>
              </div>
              <span className="text-sm font-bold font-mono text-success">{rate}%</span>
            </div>
            <div className="h-1 bg-background rounded-full overflow-hidden mb-1.5">
              <div className="h-full bg-gradient-to-r from-teal to-success rounded-full" style={{ width: `${rate}%` }} />
            </div>
            <div className="flex items-center justify-between text-center">
              <div className="flex-1">
                <p className="text-xs font-bold font-mono leading-none">{ap.total.toLocaleString()}</p>
                <p className="text-[6px] text-muted-foreground uppercase mt-0.5">Flights</p>
              </div>
              <div className="w-px h-4 bg-border/30" />
              <div className="flex-1">
                <p className="text-xs font-bold font-mono leading-none text-amber">{ap.delayed}</p>
                <div className="flex items-center justify-center gap-0.5 mt-0.5">
                  <p className="text-[6px] text-muted-foreground uppercase">Del.</p>
                  <Delta value={ap.delayDelta} />
                </div>
              </div>
              <div className="w-px h-4 bg-border/30" />
              <div className="flex-1">
                <p className="text-xs font-bold font-mono leading-none text-danger">{ap.cancelled}</p>
                <div className="flex items-center justify-center gap-0.5 mt-0.5">
                  <p className="text-[6px] text-muted-foreground uppercase">Canc.</p>
                  <Delta value={ap.cancelDelta} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Threat Stats Card with time range tabs + sparklines ───
function ThreatCard() {
  const [range, setRange] = useState<TimeRange>("all");
  const d = threatData[range];
  const totalFired = d.missilesFired + d.dronesFired;
  const totalInt = d.missilesInt + d.dronesInt;
  const interceptRate = totalFired > 0 ? Math.round((totalInt / totalFired) * 100) : 100;

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <CrosshairIcon className="w-3 h-3 text-danger" weight="duotone" />
        <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Threat Summary</span>
        {/* Time range tabs */}
        <div className="flex items-center gap-0.5 ml-auto">
          {(["all", "24h", "48h", "7d"] as const).map((t) => (
            <button key={t} onClick={() => setRange(t)}
              className={cn(
                "text-[7px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors",
                range === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              )}>
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Intercept rate hero */}
      <div className="bg-secondary/50 rounded-lg p-2 border border-border/30 mb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className={cn("text-2xl font-bold font-mono leading-none", interceptRate >= 95 ? "text-success" : interceptRate >= 80 ? "text-amber" : "text-danger")}>{interceptRate}%</p>
            <p className="text-[7px] text-muted-foreground uppercase mt-0.5">Intercept Rate</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold font-mono leading-none">
              <span className="text-success">{totalInt}</span>
              <span className="text-muted-foreground text-xs">/</span>
              <span>{totalFired}</span>
            </p>
            <p className="text-[7px] text-muted-foreground uppercase mt-0.5">Intercepted / Fired</p>
          </div>
        </div>
        <div className="h-1.5 bg-danger/20 rounded-full overflow-hidden mt-1.5">
          <div className="h-full bg-success rounded-full transition-all duration-500" style={{ width: `${interceptRate}%` }} />
        </div>
      </div>

      {/* Casualties */}
      <div className="grid grid-cols-3 gap-1.5 mb-2">
        <div className={cn("bg-secondary/50 rounded-md p-1.5 border text-center", d.deaths > 0 ? "border-danger/30" : "border-border/30")}>
          <p className={cn("text-sm font-bold font-mono leading-none", d.deaths > 0 ? "text-danger" : "text-success")}>{d.deaths}</p>
          <p className="text-[6px] text-muted-foreground uppercase mt-0.5">Deaths</p>
        </div>
        <div className={cn("bg-secondary/50 rounded-md p-1.5 border text-center", d.injured > 0 ? "border-amber/30" : "border-border/30")}>
          <p className={cn("text-sm font-bold font-mono leading-none", d.injured > 0 ? "text-amber" : "text-success")}>{d.injured}</p>
          <p className="text-[6px] text-muted-foreground uppercase mt-0.5">Injured</p>
        </div>
        <div className="bg-secondary/50 rounded-md p-1.5 border border-border/30 text-center">
          <p className="text-sm font-bold font-mono leading-none text-muted-foreground">{d.debris}</p>
          <p className="text-[6px] text-muted-foreground uppercase mt-0.5">Debris</p>
        </div>
      </div>

      {/* Missiles mini chart */}
      <div className="bg-secondary/50 rounded-lg p-2 border border-border/30 mb-1.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[8px] font-bold uppercase text-danger">Missiles</span>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold font-mono text-danger leading-none">{d.missilesFired}</p>
              <p className="text-[6px] text-muted-foreground uppercase">Fired</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold font-mono text-success leading-none">{d.missilesInt}</p>
              <p className="text-[6px] text-muted-foreground uppercase">Int.</p>
            </div>
          </div>
        </div>
        <Sparkline data={d.missileSpark} color="#FF4757" height={24} />
        <div className="flex justify-between mt-0.5">
          <span className="text-[6px] text-muted-foreground font-mono">{range === "all" ? "Jan 15" : `-${range}`}</span>
          <span className="text-[6px] text-muted-foreground font-mono">now</span>
        </div>
      </div>

      {/* Drones mini chart */}
      <div className="bg-secondary/50 rounded-lg p-2 border border-border/30">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[8px] font-bold uppercase text-amber">Drones / UAV</span>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-bold font-mono text-amber leading-none">{d.dronesFired}</p>
              <p className="text-[6px] text-muted-foreground uppercase">Fired</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold font-mono text-success leading-none">{d.dronesInt}</p>
              <p className="text-[6px] text-muted-foreground uppercase">Int.</p>
            </div>
          </div>
        </div>
        <Sparkline data={d.droneSpark} color="#FFB020" height={24} />
        <div className="flex justify-between mt-0.5">
          <span className="text-[6px] text-muted-foreground font-mono">{range === "all" ? "Jan 15" : `-${range}`}</span>
          <span className="text-[6px] text-muted-foreground font-mono">now</span>
        </div>
      </div>

    </div>
  );
}

// ─── Defense Systems Card ───
type DefenseRange = "all" | "24h" | "48h" | "7d";

const defenseData: Record<DefenseRange, { name: string; type: string; intercepts: number }[]> = {
  all: [
    { name: "THAAD", type: "High Altitude", intercepts: 42 },
    { name: "Patriot PAC-3", type: "Ballistic", intercepts: 37 },
    { name: "Pantsir-S1", type: "Short Range", intercepts: 168 },
    { name: "EW Systems", type: "Electronic Warfare", intercepts: 130 },
  ],
  "24h": [
    { name: "THAAD", type: "High Altitude", intercepts: 5 },
    { name: "Patriot PAC-3", type: "Ballistic", intercepts: 2 },
    { name: "Pantsir-S1", type: "Short Range", intercepts: 8 },
    { name: "EW Systems", type: "Electronic Warfare", intercepts: 3 },
  ],
  "48h": [
    { name: "THAAD", type: "High Altitude", intercepts: 9 },
    { name: "Patriot PAC-3", type: "Ballistic", intercepts: 5 },
    { name: "Pantsir-S1", type: "Short Range", intercepts: 14 },
    { name: "EW Systems", type: "Electronic Warfare", intercepts: 6 },
  ],
  "7d": [
    { name: "THAAD", type: "High Altitude", intercepts: 15 },
    { name: "Patriot PAC-3", type: "Ballistic", intercepts: 11 },
    { name: "Pantsir-S1", type: "Short Range", intercepts: 38 },
    { name: "EW Systems", type: "Electronic Warfare", intercepts: 21 },
  ],
};

function DefenseCard() {
  const [range, setRange] = useState<DefenseRange>("all");
  const systems = defenseData[range];
  const totalInt = systems.reduce((s, sys) => s + sys.intercepts, 0);

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <ShieldCheckIcon className="w-3 h-3 text-teal" weight="duotone" />
        <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Defense Systems</span>
        <div className="flex items-center gap-0.5 ml-auto">
          {(["all", "24h", "48h", "7d"] as const).map((t) => (
            <button key={t} onClick={() => setRange(t)}
              className={cn(
                "text-[7px] font-mono font-bold px-1.5 py-0.5 rounded transition-colors",
                range === t ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
              )}>
              {t === "all" ? "All" : t}
            </button>
          ))}
        </div>
      </div>

      {/* Total intercepts hero */}
      <div className="bg-secondary/50 rounded-lg p-2 border border-border/30 mb-2 flex items-center justify-between">
        <div>
          <p className="text-xl font-bold font-mono text-success leading-none">{totalInt}</p>
          <p className="text-[7px] text-muted-foreground uppercase mt-0.5">Total Intercepts</p>
        </div>
        <Badge variant="outline" className="text-[7px] border-0 px-1.5 py-0.5 text-success bg-success-dim font-bold">ALL SYSTEMS ACTIVE</Badge>
      </div>

      <div className="space-y-1.5">
        {systems.map((sys) => (
          <div key={sys.name} className="bg-secondary/50 rounded-md p-2 border border-border/30 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold">{sys.name}</p>
              <p className="text-[7px] text-muted-foreground">{sys.type}</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Mini bar */}
              <div className="w-12 h-1 bg-background rounded-full overflow-hidden">
                <div className="h-full bg-teal rounded-full" style={{ width: `${(sys.intercepts / Math.max(...systems.map(s => s.intercepts))) * 100}%` }} />
              </div>
              <span className="text-sm font-bold font-mono text-success leading-none w-8 text-right">{sys.intercepts}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Situation Status + GPS Card ───
function SituationCard() {
  const lastAttackHoursAgo = 32;
  const isActive = lastAttackHoursAgo < 6;
  const isCaution = lastAttackHoursAgo >= 6 && lastAttackHoursAgo < 24;

  const statusColor = isActive ? "text-danger" : isCaution ? "text-amber" : "text-success";
  const statusBg = isActive ? "bg-danger-dim border-danger/30" : isCaution ? "bg-amber-dim border-amber/30" : "bg-success-dim border-success/30";
  const statusLabel = isActive ? "ACTIVE THREAT" : isCaution ? "ELEVATED" : "COOLDOWN";

  const gpsJammed = true;
  const gpsSince = "Mar 18";

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <SirenIcon className="w-3 h-3 text-cyan" weight="duotone" />
        <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Situation Status</span>
        <span className="text-[7px] font-mono text-muted-foreground ml-auto">Now</span>
      </div>

      {/* Two-column layout: War Status + GPS */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        {/* War Status */}
        <div className={cn("rounded-lg p-2.5 border", statusBg)}>
          <div className="flex items-center gap-1.5 mb-2">
            {isActive ? (
              <ShieldWarningIcon className="w-4 h-4 text-danger pulse-live" weight="fill" />
            ) : isCaution ? (
              <WarningIcon className="w-4 h-4 text-amber" weight="fill" />
            ) : (
              <ShieldCheckIcon className="w-4 h-4 text-success" weight="fill" />
            )}
            <span className="text-[7px] uppercase text-muted-foreground font-bold">Conflict</span>
          </div>
          <p className={cn("text-sm font-bold font-mono leading-none mb-1", statusColor)}>{statusLabel}</p>
          <p className="text-[7px] text-muted-foreground font-mono">Silent since Mon</p>
        </div>

        {/* GPS Status */}
        <div className={cn(
          "rounded-lg p-2.5 border",
          gpsJammed ? "bg-danger-dim border-danger/30" : "bg-success-dim border-success/30"
        )}>
          <div className="flex items-center gap-1.5 mb-2">
            {gpsJammed ? (
              <GpsSlashIcon className="w-4 h-4 text-danger pulse-live" weight="fill" />
            ) : (
              <NavigationArrowIcon className="w-4 h-4 text-success" weight="fill" />
            )}
            <span className="text-[7px] uppercase text-muted-foreground font-bold">GPS</span>
          </div>
          <p className={cn("text-sm font-bold font-mono leading-none mb-1", gpsJammed ? "text-danger" : "text-success")}>
            {gpsJammed ? "JAMMED" : "NORMAL"}
          </p>
          <p className="text-[7px] text-muted-foreground font-mono">{gpsJammed ? `Since ${gpsSince}` : "All nominal"}</p>
        </div>
      </div>

      {/* Quick status row */}
      <div className="grid grid-cols-2 gap-1.5">
        {([
          { label: "Airspace", value: "OPEN", ok: true, Icon: AirplaneTiltIcon },
          { label: "Internet", value: "STABLE", ok: true, Icon: WifiHighIcon },
          { label: "Civil Defense", value: "STANDBY", ok: true, Icon: ShieldCheckIcon },
          { label: "Power Grid", value: "NORMAL", ok: true, Icon: NavigationArrowIcon },
        ] as const).map((s) => (
          <div key={s.label} className="bg-secondary/50 rounded-md px-2 py-1.5 border border-border/30 flex items-center gap-2">
            <s.Icon className={cn("w-3.5 h-3.5 shrink-0", s.ok ? "text-success" : "text-danger")} weight="bold" />
            <div className="min-w-0">
              <p className={cn("text-[8px] font-bold font-mono leading-none", s.ok ? "text-success" : "text-danger")}>{s.value}</p>
              <p className="text-[6px] text-muted-foreground uppercase mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared Delta ───
function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="text-[7px] font-mono text-muted-foreground">-</span>;
  return (
    <span className={cn("text-[7px] font-mono font-bold", value > 0 ? "text-danger" : "text-success")}>
      {value > 0 ? "+" : ""}{value}%
    </span>
  );
}

// ─── Carousel ───
const cards = [
  { id: "aviation", label: "Aviation" },
  { id: "threats", label: "Threats" },
  { id: "defense", label: "Defense" },
  { id: "situation", label: "Status" },
];

export default function StatsCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % cards.length);
    }, 8000);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <Card
      className="border-border/50"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <CardContent className="p-2.5">
        {/* Content with fade animation */}
        <div key={cards[active].id} className="animate-in fade-in slide-in-from-right-2 duration-300">
          {active === 0 && <AviationCard />}
          {active === 1 && <ThreatCard />}
          {active === 2 && <DefenseCard />}
          {active === 3 && <SituationCard />}
        </div>

        {/* Dot indicators with labels */}
        <div className="flex items-center justify-center gap-1.5 mt-2.5 pt-2 border-t border-border/20">
          {cards.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setActive(i)}
              className={cn(
                "rounded-full transition-all duration-300 cursor-pointer text-[7px] font-mono px-2 py-0.5",
                i === active ? "bg-teal/15 text-teal font-bold" : "text-muted-foreground/50 hover:text-muted-foreground"
              )}
            >
              {c.label}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
