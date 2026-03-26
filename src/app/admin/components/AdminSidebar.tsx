"use client";

import { cn } from "@/lib/utils";
import {
  ChartBarIcon, ChatCircleDotsIcon, MagnifyingGlassIcon,
  MegaphoneIcon, GearSixIcon, ArrowLeftIcon, ShieldCheckIcon, XIcon,
} from "@phosphor-icons/react";

type Tab = "overview" | "conversations" | "queries" | "push-alert" | "ai-config";

const navItems: { id: Tab; label: string; icon: React.ComponentType<any>; description: string }[] = [
  { id: "overview", label: "Overview", icon: ChartBarIcon, description: "Analytics & stats" },
  { id: "conversations", label: "Conversations", icon: ChatCircleDotsIcon, description: "Chat sessions" },
  { id: "queries", label: "Queries", icon: MagnifyingGlassIcon, description: "Popular questions" },
  { id: "push-alert", label: "Push Alerts", icon: MegaphoneIcon, description: "Crisis & alerts" },
  { id: "ai-config", label: "AI Config", icon: GearSixIcon, description: "Advisory tuning" },
];

interface AdminSidebarProps {
  tab: Tab;
  setTab: (tab: Tab) => void;
  crisisMode: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({ tab, setTab, crisisMode, mobileOpen, onMobileClose }: AdminSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}
      <aside className={cn(
        "w-56 shrink-0 bg-[#08080C] border-r border-[#1E1E28] flex flex-col h-screen",
        "fixed top-0 left-0 z-50 transition-transform duration-300 lg:sticky lg:translate-x-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
      {/* Brand */}
      <div className="px-4 py-5 border-b border-[#1E1E28]">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#00E5B8]/10 flex items-center justify-center border border-[#00E5B8]/20">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-[#00E5B8]" weight="duotone" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-none">
                <span className="text-[#00E5B8]">Aegis</span>
                <span className="text-white">UAE</span>
              </h1>
              <p className="text-[8px] text-[#7C7C8A] uppercase tracking-widest mt-0.5">Admin Console</p>
            </div>
          </a>
          {onMobileClose && (
            <button onClick={onMobileClose} className="lg:hidden text-[#7C7C8A] hover:text-white transition-colors">
              <XIcon className="w-4 h-4" weight="bold" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        <p className="text-[8px] text-[#7C7C8A]/60 uppercase tracking-widest font-bold px-2 mb-2">Navigation</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); onMobileClose?.(); }}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all duration-200 group",
                isActive
                  ? "bg-[#00E5B8]/10 text-[#00E5B8]"
                  : "text-[#7C7C8A] hover:bg-[#12121A] hover:text-white"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-colors",
                isActive ? "bg-[#00E5B8]/15" : "bg-[#12121A] group-hover:bg-[#1E1E28]"
              )}>
                <Icon
                  className={cn("w-3.5 h-3.5", isActive ? "text-[#00E5B8]" : "text-[#7C7C8A] group-hover:text-white")}
                  weight={isActive ? "duotone" : "regular"}
                />
              </div>
              <div className="min-w-0">
                <p className={cn(
                  "text-xs font-semibold truncate",
                  isActive ? "text-[#00E5B8]" : "text-white group-hover:text-white"
                )}>
                  {item.label}
                </p>
                <p className="text-[9px] text-[#7C7C8A] truncate">{item.description}</p>
              </div>
              {isActive && (
                <div className="ml-auto w-1 h-4 rounded-full bg-[#00E5B8]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Crisis Status Footer */}
      <div className={cn(
        "mx-2 mb-3 px-3 py-2.5 rounded-lg border transition-all duration-300",
        crisisMode
          ? "bg-red-500/10 border-red-500/30"
          : "bg-[#0C0C10] border-[#1E1E28]"
      )}>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full shrink-0",
            crisisMode ? "bg-red-500 animate-pulse" : "bg-green-500"
          )} />
          <div>
            <p className={cn("text-[10px] font-bold", crisisMode ? "text-red-400" : "text-green-400")}>
              {crisisMode ? "CRISIS ACTIVE" : "System Normal"}
            </p>
            <p className="text-[8px] text-[#7C7C8A]">
              {crisisMode ? "All users see emergency UI" : "Standard operations"}
            </p>
          </div>
        </div>
      </div>

      {/* Back to Dashboard */}
      <div className="px-2 pb-3">
        <a
          href="/"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#7C7C8A] hover:text-white hover:bg-[#12121A] transition-colors text-xs"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" weight="bold" />
          <span>Back to Dashboard</span>
        </a>
      </div>
    </aside>
    </>
  );
}
