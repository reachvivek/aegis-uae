// ─── Map / Aviation Types (StabilityMap) ───

export interface Airport {
  code: string;
  name: string;
  lat: number;
  lng: number;
  delays: "low" | "moderate" | "high";
  flights24h: number;
  onTimeRate: number;
}

export interface FlightPath {
  from: [number, number];
  to: [number, number];
  fromCode: string;
  toCode: string;
  status: "safe" | "rerouted" | "restricted";
}

export interface WeatherZone {
  center: [number, number];
  radius: number;
  type: "rain" | "thunder" | "wind";
  severity: "low" | "moderate" | "high";
}

export interface AirspaceZone {
  coords: [number, number][];
  type: "restricted" | "caution";
  label: string;
}

// ─── Truth Feed Types ───

export type TruthStatus = "confirmed" | "developing" | "cleared";

export interface TruthItem {
  text: string;
  status: TruthStatus;
  source: "govt" | "atc" | "ai";
}

export interface Article {
  id: string;
  title: string;
  source: string;
  verified: boolean;
  publishedAt: string;
  tag: string;
  tagColor: string;
  categories: Category[];
}

export type Category = "all" | "students" | "employees" | "govt";

// ─── Alert Types (AlertBanner) ───

export type AlertSeverity = "critical" | "warning" | "advisory";

export interface CriticalAlert {
  id: string;
  severity: AlertSeverity;
  category: string;
  title: string;
  description: string;
  source: string;
  regions: string[];
  issuedAt: string;
  expiresAt: string;
}

// ─── Ticker Types (NewsTicker) ───

export interface TickerItem {
  text: string;
  severity: "breaking" | "alert" | "info";
  time: string;
  detail: string;
  source: string;
}

// ─── Status Types (StatusTicker) ───

export interface StatusItem {
  label: string;
  value: string;
  status: "normal" | "elevated" | "critical";
  blink?: boolean;
  tooltip: string;
  group: "aviation" | "security" | "weather";
}

// ─── Threat Types (ThreatTimeline) ───

export type ThreatType = "missile" | "drone" | "debris";
export type Region = "all" | "dubai" | "abu_dhabi" | "sharjah" | "al_ain" | "qatar" | "oman";

export interface ThreatEvent {
  id: string;
  timestamp: string;
  type: ThreatType;
  origin: string;
  target: string;
  region: Region;
  regionLabel: string;
  fired: number;
  intercepted: number;
  status: "intercepted" | "partial" | "impact";
  description: string;
}

export interface ThreatRegion {
  value: Region;
  label: string;
}

// ─── Intel Types (LatestDevelopments) ───

export type Sentiment = "escalation" | "de-escalation" | "neutral";

export interface Development {
  id: string;
  timestamp: string;
  headline: string;
  detail: string;
  source: string;
  parties: string[];
  sentiment: Sentiment;
  impactOnUAE: string;
  prediction?: string;
}

// ─── Evacuation Types ───

export type RouteStatus = "open" | "congested" | "closed";
export type RouteType = "air" | "road" | "sea";

export interface EvacRoute {
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

// ─── StatsCarousel Types ───

export type TimeRange = "all" | "24h" | "48h" | "7d";
export type DefenseRange = "all" | "24h" | "48h" | "7d";

export interface ThreatData {
  missilesFired: number;
  missilesInt: number;
  dronesFired: number;
  dronesInt: number;
  debris: number;
  casualties: number;
  deaths: number;
  injured: number;
  missileSpark: number[];
  droneSpark: number[];
  label: string;
}

export interface DefenseSystem {
  name: string;
  type: string;
  intercepts: number;
}

export interface AirportStat {
  code: string;
  total: number;
  onTime: number;
  delayed: number;
  cancelled: number;
  index: string;
  trend: "up" | "down" | "stable";
  delayDelta: number;
  cancelDelta: number;
}

// ─── Connectivity Types (ConnectivityIndex) ───

export interface ConnectivityRoute {
  from: string;
  to: string;
  city: string;
  stability: number;
  trend: "up" | "down" | "stable";
}
