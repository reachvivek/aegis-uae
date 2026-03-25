"use client";

import { useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn, getStatusColor } from "@/lib/utils";
import {
  ShieldIcon, AirplaneTiltIcon, WarningIcon, PulseIcon,
  CloudRainIcon, CloudLightningIcon, ClockIcon,
} from "@phosphor-icons/react";

interface StatusItem {
  label: string;
  value: string;
  status: "normal" | "elevated" | "critical";
  icon: React.ComponentType<{ className?: string; weight?: "bold" | "duotone" | "regular" }>;
  blink?: boolean;
  tooltip: string;
  group: "aviation" | "security" | "weather";
}

const statuses: StatusItem[] = [
  { label: "AIRSPACE", value: "OPEN", status: "normal", icon: AirplaneTiltIcon, group: "aviation",
    tooltip: "All UAE civilian air corridors are active. No restrictions." },
  { label: "DXB", value: "LOW", status: "normal", icon: PulseIcon, group: "aviation",
    tooltip: "DXB delay index: LOW. 87% on-time rate over last 24h." },
  { label: "AUH", value: "LOW", status: "normal", icon: PulseIcon, group: "aviation",
    tooltip: "AUH delay index: LOW. 90% on-time rate over last 24h." },
  { label: "GCAA", value: "NORMAL", status: "normal", icon: ShieldIcon, group: "security",
    tooltip: "GCAA operational status: NORMAL. No active directives." },
  { label: "THREAT", value: "ELEVATED", status: "elevated", icon: WarningIcon, group: "security",
    tooltip: "Regional threat assessment: ELEVATED. Standard security posture. No action required." },
  { label: "RAIN", value: "WARNING", status: "elevated", icon: CloudRainIcon, blink: true, group: "weather",
    tooltip: "NCM heavy rain warning: 30-50mm expected. Abu Dhabi, Dubai, Sharjah affected." },
  { label: "THUNDER", value: "WATCH", status: "elevated", icon: CloudLightningIcon, blink: true, group: "weather",
    tooltip: "Thunderstorm watch: Eastern UAE & Al Ain. Lightning activity possible." },
];

const GroupIcon = ({ group }: { group: string }) => {
  if (group === "aviation") return <AirplaneTiltIcon className="w-2.5 h-2.5 text-teal" weight="bold" />;
  if (group === "security") return <ShieldIcon className="w-2.5 h-2.5 text-amber" weight="bold" />;
  return <CloudRainIcon className="w-2.5 h-2.5 text-blue-400" weight="bold" />;
};

export default function StatusTicker() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () =>
      setTime(new Date().toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Asia/Dubai",
      }));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const groups = ["aviation", "security", "weather"] as const;

  return (
    <TooltipProvider>
      <div className="w-full bg-card/50 backdrop-blur-sm border-b border-border shrink-0">
        <div className="max-w-[1920px] mx-auto px-2 sm:px-3 h-6 sm:h-7 flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none">
          {/* Live */}
          <div className="flex items-center gap-1 pr-2 border-r border-border/50 shrink-0">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute h-full w-full rounded-full bg-teal opacity-60" />
              <span className="relative rounded-full h-1.5 w-1.5 bg-teal" />
            </span>
            <span className="text-[8px] font-bold tracking-[0.2em] text-teal uppercase">Live</span>
          </div>

          {/* Grouped status pills */}
          {groups.map((group, gi) => (
            <div key={group} className="flex items-center gap-1 shrink-0">
              {gi > 0 && <div className="w-px h-3 bg-border/40 mx-0.5" />}
              <GroupIcon group={group} />
              {statuses.filter((s) => s.group === group).map((s) => (
                  <Tooltip key={s.label}>
                    <TooltipTrigger
                      className={cn(
                        "flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-card/80 shrink-0 cursor-help transition-colors hover:bg-secondary",
                        s.blink && "animate-pulse"
                      )}>
                        <span className="text-[8px] text-muted-foreground font-mono">{s.label}:</span>
                        <span className={cn("text-[8px] font-bold font-mono", getStatusColor(s.status))}>{s.value}</span>
                        {s.blink && (
                          <span className="relative flex h-1 w-1 ml-0.5">
                            <span className="animate-ping absolute h-full w-full rounded-full bg-amber opacity-75" />
                            <span className="relative rounded-full h-1 w-1 bg-amber" />
                          </span>
                        )}
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[250px] text-[10px]">
                      <p>{s.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
              ))}
            </div>
          ))}

          {/* Clock - hidden on mobile (shown in header) */}
          <div className="ml-auto hidden sm:flex items-center gap-1 shrink-0 pl-2 border-l border-border/50">
            <ClockIcon className="w-2.5 h-2.5 text-teal/50" weight="bold" />
            <span className="text-[8px] text-muted-foreground font-mono">{time} GST</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
