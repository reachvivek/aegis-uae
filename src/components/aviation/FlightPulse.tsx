"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { AirplaneTiltIcon, TrendUpIcon, TrendDownIcon, MinusIcon } from "@phosphor-icons/react";

const airports = [
  {
    code: "DXB", name: "Dubai Intl", total: 1247, onTime: 1089, delayed: 142, cancelled: 16,
    index: "low" as ("up" | "down" | "stable" | "low" | "moderate" | "high"),
    trend: "up" as ("up" | "down" | "stable"),
    delayDelta: -8, cancelDelta: -3,
    breakdown: { weather: 52, technical: 38, congestion: 52 },
  },
  {
    code: "AUH", name: "Abu Dhabi Intl", total: 634, onTime: 571, delayed: 56, cancelled: 7,
    index: "low" as ("up" | "down" | "stable" | "low" | "moderate" | "high"),
    trend: "stable" as ("up" | "down" | "stable"),
    delayDelta: +2, cancelDelta: 0,
    breakdown: { weather: 28, technical: 12, congestion: 16 },
  },
];

const indexStyle: Record<string, string> = {
  low: "text-success bg-success-dim",
  moderate: "text-amber bg-amber-dim",
  high: "text-danger bg-danger-dim",
};

function Delta({ value }: { value: number }) {
  if (value === 0) return <span className="text-[7px] font-mono text-muted-foreground">-</span>;
  return (
    <span className={cn("text-[7px] font-mono font-bold", value > 0 ? "text-danger" : "text-success")}>
      {value > 0 ? "+" : ""}{value}%
    </span>
  );
}

function TrendArrow({ trend }: { trend: string }) {
  if (trend === "up") return <TrendUpIcon className="w-2.5 h-2.5 text-success" weight="bold" />;
  if (trend === "down") return <TrendDownIcon className="w-2.5 h-2.5 text-danger" weight="bold" />;
  return <MinusIcon className="w-2.5 h-2.5 text-muted-foreground" weight="bold" />;
}

export default function FlightPulse() {
  return (
    <TooltipProvider>
      <Card className="border-border/50">
        <CardContent className="p-2.5">
          <div className="flex items-center gap-1.5 mb-2">
            <AirplaneTiltIcon className="w-3 h-3 text-teal" weight="duotone" />
            <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Aviation Pulse</span>
            <span className="text-[7px] font-mono text-muted-foreground ml-auto">24h</span>
          </div>

          <div className="space-y-2">
            {airports.map((ap) => {
              const rate = Math.round((ap.onTime / ap.total) * 100);
              return (
                <div key={ap.code} className="bg-secondary/50 rounded-lg p-2 border border-border/30">
                  {/* Row 1: Code + trend + badge + on-time */}
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold font-mono">{ap.code}</span>
                      <TrendArrow trend={ap.trend} />
                      <Badge variant="outline" className={cn("text-[7px] font-bold uppercase border-0 py-0 px-1", indexStyle[ap.index])}>
                        {ap.index}
                      </Badge>
                    </div>
                    <span className="text-sm font-bold font-mono text-success">{rate}%</span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 bg-background rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-gradient-to-r from-teal to-success rounded-full transition-all duration-1000"
                      style={{ width: `${rate}%` }} />
                  </div>

                  {/* Row 2: Stats in a clean table layout */}
                  <div className="flex items-center justify-between text-center">
                    <div className="flex-1">
                      <p className="text-xs font-bold font-mono leading-none">{ap.total.toLocaleString()}</p>
                      <p className="text-[6px] text-muted-foreground uppercase mt-0.5">Flights</p>
                    </div>
                    <div className="w-px h-5 bg-border/30" />
                    <Tooltip>
                      <TooltipTrigger className="flex-1 cursor-help">
                        <p className="text-xs font-bold font-mono leading-none text-amber">{ap.delayed}</p>
                        <div className="flex items-center justify-center gap-0.5 mt-0.5">
                          <p className="text-[6px] text-muted-foreground uppercase">Delayed</p>
                          <Delta value={ap.delayDelta} />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-[10px]">
                        <p className="font-semibold mb-1">Delay Breakdown</p>
                        <div className="space-y-0.5 font-mono text-[9px]">
                          <div className="flex justify-between gap-3"><span>Weather</span><span>{ap.breakdown.weather}</span></div>
                          <div className="flex justify-between gap-3"><span>Technical</span><span>{ap.breakdown.technical}</span></div>
                          <div className="flex justify-between gap-3"><span>Congestion</span><span>{ap.breakdown.congestion}</span></div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                    <div className="w-px h-5 bg-border/30" />
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
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
