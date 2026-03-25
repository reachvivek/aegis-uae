"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ShieldCheckIcon, MapPinIcon, NavigationArrowIcon,
  WarningIcon, HouseIcon, CarIcon, ClockIcon,
  ArrowRightIcon, UsersIcon, CrosshairIcon,
  RadioactiveIcon, WindIcon, FirstAidKitIcon,
  SirenIcon, MapTrifoldIcon,
} from "@phosphor-icons/react";
import StandardModal from "@/components/ui/standard-modal";

// ─── Types ───

interface Shelter {
  id: string;
  name: string;
  type: "bunker" | "underground" | "metro" | "hospital" | "civil_defense";
  lat: number;
  lng: number;
  capacity: number;
  distance: number; // km from user
  travelTime: number; // minutes by car
  supplies: ("water" | "medical" | "food" | "power")[];
  status: "open" | "limited" | "full";
  notes: string;
}

interface BlastZone {
  label: string;
  radius: number; // km
  color: string;
  description: string;
  survivalRate: string;
}

interface FalloutPrediction {
  direction: string;
  windSpeed: number; // km/h
  affectedAreas: string[];
  timeToArrival: string;
}

// ─── Mock Data ───

const shelters: Shelter[] = [
  {
    id: "s1", name: "Al Maqta Civil Defense Shelter", type: "civil_defense",
    lat: 24.4539, lng: 54.6200, capacity: 2000, distance: 3.2, travelTime: 8,
    supplies: ["water", "medical", "food", "power"], status: "open",
    notes: "Primary government shelter. NBC-rated protection. Full medical staff on standby.",
  },
  {
    id: "s2", name: "ADNEC Underground Complex", type: "underground",
    lat: 24.4500, lng: 54.6350, capacity: 5000, distance: 4.1, travelTime: 11,
    supplies: ["water", "food", "power"], status: "open",
    notes: "Multi-level underground parking converted to emergency shelter. Ventilation systems rated for CBRN events.",
  },
  {
    id: "s3", name: "Etihad Towers Basement Shelter", type: "underground",
    lat: 24.4620, lng: 54.3278, capacity: 1500, distance: 5.8, travelTime: 14,
    supplies: ["water", "medical", "power"], status: "open",
    notes: "Deep basement levels with reinforced concrete. Emergency generators for 72h.",
  },
  {
    id: "s4", name: "Sheikh Zayed Military Hospital", type: "hospital",
    lat: 24.4680, lng: 54.3710, capacity: 800, distance: 6.3, travelTime: 16,
    supplies: ["water", "medical", "food", "power"], status: "limited",
    notes: "Military hospital with underground emergency ward. Priority for casualties. Limited civilian intake.",
  },
  {
    id: "s5", name: "Abu Dhabi Metro Station - Central", type: "metro",
    lat: 24.4870, lng: 54.3640, capacity: 3000, distance: 7.1, travelTime: 18,
    supplies: ["water", "power"], status: "open",
    notes: "Deep metro station with blast-resistant design. Emergency supplies being stocked.",
  },
  {
    id: "s6", name: "Al Dhafra Bunker Complex", type: "bunker",
    lat: 24.2500, lng: 54.5470, capacity: 10000, distance: 22.5, travelTime: 35,
    supplies: ["water", "medical", "food", "power"], status: "open",
    notes: "Military-grade hardened bunker. Designed for extended occupancy (30+ days). Full NBC protection.",
  },
];

const blastZones: BlastZone[] = [
  { label: "Fireball", radius: 0.8, color: "#FF4757", description: "Complete destruction. No survival.", survivalRate: "0%" },
  { label: "Severe Blast", radius: 2.5, color: "#FF6B7A", description: "Heavy structural damage. Extreme injury risk.", survivalRate: "<5%" },
  { label: "Moderate Blast", radius: 5.0, color: "#FFB020", description: "Building damage. Flying debris. Burns from thermal radiation.", survivalRate: "~50%" },
  { label: "Light Damage", radius: 10.0, color: "#FFD93D", description: "Shattered windows. Light structural damage. Flash blindness risk.", survivalRate: ">80%" },
  { label: "Fallout Zone", radius: 25.0, color: "#9B59B6", description: "Radioactive fallout within hours. Shelter in place for 24-72h.", survivalRate: ">95% if sheltered" },
];

const falloutPrediction: FalloutPrediction = {
  direction: "NW to SE",
  windSpeed: 18,
  affectedAreas: ["Al Ain", "Eastern Abu Dhabi", "Dubai South"],
  timeToArrival: "2-4 hours post-detonation",
};

