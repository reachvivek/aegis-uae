"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  SirenIcon, ShieldCheckIcon, ShieldWarningIcon, WarningIcon,
  GpsSlashIcon, NavigationArrowIcon, MapPinIcon,
  ClockIcon, AirplaneTiltIcon,
} from "@phosphor-icons/react";

export default function SituationStatus() {
  // Mock data - wire to live backend
  const lastAttackHoursAgo = 32;
  const isActive = lastAttackHoursAgo < 6;
  const isCaution = lastAttackHoursAgo >= 6 && lastAttackHoursAgo < 24;
  const isCooldown = lastAttackHoursAgo >= 24;

  const statusColor = isActive ? "text-danger" : isCaution ? "text-amber" : "text-success";
  const statusBg = isActive ? "bg-danger-dim border-danger/30" : isCaution ? "bg-amber-dim border-amber/30" : "bg-success-dim border-success/30";
  const statusLabel = isActive ? "ACTIVE THREAT" : isCaution ? "ELEVATED CAUTION" : "COOLDOWN";
  const statusDesc = isActive
    ? "Incoming threats detected - seek shelter immediately and follow civil defense instructions."
    : isCaution
    ? "Recent activity detected within 24h - maintain heightened awareness and monitor updates."
    : `No attacks in ${lastAttackHoursAgo} hours - situation stable. Continue monitoring.`;

  // GPS
  const gpsJammed = true;
  const gpsRegions = ["Dubai", "Abu Dhabi", "Northern Emirates"];
  const gpsSince = "Mar 18, 2026";
  const gpsAffected = "Navigation, ride-hailing, delivery apps, aviation GPS approaches";

  // Quick status items
  const quickStatus = [
    { label: "UAE Airspace", value: "OPEN", ok: true },
    { label: "DXB Airport", value: "OPERATIONAL", ok: true },
    { label: "AUH Airport", value: "OPERATIONAL", ok: true },
    { label: "Civil Defense", value: "STANDBY", ok: true },
    { label: "Internet", value: "NORMAL", ok: true },
    { label: "Telecom", value: "NORMAL", ok: true },
  ];

  return (
    <Card className="h-full flex flex-col border-border/50">
      <CardHeader className="px-3 pt-3 pb-2 shrink-0">
        <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-foreground flex items-center gap-1.5">
          <SirenIcon className="w-3.5 h-3.5 text-cyan" weight="duotone" />
          Situation Status
        </CardTitle>
        <p className="text-[7px] font-mono text-muted-foreground mt-0.5">
          Operational status overview
        </p>
      </CardHeader>

      <CardContent className="px-3 pb-3 flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-3">

            {/* War Status Hero */}
            <div className={cn("rounded-lg p-4 border", statusBg)}>
              <div className="flex items-center gap-3 mb-2">
                {isActive ? (
                  <ShieldWarningIcon className="w-8 h-8 text-danger pulse-live" weight="fill" />
                ) : isCaution ? (
                  <WarningIcon className="w-8 h-8 text-amber" weight="fill" />
                ) : (
                  <ShieldCheckIcon className="w-8 h-8 text-success" weight="fill" />
                )}
                <div>
                  <p className={cn("text-xl font-bold font-mono leading-none", statusColor)}>{statusLabel}</p>
                  <p className="text-[9px] text-muted-foreground mt-1 flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" weight="bold" />
                    Last activity: {lastAttackHoursAgo}h ago
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{statusDesc}</p>
            </div>

            {/* GPS Jamming Status */}
            <div className={cn(
              "rounded-lg p-4 border",
              gpsJammed ? "bg-danger-dim border-danger/30" : "bg-success-dim border-success/30"
            )}>
              <div className="flex items-center gap-3 mb-2">
                {gpsJammed ? (
                  <GpsSlashIcon className="w-7 h-7 text-danger pulse-live" weight="fill" />
                ) : (
                  <NavigationArrowIcon className="w-7 h-7 text-success" weight="fill" />
                )}
                <div>
                  <p className={cn("text-lg font-bold font-mono leading-none", gpsJammed ? "text-danger" : "text-success")}>
                    {gpsJammed ? "GPS JAMMED" : "GPS NORMAL"}
                  </p>
                  <p className="text-[8px] text-muted-foreground mt-0.5">
                    {gpsJammed ? `Ongoing since ${gpsSince}` : "All signals nominal across UAE"}
                  </p>
                </div>
              </div>

              {gpsJammed && (
                <>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {gpsRegions.map((r) => (
                      <Badge key={r} variant="outline" className="text-[7px] border-danger/30 text-danger bg-danger-dim px-1.5 py-0">
                        <MapPinIcon className="w-2 h-2 mr-0.5" weight="bold" />{r}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-[9px] text-muted-foreground leading-relaxed">
                    <span className="font-bold text-foreground">Affected services:</span> {gpsAffected}
                  </p>
                  <div className="mt-2 bg-amber/10 border border-amber/20 rounded-md px-2.5 py-1.5">
                    <p className="text-[9px] text-amber font-medium">
                      Use offline maps & manual navigation as fallback. Avoid GPS-dependent route planning.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Quick Status Grid */}
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-muted-foreground mb-2">Systems Overview</p>
              <div className="grid grid-cols-2 gap-1.5">
                {quickStatus.map((s) => (
                  <div key={s.label} className="bg-secondary/50 rounded-md px-2.5 py-2 border border-border/30 flex items-center justify-between">
                    <span className="text-[9px] text-muted-foreground">{s.label}</span>
                    <Badge variant="outline" className={cn(
                      "text-[7px] border-0 px-1.5 py-0 font-bold",
                      s.ok ? "text-success bg-success-dim" : "text-danger bg-danger-dim"
                    )}>
                      {s.value}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
