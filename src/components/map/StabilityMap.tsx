"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TargetIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon,
  CrosshairIcon, ArrowsOutIcon, ArrowsInIcon,
  AirplaneTiltIcon, CloudRainIcon, WarningIcon,
} from "@phosphor-icons/react";

// Types
interface Airport {
  code: string;
  name: string;
  lat: number;
  lng: number;
  delays: "low" | "moderate" | "high";
  flights24h: number;
  onTimeRate: number;
}

interface FlightPath {
  from: [number, number];
  to: [number, number];
  fromCode: string;
  toCode: string;
  status: "safe" | "rerouted" | "restricted";
}

interface WeatherZone {
  center: [number, number];
  radius: number;
  type: "rain" | "thunder" | "wind";
  severity: "low" | "moderate" | "high";
}

interface AirspaceZone {
  coords: [number, number][];
  type: "restricted" | "caution";
  label: string;
}

// Data
const airports: Airport[] = [
  { code: "DXB", name: "Dubai International", lat: 25.2532, lng: 55.3657, delays: "low", flights24h: 1247, onTimeRate: 87 },
  { code: "AUH", name: "Abu Dhabi International", lat: 24.4330, lng: 54.6511, delays: "low", flights24h: 634, onTimeRate: 90 },
  { code: "SHJ", name: "Sharjah International", lat: 25.3286, lng: 55.5172, delays: "low", flights24h: 89, onTimeRate: 92 },
  { code: "DWC", name: "Al Maktoum International", lat: 24.8960, lng: 55.1614, delays: "low", flights24h: 45, onTimeRate: 95 },
];

const flightPaths: FlightPath[] = [
  { from: [25.2532, 55.3657], to: [51.4700, -0.4543], fromCode: "DXB", toCode: "LHR", status: "safe" },
  { from: [25.2532, 55.3657], to: [28.5562, 77.1000], fromCode: "DXB", toCode: "DEL", status: "safe" },
  { from: [25.2532, 55.3657], to: [1.3644, 103.9915], fromCode: "DXB", toCode: "SIN", status: "safe" },
  { from: [25.2532, 55.3657], to: [41.2753, 28.7519], fromCode: "DXB", toCode: "IST", status: "rerouted" },
  { from: [25.2532, 55.3657], to: [33.8209, 35.4884], fromCode: "DXB", toCode: "BEY", status: "restricted" },
  { from: [24.4330, 54.6511], to: [37.4602, 126.4407], fromCode: "AUH", toCode: "ICN", status: "safe" },
  { from: [25.2532, 55.3657], to: [49.0097, 2.5479], fromCode: "DXB", toCode: "CDG", status: "safe" },
  { from: [25.2532, 55.3657], to: [13.6900, 100.7501], fromCode: "DXB", toCode: "BKK", status: "safe" },
];

const weatherZones: WeatherZone[] = [
  { center: [25.15, 55.25], radius: 25000, type: "rain", severity: "moderate" },
  { center: [24.45, 54.60], radius: 20000, type: "rain", severity: "low" },
  { center: [25.40, 55.80], radius: 15000, type: "thunder", severity: "high" },
  { center: [24.20, 55.70], radius: 18000, type: "rain", severity: "low" },
];

const airspaceZones: AirspaceZone[] = [
  {
    coords: [[26.5, 56.0], [26.5, 57.5], [25.0, 57.5], [25.0, 56.0]],
    type: "caution", label: "Exercise Area - Caution",
  },
];

// Color helpers
const delayColors = { low: "#2ED573", moderate: "#FFB020", high: "#FF4757" };
const pathColors = { safe: "#2ED57380", rerouted: "#FFB02090", restricted: "#FF475780" };
const pathDash = { safe: "8, 6", rerouted: "4, 8", restricted: "2, 6" };
const weatherColors = {
  rain: { low: "rgba(59,130,246,0.12)", moderate: "rgba(59,130,246,0.22)", high: "rgba(59,130,246,0.35)" },
  thunder: { low: "rgba(255,176,32,0.12)", moderate: "rgba(255,176,32,0.22)", high: "rgba(255,176,32,0.35)" },
  wind: { low: "rgba(0,180,216,0.12)", moderate: "rgba(0,180,216,0.22)", high: "rgba(0,180,216,0.35)" },
};
const weatherBorders = {
  rain: "rgba(59,130,246,0.4)",
  thunder: "rgba(255,176,32,0.5)",
  wind: "rgba(0,180,216,0.4)",
};