const nuclearRiskAssessment = {
  level: "LOW" as const,
  lastUpdated: "2026-03-25T12:00:00Z",
  analysis: "No credible nuclear threat detected. Current conflict limited to conventional ballistic missiles and drone warfare. Iran nuclear facilities under IAEA monitoring. Assessment based on OSINT and allied intelligence sharing.",
  scenarios: [
    { name: "Tactical nuclear use", probability: "Very Low", color: "text-success" },
    { name: "Dirty bomb / radiological", probability: "Low", color: "text-amber" },
    { name: "Nuclear facility incident", probability: "Very Low", color: "text-success" },
    { name: "Conventional escalation", probability: "Moderate", color: "text-amber" },
  ],
};

// ─── Config ───

const shelterTypeConfig: Record<string, { icon: React.ComponentType<any>; label: string; color: string }> = {
  bunker: { icon: ShieldCheckIcon, label: "Bunker", color: "text-teal bg-teal-dim" },
  underground: { icon: HouseIcon, label: "Underground", color: "text-blue-400 bg-blue-500/10" },
  metro: { icon: MapTrifoldIcon, label: "Metro Station", color: "text-cyan bg-cyan/10" },
  hospital: { icon: FirstAidKitIcon, label: "Hospital", color: "text-success bg-success-dim" },
  civil_defense: { icon: SirenIcon, label: "Civil Defense", color: "text-amber bg-amber-dim" },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  open: { label: "OPEN", color: "text-success bg-success-dim" },
  limited: { label: "LIMITED", color: "text-amber bg-amber-dim" },
  full: { label: "FULL", color: "text-danger bg-danger-dim" },
};

const supplyIcons: Record<string, string> = {
  water: "Water",
  medical: "Medical",
  food: "Food",
  power: "Power",
};

// ─── Sub Components ───

function ShelterCard({ shelter }: { shelter: Shelter }) {
  const tc = shelterTypeConfig[shelter.type];
  const sc = statusConfig[shelter.status];
  const TypeIcon = tc.icon;

  return (
    <div className="border border-border/40 hover:border-border rounded-lg p-3 transition-colors bg-card/40 hover:bg-card/80">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0", tc.color)}>
            <TypeIcon className="w-3.5 h-3.5" weight="bold" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold leading-snug truncate">{shelter.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="outline" className={cn("text-[6px] border-0 px-1 py-0", tc.color)}>
                {tc.label}
              </Badge>
              <Badge variant="outline" className={cn("text-[6px] border-0 px-1 py-0 font-bold", sc.color)}>
                {sc.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="bg-secondary/50 rounded-md px-2 py-1.5 text-center">
          <p className="text-xs font-bold font-mono leading-none">{shelter.distance}<span className="text-[7px] text-muted-foreground ml-0.5">km</span></p>
          <p className="text-[6px] text-muted-foreground uppercase mt-0.5">Distance</p>
        </div>
        <div className="bg-secondary/50 rounded-md px-2 py-1.5 text-center">
          <p className="text-xs font-bold font-mono leading-none">{shelter.travelTime}<span className="text-[7px] text-muted-foreground ml-0.5">min</span></p>
          <p className="text-[6px] text-muted-foreground uppercase mt-0.5">Drive</p>
        </div>
        <div className="bg-secondary/50 rounded-md px-2 py-1.5 text-center">
          <p className="text-xs font-bold font-mono leading-none">{shelter.capacity.toLocaleString()}</p>
          <p className="text-[6px] text-muted-foreground uppercase mt-0.5">Capacity</p>
        </div>
      </div>

      {/* Supplies */}
      <div className="flex items-center gap-1 mb-2">
        {shelter.supplies.map((s) => (
          <Badge key={s} variant="outline" className="text-[6px] border-border/30 text-muted-foreground px-1.5 py-0">
            {supplyIcons[s]}
          </Badge>
        ))}
      </div>

      {/* Notes */}
      <p className="text-[8px] text-muted-foreground leading-relaxed">{shelter.notes}</p>

      {/* Action */}
      <div className="flex items-center gap-2 mt-2">
        <Button variant="outline" size="sm" className="h-5 text-[8px] gap-1 flex-1">
          <NavigationArrowIcon className="w-2.5 h-2.5" weight="bold" /> Navigate
        </Button>
        <Button variant="outline" size="sm" className="h-5 text-[8px] gap-1 flex-1">
          <CarIcon className="w-2.5 h-2.5" weight="bold" /> Route
        </Button>
      </div>
    </div>
  );
}

function BlastRadiusPanel() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-1">
        <RadioactiveIcon className="w-3 h-3 text-purple-400" weight="duotone" />
        <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Blast Radius Zones</span>
        <span className="text-[7px] font-mono text-muted-foreground ml-auto">20kt yield estimate</span>
      </div>
      <p className="text-[8px] text-muted-foreground mb-2">
        Estimated zones based on a 20-kiloton surface detonation (Hiroshima-equivalent). Actual effects vary by terrain, altitude, and weapon type.
      </p>
      {blastZones.map((zone) => (
        <div key={zone.label} className="bg-secondary/50 rounded-md p-2.5 border border-border/30">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: zone.color }} />
              <span className="text-[10px] font-bold">{zone.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[7px] border-0 px-1.5 py-0 bg-secondary text-foreground font-mono">
                {zone.radius} km
              </Badge>
              <Badge variant="outline" className={cn(
                "text-[7px] border-0 px-1.5 py-0 font-bold",
                zone.survivalRate.includes("0%") ? "text-danger bg-danger-dim" :
                zone.survivalRate.includes("5%") ? "text-danger bg-danger-dim" :
                zone.survivalRate.includes("50%") ? "text-amber bg-amber-dim" :
                "text-success bg-success-dim"
              )}>
                {zone.survivalRate}
              </Badge>
            </div>
          </div>
          <p className="text-[8px] text-muted-foreground leading-relaxed">{zone.description}</p>
        </div>
      ))}
    </div>
  );
}

