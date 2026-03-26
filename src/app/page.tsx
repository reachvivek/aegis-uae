"use client";

import { useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  CrosshairIcon, GlobeIcon, PathIcon,
  NewspaperIcon, ChartLineIcon, RadioactiveIcon,
  ArrowsOutIcon, XIcon, CaretUpIcon, CaretDownIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

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
import { useCrisisMode } from "@/hooks/useCrisisMode";

type RightTab = "news" | "connectivity" | "threats" | "intel";

export default function Dashboard() {
  useSSE();
  useAlertSound();
  useTracking();
  useCrisisMode();
  const [tab, setTab] = useState<RightTab>("news");
  const [evacOpen, setEvacOpen] = useState(false);
  const [shelterOpen, setShelterOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<"stats" | "content" | null>(null);
  const [maximized, setMaximized] = useState(false);

  const tabLabels: Record<RightTab, string> = { news: "News & Updates", connectivity: "Route Connectivity", threats: "Threat Timeline", intel: "Latest Intel" };

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

            {/* Right panel - collapsible sections */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col lg:overflow-hidden
                            min-h-0 mt-2 lg:mt-0 gap-1.5">

              {/* Stats carousel - collapsible via click */}
              <div className="transition-all duration-300 ease-in-out overflow-hidden rounded-lg">
                {collapsed === "stats" ? (
                  <button
                    onClick={() => setCollapsed(null)}
                    className="w-full h-9 bg-card border border-border/50 rounded-lg flex items-center justify-between px-3 hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Stats & Status</span>
                    <CaretDownIcon className="w-3 h-3 text-muted-foreground" weight="bold" />
                  </button>
                ) : (
                  <div className="relative">
                    <StatsCarousel />
                    <button
                      onClick={() => setCollapsed("stats")}
                      className="absolute top-1.5 right-10 z-10 h-5 w-5 rounded flex items-center justify-center bg-card/80 backdrop-blur-sm border border-border/50 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Collapse stats"
                    >
                      <CaretUpIcon className="w-3 h-3" weight="bold" />
                    </button>
                  </div>
                )}
              </div>

              {/* Tabs + EVAC */}
              <div className="shrink-0 flex items-center gap-1.5">
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

                {/* Collapse/expand content toggle */}
                <button
                  onClick={() => setCollapsed(collapsed === "content" ? null : "content")}
                  className={cn(
                    "shrink-0 h-7 w-7 rounded-md flex items-center justify-center transition-colors border border-border/50",
                    collapsed === "content" ? "bg-teal/15 text-teal border-teal/30" : "bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/80"
                  )}
                  title={collapsed === "content" ? "Expand feed" : "Collapse feed"}
                >
                  {collapsed === "content"
                    ? <CaretDownIcon className="w-3.5 h-3.5" weight="bold" />
                    : <CaretUpIcon className="w-3.5 h-3.5" weight="bold" />}
                </button>

                {/* Maximize button */}
                <button
                  onClick={() => setMaximized(true)}
                  className="shrink-0 h-7 w-7 rounded-md flex items-center justify-center bg-card text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors border border-border/50"
                  title="Expand to full view"
                >
                  <ArrowsOutIcon className="w-3.5 h-3.5" weight="bold" />
                </button>

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

              {/* Tab content - collapsible via click, takes remaining space */}
              <div className={cn(
                "transition-all duration-300 ease-in-out overflow-hidden",
                collapsed === "content" ? "lg:h-9 lg:min-h-[36px]" : "flex-1 min-h-[50vh] sm:min-h-[40vh] lg:min-h-0"
              )}>
                {collapsed === "content" ? (
                  <button
                    onClick={() => setCollapsed(null)}
                    className="w-full h-9 bg-card border border-border/50 rounded-lg flex items-center justify-between px-3 hover:bg-secondary/50 transition-colors"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{tabLabels[tab]}</span>
                    <CaretDownIcon className="w-3 h-3 text-muted-foreground" weight="bold" />
                  </button>
                ) : (
                  <>
                    {tab === "news" && <TruthFeed />}
                    {tab === "connectivity" && <ConnectivityIndex />}
                    {tab === "threats" && <ThreatTimeline />}
                    {tab === "intel" && <LatestDevelopments />}
                  </>
                )}
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

      {/* Maximize modal for feed/tab content */}
      {maximized && (
        <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) setMaximized(false); }}>
          <div className="w-full max-w-3xl h-[85vh] bg-card border border-border rounded-xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{tabLabels[tab]}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Tabs value={tab} onValueChange={(v) => setTab(v as RightTab)}>
                  <TabsList className="h-7 bg-secondary gap-0.5">
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
                <button onClick={() => setMaximized(false)}
                  className="h-7 w-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground">
                  <XIcon className="w-4 h-4" weight="bold" />
                </button>
              </div>
            </div>
            {/* Modal content */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              {tab === "news" && <TruthFeed />}
              {tab === "connectivity" && <ConnectivityIndex />}
              {tab === "threats" && <ThreatTimeline />}
              {tab === "intel" && <LatestDevelopments />}
            </div>
          </div>
        </div>
      )}

      {/* Shelter finder modal */}
      <ShelterFinder open={shelterOpen} onOpenChange={setShelterOpen} />

      {/* Evac modal */}
      <EvacuationRoutes open={evacOpen} onOpenChange={setEvacOpen} />
    </div>
  );
}
