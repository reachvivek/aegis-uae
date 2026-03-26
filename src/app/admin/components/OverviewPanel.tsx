"use client";

import { cn } from "@/lib/utils";

interface Overview {
  totalViews: number;
  totalConversations: number;
  uniqueVisitors: number;
  todayViews: number;
  viewsByDay: { day: string; count: number }[];
  viewsByHour: { hour: number; count: number }[];
  devices: { device: string; count: number }[];
  referrers: { referrer: string; count: number }[];
  countries: { country: string; count: number }[];
  cities: { city: string; country: string; count: number }[];
  avgSessionDuration: number;
  bounceRate: number;
  peakHour: number;
}

interface OverviewPanelProps {
  overview: Overview;
}

export default function OverviewPanel({ overview }: OverviewPanelProps) {
  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Total Views", value: overview.totalViews, color: "text-[#00E5B8]", accent: "#00E5B8" },
          { label: "Today", value: overview.todayViews, color: "text-[#00E5B8]", accent: "#00E5B8" },
          { label: "Unique Visitors", value: overview.uniqueVisitors, color: "text-blue-400", accent: "#60A5FA" },
          { label: "Conversations", value: overview.totalConversations, color: "text-purple-400", accent: "#A78BFA" },
          { label: "Countries", value: (overview.countries || []).length, color: "text-amber-400", accent: "#FBBF24" },
          { label: "Peak Hour", value: overview.peakHour != null ? `${overview.peakHour}:00` : "-", color: "text-cyan-400", accent: "#22D3EE", raw: true },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-3.5 hover:border-[#2E2E3A] transition-colors"
          >
            <p className="text-[9px] text-[#7C7C8A] uppercase tracking-wider mb-1.5">{s.label}</p>
            <p className={cn("text-xl font-bold font-mono", s.color)}>
              {(s as any).raw ? String(s.value) : typeof s.value === "number" ? s.value.toLocaleString() : s.value}
            </p>
            <div className="mt-2 h-0.5 rounded-full bg-[#1E1E28]">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: "60%", backgroundColor: s.accent + "40" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Views by day */}
        {overview.viewsByDay.length > 0 && (
          <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7C8A] mb-4">Views — Last 7 Days</p>
            <div className="flex items-end gap-2 h-36">
              {overview.viewsByDay.map((d) => {
                const max = Math.max(...overview.viewsByDay.map((v) => v.count), 1);
                const height = (d.count / max) * 100;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <span className="text-[9px] font-mono text-[#00E5B8] opacity-0 group-hover:opacity-100 transition-opacity font-bold">{d.count}</span>
                    <div
                      className="w-full rounded-md bg-gradient-to-t from-[#00E5B8]/40 to-[#00E5B8]/10 border border-[#00E5B8]/20 transition-all group-hover:from-[#00E5B8]/60 group-hover:to-[#00E5B8]/25 group-hover:border-[#00E5B8]/40"
                      style={{ height: `${Math.max(height, 4)}%` }}
                    />
                    <span className="text-[8px] font-mono text-[#7C7C8A]">{d.day.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Hourly heatmap */}
        <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7C8A] mb-4">Activity by Hour</p>
          <div className="grid grid-cols-12 gap-1.5">
            {Array.from({ length: 24 }, (_, h) => {
              const hourData = (overview.viewsByHour || []).find((v) => v.hour === h);
              const count = hourData?.count || 0;
              const maxHour = Math.max(...(overview.viewsByHour || []).map((v) => v.count), 1);
              const intensity = count / maxHour;
              return (
                <div key={h} className="flex flex-col items-center gap-0.5 group" title={`${h}:00 — ${count} views`}>
                  <div
                    className="w-full aspect-square rounded transition-all cursor-default"
                    style={{
                      backgroundColor: count > 0 ? `rgba(0, 229, 184, ${0.15 + intensity * 0.7})` : "rgba(30, 30, 40, 0.5)",
                      boxShadow: count > 0 ? `0 0 ${intensity * 8}px rgba(0, 229, 184, ${intensity * 0.3})` : "none",
                    }}
                  />
                  {h % 3 === 0 && <span className="text-[6px] font-mono text-[#7C7C8A]">{h}</span>}
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-between mt-2.5">
            <span className="text-[7px] text-[#7C7C8A] font-mono">Less</span>
            <div className="flex gap-0.5">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((o) => (
                <div key={o} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `rgba(0, 229, 184, ${o})` }} />
              ))}
            </div>
            <span className="text-[7px] text-[#7C7C8A] font-mono">More</span>
          </div>
        </div>
      </div>

      {/* Devices + Geo row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Devices */}
        <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7C8A] mb-3">Devices</p>
          <div className="space-y-3">
            {overview.devices.map((d) => {
              const total = overview.devices.reduce((s, x) => s + x.count, 0) || 1;
              const pct = Math.round((d.count / total) * 100);
              const colors: Record<string, string> = { desktop: "#00E5B8", mobile: "#818CF8", tablet: "#F59E0B" };
              const color = colors[d.device?.toLowerCase()] || "#7C7C8A";
              return (
                <div key={d.device}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-white capitalize font-bold">{d.device || "Unknown"}</span>
                    <span className="text-[10px] font-mono" style={{ color }}>{pct}% ({d.count})</span>
                  </div>
                  <div className="h-2 bg-[#1E1E28] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                </div>
              );
            })}
            {overview.devices.length === 0 && <p className="text-xs text-[#7C7C8A]">No data yet</p>}
          </div>
        </div>

        {/* Countries */}
        <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7C8A] mb-3">Top Countries</p>
          <div className="space-y-2">
            {(overview.countries || []).map((c, i) => {
              const total = (overview.countries || []).reduce((s, x) => s + x.count, 0) || 1;
              const pct = Math.round((c.count / total) * 100);
              return (
                <div key={c.country} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#7C7C8A] w-4 text-right">{i + 1}</span>
                  <span className="text-xs text-white flex-1 truncate">{c.country || "Unknown"}</span>
                  <div className="w-16 h-1.5 bg-[#1E1E28] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400/70 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 w-8 text-right">{c.count}</span>
                </div>
              );
            })}
            {(overview.countries || []).length === 0 && <p className="text-xs text-[#7C7C8A]">Collecting...</p>}
          </div>
        </div>

        {/* Cities */}
        <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7C8A] mb-3">Top Cities</p>
          <div className="space-y-2">
            {(overview.cities || []).map((c, i) => (
              <div key={`${c.city}-${c.country}`} className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-[#7C7C8A] w-4 text-right">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-white truncate block">{c.city || "Unknown"}</span>
                  <span className="text-[8px] text-[#7C7C8A]">{c.country}</span>
                </div>
                <span className="text-[10px] font-mono text-blue-400">{c.count}</span>
              </div>
            ))}
            {(overview.cities || []).length === 0 && <p className="text-xs text-[#7C7C8A]">Collecting...</p>}
          </div>
        </div>
      </div>

      {/* Referrers */}
      <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7C8A] mb-3">Traffic Sources</p>
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
          {overview.referrers.map((r) => {
            const total = overview.referrers.reduce((s, x) => s + x.count, 0) || 1;
            const pct = Math.round((r.count / total) * 100);
            return (
              <div key={r.referrer} className="flex items-center gap-2">
                <span className="text-xs text-white truncate flex-1">{r.referrer || "Direct"}</span>
                <div className="w-20 h-1.5 bg-[#1E1E28] rounded-full overflow-hidden shrink-0">
                  <div className="h-full bg-blue-400/70 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[10px] font-mono text-blue-400 w-6 text-right shrink-0">{r.count}</span>
              </div>
            );
          })}
          {overview.referrers.length === 0 && <p className="text-xs text-[#7C7C8A]">No referrer data</p>}
        </div>
      </div>
    </div>
  );
}
