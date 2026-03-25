"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PathIcon, AirplaneTiltIcon, CarIcon, WarningIcon,
  CheckCircleIcon, XCircleIcon, ClockIcon, MapPinIcon, ArrowRightIcon,
  BoatIcon, UsersIcon,
} from "@phosphor-icons/react";
import StandardModal from "@/components/ui/standard-modal";

type RouteStatus = "open" | "congested" | "closed";
type RouteType = "air" | "road" | "sea";

interface EvacRoute {
  id: string;
  name: string;
  type: RouteType;
  from: string;
  to: string;
  via: string;
  status: RouteStatus;
  travelTime: string;
  distance: string;
  notes: string;
  checkpoints: string[];
  lastVerified: string;
  capacity: string;
}

const evacRoutes: EvacRoute[] = [
  {
    id: "r1", name: "Oman Land Crossing - Hatta", type: "road", from: "Dubai", to: "Muscat, Oman",
    via: "Hatta Border → Al Buraimi → Muscat", status: "open", travelTime: "4h 30m", distance: "470 km",
    notes: "Primary land evacuation route. E44 highway clear. Oman visa-on-arrival for most nationalities.",
    checkpoints: ["Hatta Border Post", "Al Buraimi Checkpoint", "Sohar Junction"],
    lastVerified: "2026-03-25T11:00:00Z", capacity: "~2,000 vehicles/hr",
  },
  {
    id: "r2", name: "Oman Land Crossing - Al Ain", type: "road", from: "Abu Dhabi", to: "Muscat, Oman",
    via: "Al Ain → Buraimi → Nizwa → Muscat", status: "open", travelTime: "5h", distance: "520 km",
    notes: "Secondary route via Al Ain. Higher elevation, less flood-prone. Good for Abu Dhabi departures.",
    checkpoints: ["Al Ain Border", "Buraimi Gate", "Nizwa Roundabout"],
    lastVerified: "2026-03-25T10:30:00Z", capacity: "~1,500 vehicles/hr",
  },
  {
    id: "r3", name: "Saudi Land Crossing - Ghuweifat", type: "road", from: "Abu Dhabi", to: "Dammam, Saudi",
    via: "Abu Dhabi → Ghuweifat Border → Dammam", status: "open", travelTime: "6h", distance: "600 km",
    notes: "Western evacuation via Saudi. Requires valid Saudi visa or GCC residency. Desert route - carry water.",
    checkpoints: ["Ghuweifat Border", "Haradh Junction", "Hofuf City"],
    lastVerified: "2026-03-25T09:00:00Z", capacity: "~1,200 vehicles/hr",
  },
  {
    id: "r4", name: "Muscat International Airport", type: "air", from: "Muscat (via land)", to: "International",
    via: "Drive to Muscat → MCT Airport → Global", status: "open", travelTime: "5-7h total", distance: "470+ km",
    notes: "If UAE airports close, drive to Oman then fly from MCT. Oman Air/SalamAir operating normally.",
    checkpoints: ["UAE-Oman Border", "MCT Airport Terminal"],
    lastVerified: "2026-03-25T11:30:00Z", capacity: "45 flights/day",
  },
  {
    id: "r5", name: "Bahrain via Saudi (King Fahd)", type: "road", from: "UAE", to: "Bahrain",
    via: "Ghuweifat → Dammam → King Fahd Causeway → Bahrain", status: "congested", travelTime: "8-10h", distance: "850 km",
    notes: "Long route but reaches Bahrain International (BAH). Causeway can be congested. Check live traffic.",
    checkpoints: ["Ghuweifat Border", "Dammam", "King Fahd Causeway"],
    lastVerified: "2026-03-25T08:00:00Z", capacity: "~800 vehicles/hr",
  },
  {
    id: "r6", name: "Fujairah Port - Sea Evacuation", type: "sea", from: "Fujairah", to: "Muscat (Maritime)",
    via: "Fujairah Port → Strait of Hormuz → Muscat Port", status: "open", travelTime: "6-8h", distance: "200 nm",
    notes: "Maritime evacuation option. Ferry services may be activated. Contact Fujairah Port Authority.",
    checkpoints: ["Fujairah Port Gate", "Strait Clearance"],
    lastVerified: "2026-03-25T07:00:00Z", capacity: "3 ferries/day",
  },
];

const statusConfig: Record<RouteStatus, { label: string; color: string; bg: string; border: string; Icon: React.ComponentType<any> }> = {
  open: { label: "OPEN", color: "text-success", bg: "bg-success-dim", border: "border-success/30", Icon: CheckCircleIcon },
  congested: { label: "CONGESTED", color: "text-amber", bg: "bg-amber-dim", border: "border-amber/30", Icon: WarningIcon },
  closed: { label: "CLOSED", color: "text-danger", bg: "bg-danger-dim", border: "border-danger/30", Icon: XCircleIcon },
};

const typeConfig: Record<RouteType, { Icon: React.ComponentType<any>; label: string; color: string }> = {
  road: { Icon: CarIcon, label: "Road", color: "text-teal" },
  air: { Icon: AirplaneTiltIcon, label: "Air", color: "text-cyan" },
  sea: { Icon: BoatIcon, label: "Sea", color: "text-blue-400" },
};