const zones = [
  { label: "Safe Corridor", color: "bg-success", count: 6 },
  { label: "Rerouted", color: "bg-amber", count: 1 },
  { label: "Restricted", color: "bg-danger", count: 1 },
  { label: "Weather", color: "bg-blue-500", count: 4 },
];

type LayerToggle = "flights" | "weather" | "airspace";

const layerConfig: Record<LayerToggle, { Icon: React.ComponentType<any>; label: string }> = {
  flights: { Icon: AirplaneTiltIcon, label: "Flights" },
  weather: { Icon: CloudRainIcon, label: "Weather" },
  airspace: { Icon: WarningIcon, label: "Airspace" },
};

export default function StabilityMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [activeLayers, setActiveLayers] = useState<Set<LayerToggle>>(
    new Set(["flights", "weather", "airspace"])
  );
  const layerGroups = useRef<Record<string, any>>({});

  const toggleLayer = (layer: LayerToggle) => {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    let cancelled = false;

    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      if (cancelled || !mapRef.current) return;

      const map = L.map(mapRef.current, {
        center: [24.8, 54.5],
        zoom: 7,
        zoomControl: false,
        attributionControl: false,
        maxBounds: [[10, 40], [40, 70]],
        minZoom: 5,
        maxZoom: 12,
      });

      // Dark tile layer
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
      }).addTo(map);

      // Faint labels on top
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png", {
        subdomains: "abcd",
        opacity: 0.4,
      }).addTo(map);

      leafletMap.current = map;

      // === AIRPORTS (always visible) ===
      airports.forEach((ap) => {
        // Pulsing ring
        const pulseRing = L.circleMarker([ap.lat, ap.lng], {
          radius: 18, color: delayColors[ap.delays], fillColor: delayColors[ap.delays],
          fillOpacity: 0.08, weight: 1, opacity: 0.3, className: "pulse-live",
        }).addTo(map);

        // Core dot
        const marker = L.circleMarker([ap.lat, ap.lng], {
          radius: 6, color: delayColors[ap.delays], fillColor: delayColors[ap.delays],
          fillOpacity: 0.9, weight: 2, opacity: 1,
        }).addTo(map);

        // Label
        const label = L.divIcon({
          className: "airport-label",
          html: `<div style="
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            font-weight: 700;
            color: ${delayColors[ap.delays]};
            text-shadow: 0 0 8px rgba(0,0,0,0.8);
            white-space: nowrap;
            pointer-events: none;
          ">${ap.code}</div>`,
          iconSize: [40, 16],
          iconAnchor: [20, -10],
        });
        L.marker([ap.lat, ap.lng], { icon: label, interactive: false }).addTo(map);

        // Popup
        marker.bindPopup(`
          <div style="font-family:Inter,sans-serif;font-size:12px;line-height:1.5;min-width:160px;">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;">${ap.code} - ${ap.name}</div>
            <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
              <span style="color:#7C7C8A;">Flights (24h)</span>
              <span style="font-weight:600;">${ap.flights24h}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
              <span style="color:#7C7C8A;">On-time Rate</span>
              <span style="font-weight:600;color:${delayColors[ap.delays]};">${ap.onTimeRate}%</span>
            </div>
            <div style="display:flex;justify-content:space-between;">
              <span style="color:#7C7C8A;">Delay Index</span>
              <span style="font-weight:600;color:${delayColors[ap.delays]};text-transform:uppercase;">${ap.delays}</span>
            </div>
          </div>
        `, {
          className: "custom-popup",
          closeButton: false,
        });
      });

      // === FLIGHT PATHS ===
      const flightsGroup = L.layerGroup();
      flightPaths.forEach((fp) => {
        const mid: [number, number] = [(fp.from[0] + fp.to[0]) / 2, (fp.from[1] + fp.to[1]) / 2];
        const offset = Math.abs(fp.from[1] - fp.to[1]) * 0.15;
        const curved: [number, number][] = [fp.from, [mid[0] + offset, mid[1]], fp.to];

        const line = L.polyline(curved, {
          color: pathColors[fp.status],
          weight: fp.status === "restricted" ? 1 : 1.5,
          dashArray: pathDash[fp.status],
          opacity: fp.status === "restricted" ? 0.5 : 0.7,
          smoothFactor: 3,
        });

        const dest = L.circleMarker(fp.to, {
          radius: 3,
          color: pathColors[fp.status],
          fillColor: pathColors[fp.status],
          fillOpacity: 0.8,
          weight: 0,
        });

        flightsGroup.addLayer(line);
        flightsGroup.addLayer(dest);
      });
      flightsGroup.addTo(map);
      layerGroups.current.flights = flightsGroup;

      // === WEATHER ZONES ===
      const weatherGroup = L.layerGroup();
      weatherZones.forEach((wz) => {
        const circle = L.circle(wz.center, {
          radius: wz.radius,
          color: weatherBorders[wz.type],
          fillColor: weatherColors[wz.type][wz.severity],
          fillOpacity: 1,
          weight: 1,
          opacity: 0.6,
        });

        const typeLabel = wz.type.charAt(0).toUpperCase() + wz.type.slice(1);
        circle.bindTooltip(`${typeLabel} - ${wz.severity.toUpperCase()}`, {
          className: "custom-tooltip",
          permanent: false,
        });

        weatherGroup.addLayer(circle);
      });
      weatherGroup.addTo(map);
      layerGroups.current.weather = weatherGroup;

      // === AIRSPACE ZONES ===
      const airspaceGroup = L.layerGroup();
      airspaceZones.forEach((az) => {
        const polygon = L.polygon(az.coords, {
          color: az.type === "restricted" ? "rgba(255,71,87,0.5)" : "rgba(255,176,32,0.4)",
          fillColor: az.type === "restricted" ? "rgba(255,71,87,0.08)" : "rgba(255,176,32,0.06)",
          fillOpacity: 1,
          weight: 1.5,
          dashArray: "6, 4",
        });
        polygon.bindTooltip(az.label, { className: "custom-tooltip" });
        airspaceGroup.addLayer(polygon);
      });
      airspaceGroup.addTo(map);
      layerGroups.current.airspace = airspaceGroup;

      // Custom popup/tooltip styles
      const style = document.createElement("style");
      style.textContent = `
        .custom-popup .leaflet-popup-content-wrapper {
          background: #0C0C10;
          border: 1px solid #1E1E28;
          border-radius: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          color: #F0F0F5;
        }
        .custom-popup .leaflet-popup-tip { background: #0C0C10; border: 1px solid #1E1E28; }
        .custom-tooltip {
          background: #0C0C10 !important;
          border: 1px solid #1E1E28 !important;
          border-radius: 6px !important;
          color: #F0F0F5 !important;
          font-family: 'JetBrains Mono', monospace !important;
          font-size: 10px !important;
          box-shadow: 0 2px 10px rgba(0,0,0,0.4) !important;
          padding: 4px 8px !important;
        }
        .custom-tooltip::before { border-top-color: #0C0C10 !important; }
        .leaflet-container { background: #050507 !important; }
        .airport-label { background: none !important; border: none !important; }
      `;
      document.head.appendChild(style);

      setReady(true);
    })();

    return () => {
      cancelled = true;
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Toggle layers
  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current;

    Object.entries(layerGroups.current).forEach(([key, group]) => {
      if (activeLayers.has(key as LayerToggle)) {
        if (!map.hasLayer(group)) map.addLayer(group);
      } else {
        if (map.hasLayer(group)) map.removeLayer(group);
      }
    });
  }, [activeLayers]);

  const handleZoom = (dir: "in" | "out") => {
    if (!leafletMap.current) return;
    if (dir === "in") leafletMap.current.zoomIn();
    else leafletMap.current.zoomOut();
  };

  const handleCenter = () => {
    leafletMap.current?.flyTo([24.8, 54.5], 7, { duration: 0.8 });
  };

  return (
    <Card className={cn(
      "flex flex-col overflow-hidden border-border/50 relative transition-all duration-300",
      fullscreen ? "fixed inset-0 z-[100] rounded-none border-0" : "h-full"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-1.5 shrink-0 z-20 relative bg-card/90 backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <TargetIcon className="w-3.5 h-3.5 text-teal" weight="duotone" />
          <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Airspace Stability</span>
          {ready && (
            <span className="relative flex h-1.5 w-1.5 ml-1"><span className="animate-ping absolute h-full w-full rounded-full bg-teal opacity-60" /><span className="relative rounded-full h-1.5 w-1.5 bg-teal" /></span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            {zones.map((z) => (
              <div key={z.label} className="flex items-center gap-1">
                <span className={cn("w-1.5 h-1.5 rounded-full", z.color)} />
                <span className="text-[7px] font-mono text-muted-foreground">{z.label} ({z.count})</span>
              </div>
            ))}
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6 ml-1"
            onClick={() => { setFullscreen(!fullscreen); setTimeout(() => leafletMap.current?.invalidateSize(), 100); }}>
            {fullscreen ? <ArrowsInIcon className="w-3.5 h-3.5" weight="bold" /> : <ArrowsOutIcon className="w-3.5 h-3.5" weight="bold" />}
          </Button>
        </div>
      </div>

      {/* Map container */}
      <div className="flex-1 min-h-0 relative">
        <div ref={mapRef} className="absolute inset-0" />

        {/* Layer toggles */}
        <div className="absolute top-2 left-2 z-[1000] flex flex-col gap-1">
          {(["flights", "weather", "airspace"] as const).map((layer) => {
            const { Icon, label } = layerConfig[layer];
            const active = activeLayers.has(layer);
            return (
              <Button key={layer} variant={active ? "secondary" : "ghost"} size="sm"
                className={cn(
                  "h-6 text-[9px] gap-1.5 justify-start transition-all duration-200",
                  active ? "bg-secondary/90 text-foreground" : "bg-background/60 backdrop-blur-sm text-muted-foreground/50"
                )}
                onClick={() => toggleLayer(layer)}>
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 transition-colors", active ? "bg-teal" : "bg-muted-foreground/30")} />
                <Icon className={cn("w-3 h-3 transition-opacity", active ? "opacity-100" : "opacity-40")} weight="bold" />
                {label}
              </Button>
            );
          })}
        </div>

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-2 z-[1000] flex flex-col gap-1">
          <Button variant="secondary" size="icon" className="h-7 w-7 bg-card/90 backdrop-blur-sm" onClick={() => handleZoom("in")}>
            <MagnifyingGlassPlusIcon className="w-3.5 h-3.5" weight="bold" />
          </Button>
          <Button variant="secondary" size="icon" className="h-7 w-7 bg-card/90 backdrop-blur-sm" onClick={() => handleZoom("out")}>
            <MagnifyingGlassMinusIcon className="w-3.5 h-3.5" weight="bold" />
          </Button>
          <Button variant="secondary" size="icon" className="h-7 w-7 bg-card/90 backdrop-blur-sm" onClick={handleCenter}>
            <CrosshairIcon className="w-3.5 h-3.5" weight="bold" />
          </Button>
        </div>

        {/* Loading state */}
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-background z-[999]">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-teal/30 border-t-teal rounded-full animate-spin" />
              <span className="text-[10px] text-muted-foreground font-mono">Loading map...</span>
            </div>
          </div>
        )}

        {/* Fullscreen drill-down panel */}
        {fullscreen && (
          <div className="absolute top-2 right-14 z-[1000] w-64 bg-card/95 backdrop-blur-md border border-border rounded-lg p-3 shadow-xl">
            <p className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Quick Intel</p>
            <div className="space-y-2">
              {airports.slice(0, 2).map((ap) => (
                <div key={ap.code} className="bg-secondary/50 rounded-md p-2 border border-border/30 cursor-pointer hover:border-teal/30 transition-colors"
                  onClick={() => leafletMap.current?.flyTo([ap.lat, ap.lng], 10, { duration: 0.8 })}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold font-mono">{ap.code}</span>
                    <Badge variant="outline" className={cn("text-[7px] border-0", ap.delays === "low" ? "text-success bg-success-dim" : "text-amber bg-amber-dim")}>
                      {ap.delays.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-[8px] font-mono">
                    <span className="text-muted-foreground">On-time</span>
                    <span className="text-success font-bold">{ap.onTimeRate}%</span>
                  </div>
                  <div className="flex justify-between text-[8px] font-mono">
                    <span className="text-muted-foreground">Flights 24h</span>
                    <span>{ap.flights24h}</span>
                  </div>
                </div>
              ))}
              <div className="bg-amber-dim/50 rounded-md p-2 border border-amber/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <CloudRainIcon className="w-3 h-3 text-amber animate-pulse" weight="duotone" />
                  <span className="text-[9px] font-bold text-amber">Active Weather</span>
                </div>
                <p className="text-[8px] text-foreground/70">Heavy rainfall over Dubai & Abu Dhabi. 4 weather zones active.</p>
              </div>
              <div className="bg-danger-dim/50 rounded-md p-2 border border-danger/20">
                <div className="flex items-center gap-1.5 mb-1">
                  <WarningIcon className="w-3 h-3 text-danger" weight="duotone" />
                  <span className="text-[9px] font-bold text-danger">Airspace Zone</span>
                </div>
                <p className="text-[8px] text-foreground/70">Exercise area east of UAE - caution advisory active.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