function FalloutPanel() {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-1">
        <WindIcon className="w-3 h-3 text-purple-400" weight="duotone" />
        <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Fallout Prediction</span>
      </div>

      <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-secondary/50 rounded-md px-2 py-1.5">
            <p className="text-[7px] text-muted-foreground uppercase">Wind Direction</p>
            <p className="text-xs font-bold font-mono">{falloutPrediction.direction}</p>
          </div>
          <div className="bg-secondary/50 rounded-md px-2 py-1.5">
            <p className="text-[7px] text-muted-foreground uppercase">Wind Speed</p>
            <p className="text-xs font-bold font-mono">{falloutPrediction.windSpeed} km/h</p>
          </div>
        </div>
        <div className="mb-2">
          <p className="text-[7px] text-muted-foreground uppercase mb-1">Projected Affected Areas</p>
          <div className="flex flex-wrap gap-1">
            {falloutPrediction.affectedAreas.map((area) => (
              <Badge key={area} variant="outline" className="text-[7px] border-purple-500/30 text-purple-400 bg-purple-500/10 px-1.5 py-0">
                <MapPinIcon className="w-2 h-2 mr-0.5" weight="bold" />{area}
              </Badge>
            ))}
          </div>
        </div>
        <div className="bg-amber/10 border border-amber/20 rounded-md px-2.5 py-1.5">
          <p className="text-[8px] text-amber font-medium">
            Estimated arrival: {falloutPrediction.timeToArrival}. Seek hardened shelter immediately. Seal all windows and ventilation.
          </p>
        </div>
      </div>
    </div>
  );
}

