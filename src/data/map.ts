import type { WeatherZone, AirspaceZone } from "./types";

export const weatherZones: WeatherZone[] = [
  { center: [25.15, 55.25], radius: 25000, type: "rain", severity: "moderate" },
  { center: [24.45, 54.60], radius: 20000, type: "rain", severity: "low" },
  { center: [25.40, 55.80], radius: 15000, type: "thunder", severity: "high" },
  { center: [24.20, 55.70], radius: 18000, type: "rain", severity: "low" },
];

export const airspaceZones: AirspaceZone[] = [
  {
    coords: [[26.5, 56.0], [26.5, 57.5], [25.0, 57.5], [25.0, 56.0]],
    type: "caution",
    label: "Exercise Area - Caution",
  },
];

// ─── Color Configs ───

export const delayColors: Record<string, string> = {
  low: "#2ED573",
  moderate: "#FFB020",
  high: "#FF4757",
} as const;

export const pathColors: Record<string, string> = {
  safe: "#2ED57380",
  rerouted: "#FFB02090",
  restricted: "#FF475780",
} as const;

export const weatherColors: Record<string, Record<string, string>> = {
  rain: { low: "rgba(59,130,246,0.12)", moderate: "rgba(59,130,246,0.22)", high: "rgba(59,130,246,0.35)" },
  thunder: { low: "rgba(255,176,32,0.12)", moderate: "rgba(255,176,32,0.22)", high: "rgba(255,176,32,0.35)" },
  wind: { low: "rgba(0,180,216,0.12)", moderate: "rgba(0,180,216,0.22)", high: "rgba(0,180,216,0.35)" },
} as const;

export const weatherBorders: Record<string, string> = {
  rain: "rgba(59,130,246,0.4)",
  thunder: "rgba(255,176,32,0.5)",
  wind: "rgba(0,180,216,0.4)",
} as const;

// ─── Legend ───

export const zones = [
  { label: "Safe Corridor", color: "bg-success", count: 6 },
  { label: "Rerouted", color: "bg-amber", count: 1 },
  { label: "Restricted", color: "bg-danger", count: 1 },
  { label: "Weather", color: "bg-blue-500", count: 4 },
] as const;