// Enhanced route card for the modal
function ModalRouteCard({ route }: { route: EvacRoute }) {
  const sc = statusConfig[route.status];
  const StatusIcon = sc.Icon;
  const tc = typeConfig[route.type];
  const TypeIcon = tc.Icon;
  return (
    <div className={cn("rounded-xl border p-4 transition-colors", sc.border, "bg-secondary/20 hover:bg-secondary/40")}>
      {/* Header row */}
      <div className="flex items-center gap-2 mb-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", tc.color === "text-teal" ? "bg-teal-dim" : tc.color === "text-cyan" ? "bg-cyan/10" : "bg-blue-500/10")}>
          <TypeIcon className={cn("w-4 h-4", tc.color)} weight="duotone" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold truncate">{route.name}</p>
          <p className="text-[10px] text-muted-foreground font-mono">{tc.label} Route</p>
        </div>
        <Badge variant="outline" className={cn("text-[9px] font-bold gap-1 px-2 py-0.5 border", sc.color, sc.bg, sc.border)}>
          <StatusIcon className="w-3 h-3" weight="bold" />
          {sc.label}
        </Badge>
      </div>

      {/* Route path */}
      <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground mb-3 bg-background/50 rounded-lg px-3 py-2">
        <MapPinIcon className="w-3 h-3 text-teal shrink-0" weight="bold" />
        <span>{route.from}</span>
        <ArrowRightIcon className="w-3 h-3 shrink-0" weight="bold" />
        <span className="text-foreground font-semibold">{route.to}</span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-background/50 rounded-lg px-2.5 py-1.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <ClockIcon className="w-3 h-3 text-teal" weight="bold" />
          </div>
          <p className="text-xs font-bold font-mono">{route.travelTime}</p>
          <p className="text-[7px] text-muted-foreground uppercase">Travel Time</p>
        </div>
        <div className="bg-background/50 rounded-lg px-2.5 py-1.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <MapPinIcon className="w-3 h-3 text-teal" weight="bold" />
          </div>
          <p className="text-xs font-bold font-mono">{route.distance}</p>
          <p className="text-[7px] text-muted-foreground uppercase">Distance</p>
        </div>
        <div className="bg-background/50 rounded-lg px-2.5 py-1.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <UsersIcon className="w-3 h-3 text-teal" weight="bold" />
          </div>
          <p className="text-[10px] font-bold font-mono">{route.capacity}</p>
          <p className="text-[7px] text-muted-foreground uppercase">Capacity</p>
        </div>
        <div className="bg-background/50 rounded-lg px-2.5 py-1.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <CheckCircleIcon className="w-3 h-3 text-muted-foreground" weight="bold" />
          </div>
          <p className="text-[10px] font-bold font-mono">{route.checkpoints.length}</p>
          <p className="text-[7px] text-muted-foreground uppercase">Checkpoints</p>
        </div>
      </div>

      {/* Via */}
      <p className="text-[10px] text-foreground/70 leading-relaxed mb-2">{route.via}</p>

      {/* Checkpoints */}
      <div className="flex items-center gap-1 flex-wrap mb-2">
        {route.checkpoints.map((cp, i) => (
          <Badge key={i} variant="outline" className="text-[8px] border-border/50 text-muted-foreground px-1.5 py-0.5">
            {cp}
          </Badge>
        ))}
      </div>

      {/* Notes */}
      <div className="bg-amber/5 border border-amber/15 rounded-lg px-3 py-2">
        <p className="text-[9px] text-amber/80 leading-relaxed">{route.notes}</p>
      </div>
    </div>
  );
}

// Filter tabs shared between panel and modal
function TypeFilterTabs({ value, onChange, size = "sm" }: { value: RouteType | "all"; onChange: (v: RouteType | "all") => void; size?: "sm" | "md" }) {
  const tabs = [
    { value: "all" as const, label: "All", Icon: PathIcon, color: "text-foreground" },
    { value: "road" as const, label: "Road", Icon: CarIcon, color: "text-teal" },
    { value: "air" as const, label: "Air", Icon: AirplaneTiltIcon, color: "text-cyan" },
    { value: "sea" as const, label: "Sea", Icon: BoatIcon, color: "text-blue-400" },
  ];
  const isSmall = size === "sm";
  return (
    <div className="flex items-center gap-1">
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "flex items-center gap-1 rounded transition-colors cursor-pointer font-mono font-bold",
            isSmall ? "text-[7px] px-1.5 py-0.5" : "text-[10px] px-2.5 py-1",
            value === t.value
              ? "bg-secondary text-foreground border border-border"
              : "text-muted-foreground hover:text-foreground border border-transparent"
          )}
        >
          <t.Icon className={cn(isSmall ? "w-2.5 h-2.5" : "w-3.5 h-3.5", value === t.value ? t.color : "")} weight="bold" />
          {t.label}
        </button>
      ))}
    </div>
  );
}

// Modal component
function EvacModal({ open, onOpenChange, openCount }: { open: boolean; onOpenChange: (v: boolean) => void; openCount: number }) {
  const [filter, setFilter] = useState<RouteType | "all">("all");
  const filtered = evacRoutes.filter((r) => filter === "all" || r.type === filter);

  return (
    <StandardModal
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title={
        <span className="flex items-center gap-2 text-danger">
          <PathIcon className="w-5 h-5" weight="duotone" />
          Emergency Evacuation Routes
          <Badge variant="outline" className="text-[9px] text-success border-success/20 bg-success-dim ml-2">
            {openCount}/{evacRoutes.length} ROUTES OPEN
          </Badge>
        </span>
      }
      description={
        <div className="flex items-center justify-between mt-2">
          <span>Alternative exit routes if UAE airports are closed or compromised</span>
          <TypeFilterTabs value={filter} onChange={setFilter} size="md" />
        </div>
      }
      footer={
        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        {filtered.map((route) => (
          <ModalRouteCard key={route.id} route={route} />
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">No routes found for this filter.</p>
        )}
      </div>
    </StandardModal>
  );
}

export default function EvacuationRoutes({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const openCount = evacRoutes.filter((r) => r.status === "open").length;
  return <EvacModal open={open} onOpenChange={onOpenChange} openCount={openCount} />;
}
