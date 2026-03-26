"use client";

import { cn } from "@/lib/utils";

type Tab = "overview" | "conversations" | "queries" | "push-alert" | "ai-config";

const navItems: { id: Tab; label: string; icon: string; description: string }[] = [
  { id: "overview", label: "Overview", icon: "📊", description: "Analytics & stats" },
  { id: "conversations", label: "Conversations", icon: "💬", description: "Chat sessions" },
  { id: "queries", label: "Queries", icon: "🔍", description: "Popular questions" },
  { id: "push-alert", label: "Push Alerts", icon: "🚨", description: "Crisis & alerts" },
  { id: "ai-config", label: "AI Config", icon: "🤖", description: "Advisory tuning" },
];

interface AdminSidebarProps {
  tab: Tab;
  setTab: (tab: Tab) => void;
  crisisMode: boolean;
}

export default function AdminSidebar({ tab, setTab, crisisMode }: AdminSidebarProps) {
  return (
    <aside className="w-56 shrink-0 bg-[#08080C] border-r border-[#1E1E28] flex flex-col h-screen sticky top-0">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-[#1E1E28]">
        <a href="/" className="block">
          <h1 className="text-base font-bold">
            <span className="text-[#00E5B8]">Aegis</span>
            <span className="text-white">UAE</span>
          </h1>
          <p className="text-[9px] text-[#7C7C8A] uppercase tracking-widest mt-0.5">Admin Console</p>
        </a>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        <p className="text-[8px] text-[#7C7C8A]/60 uppercase tracking-widest font-bold px-2 mb-2">Navigation</p>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-all duration-200 group",
              tab === item.id
                ? "bg-[#00E5B8]/10 text-[#00E5B8]"
                : "text-[#7C7C8A] hover:bg-[#12121A] hover:text-white"
            )}
          >
            <span className="text-sm">{item.icon}</span>
            <div className="min-w-0">
              <p className={cn(
                "text-xs font-semibold truncate",
                tab === item.id ? "text-[#00E5B8]" : "text-white group-hover:text-white"
              )}>
                {item.label}
              </p>
              <p className="text-[9px] text-[#7C7C8A] truncate">{item.description}</p>
            </div>
            {tab === item.id && (
              <div className="ml-auto w-1 h-4 rounded-full bg-[#00E5B8]" />
            )}
          </button>
        ))}
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
          <span>←</span>
          <span>Back to Dashboard</span>
        </a>
      </div>
    </aside>
  );
}