function RiskAssessmentPanel() {
  const riskColor = nuclearRiskAssessment.level === "LOW" ? "text-success" :
    nuclearRiskAssessment.level === "MODERATE" ? "text-amber" : "text-danger";
  const riskBg = nuclearRiskAssessment.level === "LOW" ? "bg-success-dim border-success/30" :
    nuclearRiskAssessment.level === "MODERATE" ? "bg-amber-dim border-amber/30" : "bg-danger-dim border-danger/30";

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-1">
        <CrosshairIcon className="w-3 h-3 text-cyan" weight="duotone" />
        <span className="text-[9px] font-bold uppercase tracking-[0.1em]">Nuclear Risk Assessment</span>
      </div>

      {/* Risk level hero */}
      <div className={cn("rounded-lg p-3 border", riskBg)}>
        <div className="flex items-center gap-2 mb-2">
          <RadioactiveIcon className={cn("w-6 h-6", riskColor)} weight="fill" />
          <div>
            <p className={cn("text-lg font-bold font-mono leading-none", riskColor)}>
              {nuclearRiskAssessment.level}
            </p>
            <p className="text-[7px] text-muted-foreground uppercase mt-0.5">Current threat level</p>
          </div>
        </div>
        <p className="text-[9px] text-muted-foreground leading-relaxed">{nuclearRiskAssessment.analysis}</p>
      </div>

      {/* Scenario matrix */}
      <div className="space-y-1">
        {nuclearRiskAssessment.scenarios.map((s) => (
          <div key={s.name} className="bg-secondary/50 rounded-md px-2.5 py-1.5 border border-border/30 flex items-center justify-between">
            <span className="text-[9px] text-foreground/80">{s.name}</span>
            <Badge variant="outline" className={cn("text-[7px] border-0 px-1.5 py-0 font-bold", s.color,
              s.color === "text-success" ? "bg-success-dim" : s.color === "text-amber" ? "bg-amber-dim" : "bg-danger-dim"
            )}>
              {s.probability}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Location Component ───

function LocationStatus({ location, onRequest }: { location: { lat: number; lng: number } | null; onRequest: () => void }) {
  return (
    <div className={cn(
      "rounded-lg p-2.5 border mb-3",
      location ? "bg-success-dim border-success/30" : "bg-secondary/50 border-border/30"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPinIcon className={cn("w-4 h-4", location ? "text-success" : "text-muted-foreground")} weight="fill" />
          <div>
            <p className="text-[9px] font-bold">
              {location ? "Location acquired" : "Location needed for nearest shelters"}
            </p>
            <p className="text-[7px] text-muted-foreground font-mono">
              {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : "Enable GPS or enter manually"}
            </p>
          </div>
        </div>
        {!location && (
          <Button size="sm" variant="outline" className="h-6 text-[8px] gap-1" onClick={onRequest}>
            <NavigationArrowIcon className="w-2.5 h-2.5" weight="bold" /> Enable
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───

type ShelterTab = "shelters" | "blast" | "fallout" | "risk";

export default function ShelterFinder({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [activeTab, setActiveTab] = useState<ShelterTab>("shelters");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {
          // Fallback to Abu Dhabi center
          setUserLocation({ lat: 24.4539, lng: 54.3773 });
        }
      );
    } else {
      setUserLocation({ lat: 24.4539, lng: 54.3773 });
    }
  };

  // Auto-request on open
  useEffect(() => {
    if (open && !userLocation) {
      requestLocation();
    }
  }, [open]);

  const sortedShelters = [...shelters].sort((a, b) => a.distance - b.distance);

  const tabs: { value: ShelterTab; label: string; icon: React.ComponentType<any>; color: string }[] = [
    { value: "shelters", label: "Shelters", icon: ShieldCheckIcon, color: "text-teal" },
    { value: "blast", label: "Blast Zones", icon: RadioactiveIcon, color: "text-purple-400" },
    { value: "fallout", label: "Fallout", icon: WindIcon, color: "text-amber" },
    { value: "risk", label: "Assessment", icon: CrosshairIcon, color: "text-cyan" },
  ];

  return (
    <StandardModal
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      title={
        <span className="flex items-center gap-2">
          <RadioactiveIcon className="w-4 h-4 text-purple-400" weight="duotone" />
          Shelter Finder & Nuclear Preparedness
        </span>
      }
      description={
        <div className="flex items-center gap-2 mt-1">
          {/* Tabs */}
          <div className="flex items-center gap-1">
            {tabs.map((t) => {
              const TabIcon = t.icon;
              return (
                <button
                  key={t.value}
                  onClick={() => setActiveTab(t.value)}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md text-[8px] font-bold uppercase transition-colors",
                    activeTab === t.value
                      ? cn(t.color, t.value === "shelters" ? "bg-teal-dim" : t.value === "blast" ? "bg-purple-500/10" : t.value === "fallout" ? "bg-amber-dim" : "bg-cyan/10")
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <TabIcon className="w-2.5 h-2.5" weight="bold" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <p className="text-[7px] text-muted-foreground">
            Data for planning purposes only. Follow official NCEMA directives in emergencies.
          </p>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      }
    >
      {/* Location bar */}
      <LocationStatus location={userLocation} onRequest={requestLocation} />

      {/* Tab content */}
      {activeTab === "shelters" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-bold uppercase tracking-[0.1em]">
              {sortedShelters.length} Shelters Found
            </span>
            <span className="text-[7px] font-mono text-muted-foreground">Sorted by distance</span>
          </div>
          {sortedShelters.map((s) => (
            <ShelterCard key={s.id} shelter={s} />
          ))}
        </div>
      )}

      {activeTab === "blast" && <BlastRadiusPanel />}
      {activeTab === "fallout" && <FalloutPanel />}
      {activeTab === "risk" && <RiskAssessmentPanel />}
    </StandardModal>
  );
}
