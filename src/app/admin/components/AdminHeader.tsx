"use client";

import { cn } from "@/lib/utils";
import { ListIcon } from "@phosphor-icons/react";

type Tab = "overview" | "conversations" | "queries" | "push-alert" | "ai-config";

const tabMeta: Record<Tab, { title: string; description: string }> = {
  overview: { title: "Overview", description: "Dashboard analytics, traffic, and user metrics" },
  conversations: { title: "Conversations", description: "View and review chat sessions" },
  queries: { title: "Popular Queries", description: "Most frequently asked questions" },
  "push-alert": { title: "Push Alerts", description: "Crisis management, alerts, and emergency controls" },
  "ai-config": { title: "AI Configuration", description: "Tune advisory chatbot behavior and personality" },
};

interface AdminHeaderProps {
  tab: Tab;
  crisisMode: boolean;
  crisisLoading: boolean;
  toggleCrisisMode: (active: boolean) => void;
  onMenuToggle?: () => void;
}

export default function AdminHeader({ tab, crisisMode, crisisLoading, toggleCrisisMode, onMenuToggle }: AdminHeaderProps) {
  const meta = tabMeta[tab];

  return (
    <header className="sticky top-0 z-30 bg-[#050507]/80 backdrop-blur-xl border-b border-[#1E1E28]">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <div className="flex items-center gap-3 min-w-0">
          {onMenuToggle && (
            <button onClick={onMenuToggle} className="lg:hidden text-[#7C7C8A] hover:text-white transition-colors shrink-0">
              <ListIcon className="w-5 h-5" weight="bold" />
            </button>
          )}
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white truncate">{meta.title}</h2>
            <p className="text-[10px] text-[#7C7C8A] hidden sm:block">{meta.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Crisis Mode Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 px-2 sm:px-3 py-1.5 rounded-lg border border-[#1E1E28] bg-[#0C0C10]">
            <div className={cn("w-2 h-2 rounded-full transition-colors", crisisMode ? "bg-red-500 animate-pulse" : "bg-[#2E2E3A]")} />
            <span className={cn("text-[10px] font-bold uppercase tracking-wider hidden sm:inline", crisisMode ? "text-red-400" : "text-[#7C7C8A]")}>
              {crisisMode ? "Crisis ON" : "Crisis Off"}
            </span>
            <button
              onClick={() => toggleCrisisMode(!crisisMode)}
              disabled={crisisLoading}
              className={cn(
                "relative w-9 h-5 rounded-full transition-all duration-300 cursor-pointer",
                crisisMode ? "bg-red-500" : "bg-[#2E2E3A]",
                crisisLoading && "opacity-50"
              )}
            >
              <div className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300",
                crisisMode ? "left-4.5" : "left-0.5"
              )} />
            </button>
          </div>

          {/* Timestamp */}
          <div className="text-[9px] font-mono text-[#7C7C8A] hidden md:block">
            {new Date().toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </div>
      </div>
    </header>
  );
}
