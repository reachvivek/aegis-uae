import type { TimeRange, ThreatData, ThreatEvent, ThreatRegion } from "./types";

export const threatData: Record<TimeRange, ThreatData> = {
  all: {
    missilesFired: 84, missilesInt: 79, dronesFired: 312, dronesInt: 298, debris: 19,
    casualties: 23, deaths: 4, injured: 19,
    missileSpark: [5, 8, 12, 6, 10, 14, 8, 3, 6, 9, 2, 1],
    droneSpark: [18, 24, 35, 28, 42, 30, 26, 38, 22, 28, 16, 5],
    label: "Since Jan 15",
  },
  "24h": {
    missilesFired: 3, missilesInt: 3, dronesFired: 16, dronesInt: 15, debris: 1,
    casualties: 0, deaths: 0, injured: 0,
    missileSpark: [0, 0, 0, 1, 0, 0, 2, 0, 0, 0, 0, 0],
    droneSpark: [0, 0, 3, 0, 5, 0, 0, 8, 0, 0, 0, 0],
    label: "Last 24h",
  },
  "48h": {
    missilesFired: 7, missilesInt: 7, dronesFired: 29, dronesInt: 27, debris: 3,
    casualties: 2, deaths: 0, injured: 2,
    missileSpark: [0, 1, 0, 2, 0, 0, 1, 0, 0, 2, 0, 1],
    droneSpark: [2, 3, 5, 0, 4, 6, 0, 3, 0, 4, 2, 0],
    label: "Last 48h",
  },
  "7d": {
    missilesFired: 12, missilesInt: 11, dronesFired: 47, dronesInt: 44, debris: 4,
    casualties: 6, deaths: 1, injured: 5,
    missileSpark: [0, 2, 1, 0, 3, 1, 2, 0, 1, 0, 2, 0],
    droneSpark: [3, 5, 2, 8, 4, 6, 3, 7, 2, 4, 3, 0],
    label: "Last 7 days",
  },
};

export const threatEvents: ThreatEvent[] = [
  {
    id: "t1", timestamp: "2026-03-25T11:42:00Z", type: "drone", origin: "Unknown - Northern Vector",
    target: "Abu Dhabi Airspace", region: "abu_dhabi", regionLabel: "Abu Dhabi", fired: 5, intercepted: 5,
    status: "intercepted", description: "5 UAVs detected on northern approach. All neutralized by THAAD battery at 38,000ft. No debris in populated areas.",
  },
  {
    id: "t2", timestamp: "2026-03-25T10:15:00Z", type: "missile", origin: "Southern Iran (est.)",
    target: "Al Dhafra Airbase Vicinity", region: "abu_dhabi", regionLabel: "Abu Dhabi", fired: 2, intercepted: 2,
    status: "intercepted", description: "2 ballistic missiles intercepted at high altitude. Patriot PAC-3 engaged. No ground impact.",
  },
  {
    id: "t3", timestamp: "2026-03-25T08:30:00Z", type: "drone", origin: "Houthi-controlled Yemen",
    target: "Dubai Industrial Zone", region: "dubai", regionLabel: "Dubai", fired: 8, intercepted: 7,
    status: "partial", description: "8 Samad-3 UAVs. 7 intercepted, 1 crashed in uninhabited desert area SE of DIC. No casualties.",
  },
  {
    id: "t4", timestamp: "2026-03-25T06:00:00Z", type: "missile", origin: "Iraq-based militia (est.)",
    target: "Qatar Al Udeid Perimeter", region: "qatar", regionLabel: "Qatar", fired: 1, intercepted: 1,
    status: "intercepted", description: "Single cruise missile engaged by Qatari air defense. Intercept confirmed at 15km range.",
  },
  {
    id: "t5", timestamp: "2026-03-25T03:20:00Z", type: "drone", origin: "Unknown - Maritime",
    target: "Sharjah Port Area", region: "sharjah", regionLabel: "Sharjah", fired: 3, intercepted: 3,
    status: "intercepted", description: "3 maritime-launched UAVs detected. Electronic warfare systems jammed 1, kinetic intercept on 2.",
  },
  {
    id: "t6", timestamp: "2026-03-24T22:45:00Z", type: "debris", origin: "Intercept Fallout",
    target: "Al Ain Rural", region: "al_ain", regionLabel: "Al Ain", fired: 0, intercepted: 0,
    status: "impact", description: "Debris from earlier intercept fell in agricultural area. No injuries. Area cordoned by civil defense.",
  },
];

export const regions: ThreatRegion[] = [
  { value: "all", label: "All Regions" },
  { value: "dubai", label: "Dubai" },
  { value: "abu_dhabi", label: "Abu Dhabi" },
  { value: "sharjah", label: "Sharjah" },
  { value: "al_ain", label: "Al Ain" },
  { value: "qatar", label: "Qatar" },
  { value: "oman", label: "Oman" },
];
