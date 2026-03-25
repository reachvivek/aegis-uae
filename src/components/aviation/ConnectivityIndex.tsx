"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { GlobeIcon, ArrowRightIcon, TrendUpIcon, TrendDownIcon, MinusIcon } from "@phosphor-icons/react";
import { useConnectivity } from "@/hooks/useConnectivity";

const fallbackRoutes = [
  { from: "DXB", to: "LHR", city: "London", stability: 98, trend: "up" as const },
  { from: "DXB", to: "JFK", city: "New York", stability: 95, trend: "stable" as const },
  { from: "AUH", to: "SIN", city: "Singapore", stability: 97, trend: "up" as const },
  { from: "DXB", to: "DEL", city: "Delhi", stability: 94, trend: "up" as const },
  { from: "DXB", to: "CDG", city: "Paris", stability: 92, trend: "stable" as const },
  { from: "AUH", to: "ICN", city: "Seoul", stability: 96, trend: "up" as const },
  { from: "DXB", to: "BKK", city: "Bangkok", stability: 91, trend: "down" as const },
  { from: "DXB", to: "IST", city: "Istanbul", stability: 88, trend: "down" as const },
  { from: "AUH", to: "SYD", city: "Sydney", stability: 93, trend: "stable" as const },
  { from: "DXB", to: "BEY", city: "Beirut", stability: 42, trend: "down" as const },
];

function scoreColor(s: number) {
  if (s >= 90) return "text-success";
  if (s >= 70) return "text-amber";
  return "text-danger";
}
function barColor(s: number) {
  if (s >= 90) return "from-teal to-success";
  if (s >= 70) return "from-amber to-yellow-500";
  return "from-danger to-red-600";
}

const TrendIcon = ({ trend }: { trend: string }) => {
  if (trend === "up") return <TrendUpIcon className="w-2.5 h-2.5 text-success" weight="bold" />;
  if (trend === "down") return <TrendDownIcon className="w-2.5 h-2.5 text-danger" weight="bold" />;
  return <MinusIcon className="w-2.5 h-2.5 text-muted-foreground" weight="bold" />;
};

export default function ConnectivityIndex() {
  const { routes: apiRoutes } = useConnectivity();
  const routes: typeof fallbackRoutes = apiRoutes.length > 0 ? apiRoutes : fallbackRoutes;

  return (
    <Card className="h-full flex flex-col border-border/50">
      <CardHeader className="px-3 pt-3 pb-1.5 shrink-0">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-foreground flex items-center gap-1.5">
          <GlobeIcon className="w-3.5 h-3.5 text-teal" weight="duotone" /> Connectivity Index
        </CardTitle>
        <p className="text-[7px] font-mono text-muted-foreground uppercase tracking-wider mt-0.5">
          Route stability · Successful / Scheduled · 24h
        </p>
      </CardHeader>
      <CardContent className="px-3 pb-3 flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-0.5">
            {routes.map((r) => (
              <div key={`${r.from}-${r.to}`} className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-secondary/50 transition-colors group">
                {/* Route */}
                <div className="flex items-center gap-1 min-w-[70px] shrink-0">
                  <span className="text-[10px] font-bold font-mono">{r.from}</span>
                  <ArrowRightIcon className="w-2.5 h-2.5 text-muted-foreground" weight="bold" />
                  <span className="text-[10px] font-bold font-mono">{r.to}</span>
                </div>

                {/* City */}
                <span className="text-[9px] text-muted-foreground min-w-[50px] hidden xl:block">{r.city}</span>

                {/* Bar */}
                <div className="flex-1 h-1 bg-background rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-700", barColor(r.stability))}
                    style={{ width: `${r.stability}%` }}
                  />
                </div>

                {/* Score + trend */}
                <div className="flex items-center gap-1 min-w-[42px] justify-end shrink-0">
                  <span className={cn("text-xs font-bold font-mono", scoreColor(r.stability))}>
                    {r.stability}%
                  </span>
                  <TrendIcon trend={r.trend} />
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
