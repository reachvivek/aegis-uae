import type { Airport, FlightPath, AirportStat } from "./types";

export const airports: Airport[] = [
  { code: "DXB", name: "Dubai International", lat: 25.2532, lng: 55.3657, delays: "low", flights24h: 1247, onTimeRate: 87 },
  { code: "AUH", name: "Abu Dhabi International", lat: 24.4330, lng: 54.6511, delays: "low", flights24h: 634, onTimeRate: 90 },
  { code: "SHJ", name: "Sharjah International", lat: 25.3286, lng: 55.5172, delays: "low", flights24h: 89, onTimeRate: 92 },
  { code: "DWC", name: "Al Maktoum International", lat: 24.8960, lng: 55.1614, delays: "low", flights24h: 45, onTimeRate: 95 },
];

export const flightPaths: FlightPath[] = [
  { from: [25.2532, 55.3657], to: [51.4700, -0.4543], fromCode: "DXB", toCode: "LHR", status: "safe" },
  { from: [25.2532, 55.3657], to: [28.5562, 77.1000], fromCode: "DXB", toCode: "DEL", status: "safe" },
  { from: [25.2532, 55.3657], to: [1.3644, 103.9915], fromCode: "DXB", toCode: "SIN", status: "safe" },
  { from: [25.2532, 55.3657], to: [41.2753, 28.7519], fromCode: "DXB", toCode: "IST", status: "rerouted" },
  { from: [25.2532, 55.3657], to: [33.8209, 35.4884], fromCode: "DXB", toCode: "BEY", status: "restricted" },
  { from: [24.4330, 54.6511], to: [37.4602, 126.4407], fromCode: "AUH", toCode: "ICN", status: "safe" },
  { from: [25.2532, 55.3657], to: [49.0097, 2.5479], fromCode: "DXB", toCode: "CDG", status: "safe" },
  { from: [25.2532, 55.3657], to: [13.6900, 100.7501], fromCode: "DXB", toCode: "BKK", status: "safe" },
];

export const airportStats: AirportStat[] = [
  { code: "DXB", total: 1247, onTime: 1089, delayed: 142, cancelled: 16, index: "low", trend: "up", delayDelta: -8, cancelDelta: -3 },
  { code: "AUH", total: 634, onTime: 571, delayed: 56, cancelled: 7, index: "low", trend: "stable", delayDelta: +2, cancelDelta: 0 },
];
