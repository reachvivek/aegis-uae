"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CrosshairIcon, GlobeIcon, PathIcon,
  NewspaperIcon, ChartLineIcon, RadioactiveIcon,
} from "@phosphor-icons/react";

import StatusTicker from "@/components/layout/StatusTicker";
import Header from "@/components/layout/Header";
import AlertBanner from "@/components/layout/AlertBanner";
import NewsTicker from "@/components/layout/NewsTicker";
import TruthFeed from "@/components/feeds/TruthFeed";
import StatsCarousel from "@/components/stats/StatsCarousel";
import ConnectivityIndex from "@/components/aviation/ConnectivityIndex";
import StabilityMap from "@/components/map/StabilityMap";
import FloatingAdvisory from "@/components/advisory/FloatingAdvisory";
import ThreatTimeline from "@/components/threat/ThreatTimeline";
import EvacuationRoutes from "@/components/evacuation/EvacuationRoutes";
import ShelterFinder from "@/components/shelter/ShelterFinder";
import LatestDevelopments from "@/components/intel/LatestDevelopments";
import { useSSE } from "@/hooks/useSSE";
import { useAlertSound } from "@/hooks/useAlertSound";
import { useTracking } from "@/hooks/useTracking";

type RightTab = "news" | "connectivity" | "threats" | "intel";

export default function Dashboard() {
  useSSE();
  useAlertSound();
  useTracking();
  const [tab, setTab] = useState<RightTab>("news");
  const [evacOpen, setEvacOpen] = useState(false);
  const [shelterOpen, setShelterOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Fixed top bars */}
      <StatusTicker />
      <Header />
      <AlertBanner />

      {/* Main dashboard */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full max-w-[1920px] mx-auto px-2.5 sm:px-3 py-2 sm:py-2.5">
          {/* Desktop: fixed side-by-side grid | Mobile: single scrollable column */}
          <div className="h-full lg:grid lg:grid-cols-12 lg:gap-3 lg:overflow-hidden
                          flex flex-col overflow-y-auto scrollbar-none">

            {/* Map - fixed height on mobile, fills on desktop */}
            <div className="shrink-0 lg:shrink lg:col-span-7 xl:col-span-8 overflow-hidden
                            h-[35vh] sm:h-[40vh] lg:h-full rounded-lg">
              <StabilityMap />
            </div>

            {/* Right panel - scrollable on mobile */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col lg:overflow-hidden
                            min-h-0 mt-2 lg:mt-0">

              {/* Stats carousel */}
              <div className="shrink-0 mb-2">
                <StatsCarousel />
              </div>

              {/* Tabs + EVAC */}
              <div className="shrink-0 mb-2 flex items-center gap-1.5">
                <Tabs value={tab} onValueChange={(v) => setTab(v as RightTab)} className="flex-1 min-w-0">
                  <TabsList className="h-7 w-full bg-card gap-0.5">
                    <TabsTrigger value="news" className="text-[8px] h-5 gap-0.5 data-[state=active]:text-teal data-[state=active]:bg-teal-dim">
                      <NewspaperIcon className="w-2.5 h-2.5" weight="bold" /> Feed
                    </TabsTrigger>
                    <TabsTrigger value="connectivity" className="text-[8px] h-5 gap-0.5 data-[state=active]:text-teal data-[state=active]:bg-teal-dim">
                      <ChartLineIcon className="w-2.5 h-2.5" weight="bold" /> Routes
                    </TabsTrigger>
                    <TabsTrigger value="threats" className="text-[8px] h-5 gap-0.5 data-[state=active]:text-danger data-[state=active]:bg-danger-dim">
                      <CrosshairIcon className="w-2.5 h-2.5" weight="bold" /> Threats
                    </TabsTrigger>
                    <TabsTrigger value="intel" className="text-[8px] h-5 gap-0.5 data-[state=active]:text-cyan data-[state=active]:bg-cyan/10">
                      <GlobeIcon className="w-2.5 h-2.5" weight="bold" /> Intel
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                <button
                  onClick={() => setShelterOpen(true)}
                  className="shrink-0 h-7 px-2 sm:px-2.5 rounded-md flex items-center gap-1 bg-purple-500/15 text-purple-400 text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all hover:bg-purple-500/25 border border-purple-500/30"
                >
                  <RadioactiveIcon className="w-3 h-3" weight="bold" />
                  <span className="hidden sm:inline">SAFE</span>
                </button>

                <button
                  onClick={() => setEvacOpen(true)}
                  className="shrink-0 h-7 px-2.5 sm:px-3 rounded-md flex items-center gap-1 bg-danger text-white text-[9px] font-bold uppercase tracking-wider cursor-pointer transition-all hover:bg-danger/80 pulse-live glow-red border border-danger/50"
                >
                  <PathIcon className="w-3 h-3" weight="bold" />
                  <span className="hidden sm:inline">EVAC</span>
                </button>
              </div>

              {/* Tab content - takes remaining space on desktop, fixed height on mobile */}
              <div className="flex-1 min-h-[50vh] sm:min-h-[40vh] lg:min-h-0 overflow-hidden">
                {tab === "news" && <TruthFeed />}
                {tab === "connectivity" && <ConnectivityIndex />}
                {tab === "threats" && <ThreatTimeline />}
                {tab === "intel" && <LatestDevelopments />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Developer credit */}
      <div className="w-full px-3 py-0.5 flex items-center justify-end shrink-0">
        <a href="https://linkedin.com/in/reachvivek" target="_blank" rel="noopener noreferrer"
          className="text-[7px] font-mono text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">
          Built by Vivek
        </a>
      </div>

      {/* News ticker */}
      <NewsTicker />

      {/* Floating AI Advisory */}
      <FloatingAdvisory />

      {/* Shelter finder modal */}
      <ShelterFinder open={shelterOpen} onOpenChange={setShelterOpen} />

      {/* Evac modal */}
      <EvacuationRoutes open={evacOpen} onOpenChange={setEvacOpen} />
    </div>
  );
}
