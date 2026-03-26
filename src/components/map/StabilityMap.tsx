"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TargetIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon,
  CrosshairIcon, ArrowsOutIcon, ArrowsInIcon,
  AirplaneTiltIcon, CloudRainIcon, WarningIcon, WaveSineIcon,
} from "@phosphor-icons/react";
import { useEarthquakes } from "@/hooks/useEarthquakes";
import { useAlerts } from "@/hooks/useAlerts";

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
  { label: "Seismic", color: "bg-violet-400", count: 0 },
];

type LayerToggle = "flights" | "weather" | "airspace" | "seismic";

const layerConfig: Record<LayerToggle, { Icon: React.ComponentType<any>; label: string; color: string; desc: string }> = {
  flights: { Icon: AirplaneTiltIcon, label: "Flights", color: "bg-teal", desc: "Active flight paths and airport status" },
  weather: { Icon: CloudRainIcon, label: "Weather", color: "bg-blue-400", desc: "Rain, thunder, and wind zones" },
  airspace: { Icon: WarningIcon, label: "Airspace", color: "bg-rose-500", desc: "Restricted and caution airspace zones" },
  seismic: { Icon: WaveSineIcon, label: "Seismic", color: "bg-violet-400", desc: "Earthquake and seismic activity" },
};

export default function StabilityMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedAirport, setSelectedAirport] = useState<Airport | null>(null);
  const [activeLayers, setActiveLayers] = useState<Set<LayerToggle>>(
    new Set(["flights", "weather", "airspace", "seismic"])
  );
  const { quakes } = useEarthquakes();
  const { alerts } = useAlerts();
  const layerGroups = useRef<Record<string, any>>({});
  const crisisLayerRef = useRef<any>(null);
  const crisisAnimRef = useRef<any>(null);
  const airportMarkersRef = useRef<any[]>([]);
  const airportRingsRef = useRef<any[]>([]);
  const airportLabelsRef = useRef<any[]>([]);
  const hasCritical = alerts.some((a: any) => a.severity === "critical");

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
      airportMarkersRef.current = [];
      airportRingsRef.current = [];
      airportLabelsRef.current = [];
      airports.forEach((ap) => {
        // Pulsing ring
        const pulseRing = L.circleMarker([ap.lat, ap.lng], {
          radius: 18, color: delayColors[ap.delays], fillColor: delayColors[ap.delays],
          fillOpacity: 0.08, weight: 1, opacity: 0.3, className: "pulse-live",
        }).addTo(map);
        airportRingsRef.current.push({ marker: pulseRing, airport: ap });

        // Core dot
        const marker = L.circleMarker([ap.lat, ap.lng], {
          radius: 6, color: delayColors[ap.delays], fillColor: delayColors[ap.delays],
          fillOpacity: 0.9, weight: 2, opacity: 1,
        }).addTo(map);
        airportMarkersRef.current.push({ marker, airport: ap });

        // Label
        const label = L.divIcon({
          className: "airport-label",
          html: `<div class="ap-label-text" data-code="${ap.code}" style="
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
        const labelMarker = L.marker([ap.lat, ap.lng], { icon: label, interactive: false }).addTo(map);
        airportLabelsRef.current.push({ marker: labelMarker, airport: ap });

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

      // === SEISMIC / EARTHQUAKE MARKERS ===
      const seismicGroup = L.layerGroup();
      layerGroups.current.seismic = seismicGroup;
      seismicGroup.addTo(map);

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

  // Update seismic markers when earthquake data changes
  useEffect(() => {
    const group = layerGroups.current.seismic;
    if (!group || !leafletMap.current) return;

    (async () => {
      const L = (await import("leaflet")).default;
      group.clearLayers();

      quakes.forEach((q: any) => {
        if (!q.lat || !q.lng) return;
        const mag = q.magnitude || 0;
        const radius = Math.max(4, mag * 3);
        const color = mag >= 5 ? "#FF4757" : mag >= 4 ? "#FFB020" : "#FFD93D";
        const fillOpacity = mag >= 5 ? 0.5 : mag >= 4 ? 0.35 : 0.25;

        // Outer pulse ring
        L.circleMarker([q.lat, q.lng], {
          radius: radius + 8,
          color,
          fillColor: color,
          fillOpacity: 0.08,
          weight: 1,
          opacity: 0.3,
          className: mag >= 4 ? "pulse-live" : "",
        }).addTo(group);

        // Core marker
        const marker = L.circleMarker([q.lat, q.lng], {
          radius,
          color,
          fillColor: color,
          fillOpacity,
          weight: 1.5,
          opacity: 0.8,
        }).addTo(group);

        const timeStr = q.time ? new Date(q.time).toLocaleString("en-US", { timeZone: "Asia/Dubai", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "";

        marker.bindPopup(`
          <div style="font-family:Inter,sans-serif;font-size:12px;line-height:1.5;min-width:180px;">
            <div style="font-weight:700;font-size:14px;margin-bottom:4px;color:${color};">M${mag.toFixed(1)} Earthquake</div>
            <div style="color:#7C7C8A;margin-bottom:6px;">${q.place || "Unknown location"}</div>
            <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
              <span style="color:#7C7C8A;">Depth</span>
              <span style="font-weight:600;">${q.depth?.toFixed(1) || "?"}km</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:2px;">
              <span style="color:#7C7C8A;">Time</span>
              <span style="font-weight:600;">${timeStr}</span>
            </div>
            ${q.tsunami ? '<div style="color:#FF4757;font-weight:700;margin-top:4px;">TSUNAMI WARNING</div>' : ""}
            ${q.url ? `<a href="${q.url}" target="_blank" rel="noopener noreferrer" style="color:#00E5B8;font-size:11px;text-decoration:underline;display:block;margin-top:6px;">View on USGS</a>` : ""}
          </div>
        `, { className: "custom-popup", closeButton: false });

        marker.bindTooltip(`M${mag.toFixed(1)} - ${q.place || ""}`, {
          className: "custom-tooltip",
          permanent: false,
        });
      });
    })();
  }, [quakes]);

  // Crisis mode: flash airport markers red
  useEffect(() => {
    if (!ready) return;
    const color = hasCritical ? "#FF4757" : undefined;

    airportMarkersRef.current.forEach(({ marker, airport }: { marker: any; airport: Airport }) => {
      const c = color || delayColors[airport.delays];
      marker.setStyle({ color: c, fillColor: c });
    });
    airportRingsRef.current.forEach(({ marker, airport }: { marker: any; airport: Airport }) => {
      const c = color || delayColors[airport.delays];
      marker.setStyle({ color: c, fillColor: c });
    });
    // Update label colors via DOM
    document.querySelectorAll(".ap-label-text").forEach((el) => {
      const code = el.getAttribute("data-code");
      const ap = airports.find((a) => a.code === code);
      if (el instanceof HTMLElement) {
        el.style.color = color || (ap ? delayColors[ap.delays] : "#2ED573");
      }
    });
  }, [hasCritical, ready]);

  // Crisis mode: animated missile interception visualization
  const crisisTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => {
    if (!leafletMap.current || !ready) return;

    // Cleanup function
    const cleanup = () => {
      crisisTimers.current.forEach((t) => { clearTimeout(t); clearInterval(t as unknown as ReturnType<typeof setInterval>); });
      crisisTimers.current = [];
      if (leafletMap.current) {
        if (crisisLayerRef.current) { leafletMap.current.removeLayer(crisisLayerRef.current); crisisLayerRef.current = null; }
        if (crisisAnimRef.current) { leafletMap.current.removeLayer(crisisAnimRef.current); crisisAnimRef.current = null; }
      }
    };

    cleanup();
    if (!hasCritical) {
      // Restore normal view
      if (leafletMap.current) {
        leafletMap.current.flyTo([24.8, 54.5], 7, { duration: 1.2 });
      }
      return cleanup;
    }

    (async () => {
      const L = (await import("leaflet")).default;
      const map = leafletMap.current;
      if (!map) return;

      // Zoom out to show full missile trajectory (Iran → UAE)
      map.flyTo([27.0, 52.5], 6, { duration: 1.5 });

      const crisisGroup = L.layerGroup();
      const uaeCenter: [number, number] = [24.8, 54.8];

      // Helper: interpolate between two points
      const lerp = (a: [number, number], b: [number, number], t: number): [number, number] => [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
      ];

      // Helper: animate a marker along a path
      const animateMarker = (
        marker: any, from: [number, number], to: [number, number],
        durationMs: number, onComplete?: () => void,
      ) => {
        const steps = 60;
        const stepMs = durationMs / steps;
        for (let i = 0; i <= steps; i++) {
          const timer = setTimeout(() => {
            const t = i / steps;
            const pos = lerp(from, to, t);
            marker.setLatLng(pos);
            if (i === steps && onComplete) onComplete();
          }, i * stepMs);
          crisisTimers.current.push(timer);
        }
      };

      // Helper: grow a trail behind a moving object
      const animateTrail = (
        from: [number, number], to: [number, number],
        durationMs: number, color: string, weight: number,
        targetGroup?: any,
      ) => {
        const trail = L.polyline([from], {
          color, weight, opacity: 0.7, dashArray: "8, 4",
        }).addTo(targetGroup || crisisGroup);
        const steps = 40;
        const stepMs = durationMs / steps;
        for (let i = 0; i <= steps; i++) {
          const timer = setTimeout(() => {
            const t = i / steps;
            const pos = lerp(from, to, t);
            trail.addLatLng(pos);
          }, i * stepMs);
          crisisTimers.current.push(timer);
        }
      };

      // ── Shield dome (appears immediately) ──
      [120000, 95000, 70000].forEach((radius, i) => {
        L.circle(uaeCenter, {
          radius,
          color: "rgba(255,176,32,0.35)",
          fillColor: `rgba(255,176,32,${0.1 - i * 0.025})`,
          fillOpacity: 1, weight: 1, dashArray: "6, 8",
          className: i === 0 ? "pulse-live" : "",
        }).addTo(crisisGroup);
      });

      // Shield ribs
      for (let angle = 180; angle <= 360; angle += 15) {
        const rad = (angle * Math.PI) / 180;
        L.polyline([uaeCenter, [uaeCenter[0] + 1.1 * Math.sin(rad), uaeCenter[1] + 1.1 * Math.cos(rad)]], {
          color: "rgba(255,176,32,0.12)", weight: 1, dashArray: "3, 6",
        }).addTo(crisisGroup);
      }

      const shieldLabel = L.divIcon({
        className: "airport-label",
        html: `<div style="font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;color:#FFB020;text-shadow:0 0 10px rgba(0,0,0,0.9);white-space:nowrap;background:rgba(255,176,32,0.1);padding:3px 8px;border-radius:4px;border:1px solid rgba(255,176,32,0.25);letter-spacing:0.1em;">AIR DEFENSE SHIELD ACTIVE</div>`,
        iconSize: [180, 20], iconAnchor: [90, 50],
      });
      L.marker(uaeCenter, { icon: shieldLabel, interactive: false }).addTo(crisisGroup);

      // Hostile zone label
      const originLabel = L.divIcon({
        className: "airport-label",
        html: `<div style="font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;color:#FF4757;text-shadow:0 0 10px rgba(0,0,0,0.9);white-space:nowrap;background:rgba(255,71,87,0.15);padding:3px 8px;border-radius:4px;border:1px solid rgba(255,71,87,0.3);letter-spacing:0.05em;">HOSTILE LAUNCH ZONE</div>`,
        iconSize: [140, 20], iconAnchor: [70, -20],
      });
      L.marker([30.5, 49.5], { icon: originLabel, interactive: false }).addTo(crisisGroup);

      // Origin pulsing markers (static, always visible)
      const missileData = [
        { origin: [31.5, 49.0] as [number, number], intercept: [27.8, 51.5] as [number, number], label: "TBM-1", delay: 0 },
        { origin: [30.5, 50.5] as [number, number], intercept: [27.0, 53.0] as [number, number], label: "TBM-2", delay: 2500 },
        { origin: [29.5, 51.0] as [number, number], intercept: [26.5, 53.5] as [number, number], label: "CM-1", delay: 5000 },
      ];
      missileData.forEach((m) => {
        L.circleMarker(m.origin, {
          radius: 8, color: "#FF4757", fillColor: "#FF4757",
          fillOpacity: 0.5, weight: 2, opacity: 0.8, className: "pulse-live",
        }).addTo(crisisGroup);
        L.circleMarker(m.origin, {
          radius: 18, color: "#FF4757", fillColor: "#FF4757",
          fillOpacity: 0.06, weight: 1, opacity: 0.3, className: "pulse-live",
        }).addTo(crisisGroup);
      });

      crisisGroup.addTo(map);
      crisisLayerRef.current = crisisGroup;

      // ── Looping animated missile sequence ──
      const animGroup = L.layerGroup().addTo(map);
      crisisAnimRef.current = animGroup;
      const LOOP_INTERVAL = 20000; // replay every 20s

      const runMissileSequence = () => {
        // Clear previous animated elements
        animGroup.clearLayers();

        missileData.forEach((m, idx) => {
          const missileFlightTime = 8000;
          const interceptorDelay = 3500;
          const interceptorFlightTime = 5000;

          const launchTimer = setTimeout(() => {
            if (!leafletMap.current) return;

            // Missile marker
            const missileIcon = L.divIcon({
              className: "airport-label",
              html: `<div style="font-size:16px;filter:drop-shadow(0 0 8px rgba(255,71,87,0.9));transform:rotate(135deg);">🚀</div>`,
              iconSize: [20, 20], iconAnchor: [10, 10],
            });
            const missileMarker = L.marker(m.origin, { icon: missileIcon, interactive: false, zIndexOffset: 1000 }).addTo(animGroup);

            // Missile trail
            animateTrail(m.origin, m.intercept, missileFlightTime, "#FF4757", 2.5, animGroup);

            // Animate missile
            animateMarker(missileMarker, m.origin, m.intercept, missileFlightTime, () => {
              animGroup.removeLayer(missileMarker);

              // Explosion burst
              [25, 16, 8].forEach((r, ri) => {
                L.circleMarker(m.intercept, {
                  radius: r, color: ri === 2 ? "#fff" : "#FFB020",
                  fillColor: "#FFB020", fillOpacity: ri === 0 ? 0.1 : ri === 1 ? 0.3 : 0.9,
                  weight: ri === 2 ? 2 : 1.5, opacity: ri === 0 ? 0.4 : 0.8,
                  className: ri === 0 ? "pulse-live" : "",
                }).addTo(animGroup);
              });

              // Intercepted label
              const label = L.divIcon({
                className: "airport-label",
                html: `<div style="font-family:'JetBrains Mono',monospace;font-size:8px;font-weight:700;color:#2ED573;text-shadow:0 0 8px rgba(0,0,0,0.9);white-space:nowrap;background:rgba(46,213,115,0.12);padding:2px 6px;border-radius:3px;border:1px solid rgba(46,213,115,0.3);">✓ ${m.label} INTERCEPTED</div>`,
                iconSize: [140, 16], iconAnchor: [70, -18],
              });
              L.marker(m.intercept, { icon: label, interactive: false }).addTo(animGroup);
            });

            // Interceptor launches after delay
            const interceptorTimer = setTimeout(() => {
              if (!leafletMap.current) return;

              const base: [number, number] = [
                uaeCenter[0] + (idx - 1) * 0.3,
                uaeCenter[1] - 0.3,
              ];
              const interceptorIcon = L.divIcon({
                className: "airport-label",
                html: `<div style="font-size:14px;filter:drop-shadow(0 0 6px rgba(255,176,32,0.8));transform:rotate(-45deg);">🛡️</div>`,
                iconSize: [18, 18], iconAnchor: [9, 9],
              });
              const interceptorMarker = L.marker(base, { icon: interceptorIcon, interactive: false, zIndexOffset: 1000 }).addTo(animGroup);
              animateTrail(base, m.intercept, interceptorFlightTime, "#FFB020", 1.5, animGroup);
              animateMarker(interceptorMarker, base, m.intercept, interceptorFlightTime, () => {
                animGroup.removeLayer(interceptorMarker);
              });
            }, interceptorDelay);
            crisisTimers.current.push(interceptorTimer);
          }, m.delay);
          crisisTimers.current.push(launchTimer);
        });
      };

      // Run first sequence after map zoom completes
      const firstRun = setTimeout(runMissileSequence, 2000);
      crisisTimers.current.push(firstRun);

      // Loop the sequence
      const loopInterval = setInterval(() => {
        // Clear old animation timers before restarting
        crisisTimers.current.forEach(clearTimeout);
        crisisTimers.current = [];
        runMissileSequence();
      }, LOOP_INTERVAL);

      // Store interval for cleanup
      crisisTimers.current.push(loopInterval as unknown as ReturnType<typeof setTimeout>);
    })();

    return cleanup;
  }, [hasCritical, ready]);

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
        <div className="absolute top-2 left-2 z-[1000] flex flex-col gap-1 group/layers">
          {(["flights", "weather", "airspace", "seismic"] as const).map((layer) => {
            const { Icon, label, color, desc } = layerConfig[layer];
            const active = activeLayers.has(layer);
            return (
              <div key={layer} className="relative group/item">
                <Button variant={active ? "secondary" : "ghost"} size="sm"
                  className={cn(
                    "h-6 text-[9px] gap-1.5 justify-start transition-all duration-200",
                    active ? "bg-secondary/90 text-foreground" : "bg-background/60 backdrop-blur-sm text-muted-foreground/50"
                  )}
                  onClick={() => toggleLayer(layer)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 transition-colors", active ? color : "bg-muted-foreground/30")} />
                  <Icon className={cn("w-3 h-3 transition-opacity", active ? "opacity-100" : "opacity-40")} weight="bold" />
                  {label}
                </Button>
                <div className="absolute left-full top-0 ml-1.5 hidden group-hover/item:block pointer-events-none z-50">
                  <div className="bg-card/95 backdrop-blur-md border border-border rounded-md px-2.5 py-1.5 shadow-lg whitespace-nowrap">
                    <p className="text-[9px] font-bold text-foreground">{label}</p>
                    <p className="text-[8px] text-muted-foreground">{desc}</p>
                    <p className="text-[7px] font-mono mt-0.5">{active ? <span className="text-success">Visible</span> : <span className="text-muted-foreground/50">Hidden</span>}</p>
                  </div>
                </div>
              </div>
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

        {/* Crisis mode safety overlay */}
        {hasCritical && ready && (
          <div className="absolute top-2 right-2 z-[1000] max-w-[220px] animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="bg-[#0a0406]/95 backdrop-blur-md border border-danger/30 rounded-lg p-3 shadow-[0_0_30px_rgba(255,71,87,0.15)]">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-danger opacity-75" /><span className="relative rounded-full h-2 w-2 bg-danger" /></span>
                <span className="text-[9px] font-bold text-danger tracking-widest uppercase">Interception In Progress</span>
              </div>
              <p className="text-[9px] leading-relaxed text-foreground/80 mb-2">
                Ensure you are away from <strong className="text-danger">windows, glass surfaces & open areas</strong>. Move to an interior room or shelter immediately.
              </p>
              <div className="border-t border-danger/15 pt-2 space-y-1">
                <p className="text-[8px] font-mono text-muted-foreground">Emergency: <span className="text-danger font-bold">999</span></p>
                <p className="text-[8px] font-mono text-muted-foreground">Civil Defense: <span className="text-danger font-bold">997</span></p>
                <p className="text-[8px] font-mono text-muted-foreground">Ambulance: <span className="text-danger font-bold">998</span></p>
              </div>
            </div>
          </div>
        )}

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
