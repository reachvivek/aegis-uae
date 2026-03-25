<p align="center">
  <img src="docs/screenshots/banner.png" alt="AegisUAE" width="100%" />
</p>

<h1 align="center">AegisUAE</h1>

<p align="center">
  <strong>Real-time crisis informatics command center for UAE national resilience</strong>
</p>

<p align="center">
  Airspace monitoring &bull; Threat tracking &bull; Defense analytics &bull; Evacuation routing &bull; AI-powered advisory
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.2-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind-4.2-06B6D4?logo=tailwindcss" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet" alt="Leaflet" />
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## Overview

AegisUAE is a mission-critical crisis informatics dashboard designed for real-time situational awareness during national emergencies. Built to handle conflict scenarios, natural disasters, GPS disruptions, and mass evacuation coordination across the UAE.

The system aggregates data from government sources (GCAA, NCM, MOI, NCEMA), defense networks, aviation feeds, and verified news into a single unified command interface.

> **Note:** This is a frontend prototype with mock data. Backend API integration is planned.

## Screenshots

<!-- Add screenshots here -->
<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="Dashboard" width="100%" />
</p>

<details>
<summary><strong>More screenshots</strong></summary>

| View | Screenshot |
|------|-----------|
| Threat Analytics | `docs/screenshots/threats.png` |
| Evacuation Modal | `docs/screenshots/evacuation.png` |
| AI Advisory Chat | `docs/screenshots/advisory.png` |
| Mobile View | `docs/screenshots/mobile.png` |

</details>

## Architecture

```
aegis-uae/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Main dashboard layout
│   │   ├── layout.tsx          # Root layout + fonts
│   │   └── globals.css         # Theme system + custom utilities
│   │
│   ├── components/
│   │   ├── layout/             # Shell components
│   │   │   ├── Header.tsx          # Brand bar + system clock
│   │   │   ├── StatusTicker.tsx    # Real-time status ribbon
│   │   │   ├── AlertBanner.tsx     # Auto-rotating critical alerts
│   │   │   └── NewsTicker.tsx      # Breaking news ticker
│   │   │
│   │   ├── map/                # Geospatial
│   │   │   └── StabilityMap.tsx    # Leaflet map with flight paths,
│   │   │                           # weather zones, airspace overlays
│   │   │
│   │   ├── stats/              # Analytics carousel
│   │   │   └── StatsCarousel.tsx   # Aviation, threats, defense,
│   │   │                           # situation status cards
│   │   │
│   │   ├── feeds/              # News & verified intel
│   │   │   └── TruthFeed.tsx       # Ground truth + categorized
│   │   │                           # articles (students/work/govt)
│   │   │
│   │   ├── threat/             # Threat intelligence
│   │   │   └── ThreatTimeline.tsx  # Chronological threat events
│   │   │                           # with intercept data
│   │   │
│   │   ├── aviation/           # Air traffic
│   │   │   ├── ConnectivityIndex.tsx  # Route status matrix
│   │   │   └── FlightPulse.tsx        # Airport performance
│   │   │
│   │   ├── intel/              # Geopolitical developments
│   │   │   └── LatestDevelopments.tsx  # Sentiment analysis +
│   │   │                               # UAE impact predictions
│   │   │
│   │   ├── evacuation/         # Emergency routing
│   │   │   └── EvacuationRoutes.tsx   # Multi-modal evacuation
│   │   │                               # (road/air/sea) with modal
│   │   │
│   │   ├── advisory/           # AI assistant
│   │   │   ├── FloatingAdvisory.tsx   # FAB + hint bubble
│   │   │   └── AdvisoryModal.tsx      # Chat interface with
│   │   │                               # context-aware responses
│   │   │
│   │   └── ui/                 # Base components (shadcn/ui)
│   │       ├── standard-modal.tsx     # Reusable modal system
│   │       ├── dialog.tsx, card.tsx, badge.tsx, button.tsx,
│   │       ├── tabs.tsx, tooltip.tsx, scroll-area.tsx
│   │       └── separator.tsx
│   │
│   └── lib/
│       └── utils.ts            # Shared utilities
│
├── public/                     # Static assets
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## System Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                        STATUS TICKER                             │
│  [Aviation: OPEN LOW LOW] [Security: NORMAL ELEVATED]           │
│  [Weather: WARNING WATCH]                          12:45:32 GST │
├──────────────────────────────────────────────────────────────────┤
│  AegisUAE   Crisis Informatics System    Tue Mar 25, 2026  GST  │
├──────────────────────────────────────────────────────────────────┤
│ ▌ 3 ALERTS  WARNING  Heavy Rainfall Warning - Abu Dhabi...  ● ●│
├────────────────────────────────┬─────────────────────────────────┤
│                                │  ┌─ Stats Carousel ──────────┐ │
│                                │  │ Aviation | Threats |       │ │
│     AIRSPACE STABILITY MAP     │  │ Defense  | Status          │ │
│                                │  └────────────────────────────┘ │
│   ● DXB  ● AUH  ● SHJ  ● DWC │  ┌─ Tab Bar ─────────┐ [EVAC] │
│   ╌╌╌ Flight paths             │  │Feed|Routes|Threats|Intel│   │
│   ◯ Weather zones              │  └────────────────────────────┘ │
│   ▭ Airspace zones             │  ┌─ Active Tab Content ──────┐ │
│                                │  │                            │ │
│   [Flights] [Weather]          │  │  Ground Truth (toggle)     │ │
│   [Airspace]                   │  │  Category-filtered news    │ │
│                                │  │  articles...               │ │
│                   [+][-][⊕]    │  │                            │ │
├────────────────────────────────┴─────────────────────────────────┤
│ BREAKING ▸ 5 UAVs intercepted...  DXB operating normally...     │
└──────────────────────────────────────────────────────────────────┘
                                                          [💬 AI]
```

## Data Flow (Planned)

```
External Sources                    Backend API               Frontend
─────────────────                   ───────────               ────────
GCAA Directives  ──┐
NCM Weather      ──┤                ┌──────────┐
MOI Alerts       ──┼──── Ingest ───►│  REST /   │────► SWR / React Query
NCEMA Advisories ──┤    Pipeline    │  WebSocket│     with real-time
Defense Networks ──┤                │  Server   │     subscriptions
Aviation Feeds   ──┤                └──────────┘
News Wires (WAM) ──┘                     │
                                         ▼
                                   PostgreSQL +
                                   Redis Cache
```

> Currently using static mock data. The frontend is structured to easily swap in API calls via SWR/fetch.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2 (App Router, Turbopack) |
| Runtime | React 19 with Server Components |
| Language | TypeScript 6.0 (strict mode) |
| Styling | Tailwind CSS 4.2 (CSS-first config) |
| Components | shadcn/ui with Base UI primitives |
| Icons | Phosphor Icons (duotone weight) |
| Maps | Leaflet 1.9 with custom dark tiles |
| Charts | Recharts 3.8 + custom SVG sparklines |
| Animations | Framer Motion + CSS keyframes |
| Data Fetching | SWR (ready, not yet wired) |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+ (or pnpm/yarn)

### Installation

```bash
# Clone the repository
git clone https://github.com/reachvivek/aegis-uae.git
cd aegis-uae

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the root:

```env
# Map tiles (optional - defaults to CartoDB dark)
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png

# API endpoint (when backend is ready)
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Build

```bash
npm run build
npm start
```

## Features

### Core Modules

- **Airspace Stability Map** - Interactive Leaflet map with toggleable flight paths, weather zones, and restricted airspace overlays. Airport markers with real-time delay indices.

- **Stats Carousel** - Auto-rotating cards covering aviation pulse (on-time rates, delays), threat summary (missiles/drones fired vs intercepted with sparklines), defense systems (THAAD, Patriot, Pantsir intercept counts), and situation status (conflict state + GPS jamming).

- **Threat Timeline** - Chronological feed of threat events with type classification (missile, drone, cyber, GPS), intercept outcomes, region mapping, and severity indicators.

- **News Feed** - Categorized articles filtered by audience (students, employees, government) with collapsible ground truth section showing verified facts from official sources.

- **Evacuation Router** - Multi-modal evacuation routes (road, air, sea) with travel times, distances, checkpoint counts, capacity estimates, and real-time status (open/congested/closed).

- **AI Advisory** - Context-aware chat interface that cross-references queries with live GCAA directives, flight data, and verified news to provide personalized guidance.

### UX Design

- **OLED-optimized dark theme** with command center aesthetics
- **Progressive disclosure** on map layers with fade transitions
- **Urgency hierarchy** through color, animation, and typography weight
- **Mobile responsive** with adaptive layouts (grid on desktop, scroll on mobile)
- **Persistent alert system** with severity-coded auto-rotating banners
- **Breaking news ticker** with clickable items opening detail modals

## Roadmap

- [ ] Backend API with PostgreSQL + Redis
- [ ] Real-time WebSocket feeds for live data
- [ ] Historical data playback with time slider
- [ ] Multi-language support (Arabic/English)
- [ ] Scenario simulation mode
- [ ] Push notifications via service worker
- [ ] Role-based access (civilian vs operator view)
- [ ] PDF report generation

## License

MIT License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  <sub>
    Crafted by <a href="https://reachvivek.vercel.app">Vivek</a> &middot;
    <a href="https://linkedin.com/in/reachvivek">LinkedIn</a> &middot;
    <a href="https://github.com/reachvivek">GitHub</a> &middot;
    <a href="https://instagram.com/rogerthatvivek">@rogerthatvivek</a>
  </sub>
</p>
