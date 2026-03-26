"use client";

import { useState, useEffect, useCallback } from "react";
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

interface Session {
  sessionId: string;
  messages: number;
  userMessages: number;
  images: number;
  startedAt: string;
  lastActivity: string;
}

interface ChatMessage {
  role: string;
  content: string;
  hasImage: number;
  createdAt: string;
}

interface PopularQuery {
  query: string;
  count: number;
}

interface AIConfig {
  tone: string;
  responseStyle: string;
  bannedTopics: string;
  customRules: string;
  signOff: string;
  maxResponseLength: string;
  personality: string;
  filters: string;
}

type Tab = "overview" | "conversations" | "queries" | "push-alert" | "ai-config";

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatMessage[] | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [queries, setQueries] = useState<PopularQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [alertForm, setAlertForm] = useState({ severity: "critical", category: "THREAT", title: "", titleAr: "", description: "", descriptionAr: "", regions: "UAE", expiresInHours: 1 });
  const [alertSent, setAlertSent] = useState("");
  const [allAlerts, setAllAlerts] = useState<any[]>([]);
  const [alertLang, setAlertLang] = useState<"en" | "ar">("en");
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [aiConfigSaved, setAiConfigSaved] = useState("");
  const [crisisMode, setCrisisMode] = useState(false);
  const [crisisLoading, setCrisisLoading] = useState(false);

  const fetchData = useCallback(async (section: string, params?: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin?key=${encodeURIComponent(key)}&section=${section}${params || ""}`);
      if (!res.ok) {
        if (res.status === 401) { setAuthenticated(false); setError("Invalid key"); return null; }
        throw new Error("Request failed");
      }
      return await res.json();
    } catch {
      setError("Failed to load data");
      return null;
    } finally {
      setLoading(false);
    }
  }, [key]);

  const login = async () => {
    const data = await fetchData("overview");
    if (data) {
      setAuthenticated(true);
      setOverview(data);
    }
  };

  // Fetch crisis mode state on auth (needed for header toggle)
  useEffect(() => {
    if (!authenticated) return;
    fetch("/api/admin/crisis-mode")
      .then((r) => r.json())
      .then((d) => setCrisisMode(d.active === true))
      .catch(() => {});
  }, [authenticated]);

  useEffect(() => {
    if (!authenticated) return;
    if (tab === "overview") fetchData("overview").then((d) => d && setOverview(d));
    if (tab === "conversations") fetchData("conversations").then((d) => d && setSessions(d.sessions || []));
    if (tab === "queries") fetchData("popular-queries").then((d) => d && setQueries(d.queries || []));
    if (tab === "push-alert") {
      fetch("/api/admin/alert", { headers: { "x-admin-key": key } })
        .then((r) => r.json())
        .then((d) => setAllAlerts(d.alerts || []))
        .catch(() => {});
    }
    if (tab === "ai-config" && !aiConfig) {
      fetch("/api/admin/ai-config", { headers: { "x-admin-key": key } })
        .then((r) => r.json())
        .then((d) => setAiConfig(d))
        .catch(() => setError("Failed to load AI config"));
    }
  }, [tab, authenticated, fetchData]);

  const toggleCrisisMode = async (active: boolean) => {
    setCrisisLoading(true);
    try {
      const res = await fetch("/api/admin/crisis-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": key },
        body: JSON.stringify({ active }),
      });
      if (!res.ok) throw new Error("Failed");
      setCrisisMode(active);
    } catch {
      setError("Failed to toggle crisis mode");
    } finally {
      setCrisisLoading(false);
    }
  };

  const viewConversation = async (sessionId: string) => {
    const data = await fetchData("conversation", `&sessionId=${sessionId}`);
    if (data) {
      setSelectedChat(data.messages);
      setSelectedSessionId(sessionId);
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-6 shadow-2xl">
          <h1 className="text-lg font-bold text-white mb-1">AegisUAE Admin</h1>
          <p className="text-xs text-[#7C7C8A] mb-4">Enter admin key to access analytics</p>
          {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            placeholder="Admin key"
            className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40 mb-3"
            autoFocus
          />
          <button onClick={login} disabled={!key || loading}
            className="w-full bg-[#00E5B8] hover:bg-[#00E5B8]/90 text-[#050507] font-bold text-sm py-2 rounded-lg transition-colors disabled:opacity-50">
            {loading ? "Checking..." : "Access Dashboard"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-white">
      {/* Header */}
      <div className="border-b border-[#1E1E28] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold"><span className="text-[#00E5B8]">Aegis</span>UAE Admin</h1>
            <p className="text-[10px] text-[#7C7C8A] uppercase tracking-wider">Analytics & Conversations</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Crisis Mode Toggle in Header */}
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full transition-colors", crisisMode ? "bg-red-500 animate-pulse" : "bg-[#2E2E3A]")} />
              <span className={cn("text-[10px] font-bold uppercase tracking-wider", crisisMode ? "text-red-400" : "text-[#7C7C8A]")}>
                {crisisMode ? "CRISIS ON" : "Crisis Off"}
              </span>
              <button
                onClick={() => toggleCrisisMode(!crisisMode)}
                disabled={crisisLoading}
                className={cn(
                  "relative w-10 h-5 rounded-full transition-all duration-300 cursor-pointer",
                  crisisMode ? "bg-red-500" : "bg-[#2E2E3A]",
                  crisisLoading && "opacity-50"
                )}
              >
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-all duration-300",
                  crisisMode ? "left-5" : "left-0.5"
                )} />
              </button>
            </div>
            <a href="/" className="text-xs text-[#7C7C8A] hover:text-white transition-colors">Back to Dashboard</a>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#1E1E28] px-6">
        <div className="max-w-6xl mx-auto flex gap-1">
          {(["overview", "conversations", "queries", "push-alert", "ai-config"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setSelectedChat(null); }}
              className={cn(
                "px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors border-b-2",
                tab === t ? "border-[#00E5B8] text-[#00E5B8]" : "border-transparent text-[#7C7C8A] hover:text-white"
              )}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading && <div className="text-center text-[#7C7C8A] text-sm py-8">Loading...</div>}
        {error && <div className="text-center text-red-400 text-sm py-8">{error}</div>}

        {/* Overview */}
        {tab === "overview" && overview && !loading && (
          <div className="space-y-4">
            {/* Stat cards - 6 metrics */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: "Total Views", value: overview.totalViews, color: "text-[#00E5B8]", border: "border-[#00E5B8]/20" },
                { label: "Today", value: overview.todayViews, color: "text-[#00E5B8]", border: "border-[#00E5B8]/20" },
                { label: "Unique Visitors", value: overview.uniqueVisitors, color: "text-blue-400", border: "border-blue-400/20" },
                { label: "Conversations", value: overview.totalConversations, color: "text-purple-400", border: "border-purple-400/20" },
                { label: "Countries", value: (overview.countries || []).length, color: "text-amber-400", border: "border-amber-400/20" },
                { label: "Peak Hour", value: overview.peakHour != null ? `${overview.peakHour}:00` : "-", color: "text-cyan-400", border: "border-cyan-400/20", raw: true },
              ].map((s) => (
                <div key={s.label} className={cn("bg-[#0C0C10] border rounded-xl p-3", s.border)}>
                  <p className="text-[9px] text-[#7C7C8A] uppercase tracking-wider mb-1">{s.label}</p>
                  <p className={cn("text-xl font-bold font-mono", s.color)}>
                    {(s as any).raw ? String(s.value) : typeof s.value === "number" ? s.value.toLocaleString() : s.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Views chart + Hourly heatmap */}
            <div className="grid md:grid-cols-2 gap-3">
              {/* Views by day */}
              {overview.viewsByDay.length > 0 && (
                <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#7C7C8A] mb-3">Views (Last 7 Days)</p>
                  <div className="flex items-end gap-2 h-32">
                    {overview.viewsByDay.map((d) => {
                      const max = Math.max(...overview.viewsByDay.map((v) => v.count as number), 1);
                      const height = ((d.count as number) / max) * 100;
                      return (
                        <div key={d.day as string} className="flex-1 flex flex-col items-center gap-1 group">
                          <span className="text-[9px] font-mono text-[#7C7C8A] opacity-0 group-hover:opacity-100 transition-opacity">{d.count as number}</span>
                          <div className="w-full rounded-t-md bg-gradient-to-t from-[#00E5B8]/30 to-[#00E5B8]/10 border border-[#00E5B8]/30 transition-all group-hover:from-[#00E5B8]/50 group-hover:to-[#00E5B8]/20"
                            style={{ height: `${Math.max(height, 4)}%` }} />
                          <span className="text-[8px] font-mono text-[#7C7C8A]">{(d.day as string).slice(5)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Hourly activity heatmap */}
              <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7C7C8A] mb-3">Activity by Hour (Today)</p>
                <div className="grid grid-cols-12 gap-1">
                  {Array.from({ length: 24 }, (_, h) => {
                    const hourData = (overview.viewsByHour || []).find((v) => v.hour === h);
                    const count = hourData?.count || 0;
                    const maxHour = Math.max(...(overview.viewsByHour || []).map((v) => v.count as number), 1);
                    const intensity = count / maxHour;
                    return (
                      <div key={h} className="flex flex-col items-center gap-0.5 group" title={`${h}:00 - ${count} views`}>
                        <div className="w-full aspect-square rounded-sm transition-all"
                          style={{
                            backgroundColor: count > 0 ? `rgba(0, 229, 184, ${0.15 + intensity * 0.7})` : "rgba(30, 30, 40, 0.5)",
                            boxShadow: count > 0 ? `0 0 ${intensity * 8}px rgba(0, 229, 184, ${intensity * 0.3})` : "none",
                          }} />
                        {h % 3 === 0 && <span className="text-[6px] font-mono text-[#7C7C8A]">{h}</span>}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[7px] text-[#7C7C8A] font-mono">Less</span>
                  <div className="flex gap-0.5">
                    {[0.1, 0.3, 0.5, 0.7, 0.9].map((o) => (
                      <div key={o} className="w-2 h-2 rounded-sm" style={{ backgroundColor: `rgba(0, 229, 184, ${o})` }} />
                    ))}
                  </div>
                  <span className="text-[7px] text-[#7C7C8A] font-mono">More</span>
                </div>
              </div>
            </div>

            {/* Devices (donut chart style) + Locations */}
            <div className="grid md:grid-cols-3 gap-3">
              {/* Devices as visual bars */}
              <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7C7C8A] mb-3">Devices</p>
                <div className="space-y-3">
                  {overview.devices.map((d) => {
                    const total = overview.devices.reduce((s, x) => s + (x.count as number), 0) || 1;
                    const pct = Math.round(((d.count as number) / total) * 100);
                    const colors: Record<string, string> = { desktop: "#00E5B8", mobile: "#818CF8", tablet: "#F59E0B" };
                    const color = colors[(d.device as string)?.toLowerCase()] || "#7C7C8A";
                    return (
                      <div key={d.device as string}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-white capitalize font-bold">{(d.device as string) || "Unknown"}</span>
                          <span className="text-[10px] font-mono" style={{ color }}>{pct}% ({d.count as number})</span>
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

              {/* Top Countries */}
              <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7C7C8A] mb-3">Top Countries</p>
                <div className="space-y-2">
                  {(overview.countries || []).map((c, i) => {
                    const total = (overview.countries || []).reduce((s, x) => s + (x.count as number), 0) || 1;
                    const pct = Math.round(((c.count as number) / total) * 100);
                    return (
                      <div key={c.country as string} className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-[#7C7C8A] w-4 text-right">{i + 1}</span>
                        <span className="text-xs text-white flex-1 truncate">{(c.country as string) || "Unknown"}</span>
                        <div className="w-16 h-1.5 bg-[#1E1E28] rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400/70 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-[10px] font-mono text-amber-400 w-8 text-right">{c.count as number}</span>
                      </div>
                    );
                  })}
                  {(overview.countries || []).length === 0 && <p className="text-xs text-[#7C7C8A]">Collecting location data...</p>}
                </div>
              </div>

              {/* Top Cities */}
              <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7C7C8A] mb-3">Top Cities</p>
                <div className="space-y-2">
                  {(overview.cities || []).map((c, i) => (
                    <div key={`${c.city}-${c.country}`} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#7C7C8A] w-4 text-right">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs text-white truncate block">{(c.city as string) || "Unknown"}</span>
                        <span className="text-[8px] text-[#7C7C8A]">{c.country as string}</span>
                      </div>
                      <span className="text-[10px] font-mono text-blue-400">{c.count as number}</span>
                    </div>
                  ))}
                  {(overview.cities || []).length === 0 && <p className="text-xs text-[#7C7C8A]">Collecting location data...</p>}
                </div>
              </div>
            </div>

            {/* Referrers */}
            <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#7C7C8A] mb-3">Traffic Sources</p>
              <div className="grid md:grid-cols-2 gap-x-6 gap-y-2">
                {overview.referrers.map((r) => {
                  const total = overview.referrers.reduce((s, x) => s + (x.count as number), 0) || 1;
                  const pct = Math.round(((r.count as number) / total) * 100);
                  return (
                    <div key={r.referrer as string} className="flex items-center gap-2">
                      <span className="text-xs text-white truncate flex-1">{(r.referrer as string) || "Direct"}</span>
                      <div className="w-20 h-1.5 bg-[#1E1E28] rounded-full overflow-hidden shrink-0">
                        <div className="h-full bg-blue-400/70 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-blue-400 w-6 text-right shrink-0">{r.count as number}</span>
                    </div>
                  );
                })}
                {overview.referrers.length === 0 && <p className="text-xs text-[#7C7C8A]">No referrer data yet</p>}
              </div>
            </div>
          </div>
        )}

        {/* Conversations */}
        {tab === "conversations" && !loading && (
          <div className="grid md:grid-cols-[300px_1fr] gap-4">
            {/* Session list */}
            <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1E1E28]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7C7C8A]">Sessions ({sessions.length})</p>
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {sessions.map((s) => (
                  <button key={s.sessionId} onClick={() => viewConversation(s.sessionId)}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-[#1E1E28]/50 hover:bg-[#12121A] transition-colors",
                      selectedSessionId === s.sessionId && "bg-[#12121A] border-l-2 border-l-[#00E5B8]"
                    )}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono text-[#7C7C8A]">{s.sessionId.slice(0, 8)}...</span>
                      <span className="text-[9px] font-mono text-[#00E5B8]">{s.messages} msgs</span>
                    </div>
                    <p className="text-[10px] text-[#7C7C8A]">
                      {new Date(s.lastActivity).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {(s.images as number) > 0 && <span className="ml-1 text-purple-400">({s.images} img)</span>}
                    </p>
                  </button>
                ))}
                {sessions.length === 0 && <p className="text-xs text-[#7C7C8A] p-4">No conversations yet</p>}
              </div>
            </div>

            {/* Chat view */}
            <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1E1E28]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7C7C8A]">
                  {selectedChat ? `Conversation - ${selectedSessionId.slice(0, 8)}` : "Select a session"}
                </p>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
                {selectedChat ? selectedChat.map((m, i) => (
                  <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed",
                      m.role === "user"
                        ? "bg-[#00E5B8]/10 text-white rounded-br-sm"
                        : "bg-[#12121A] text-[#E0E0E5] rounded-bl-sm"
                    )}>
                      {m.hasImage ? <span className="text-purple-400 text-[9px] block mb-1">[Screenshot attached]</span> : null}
                      <div className="whitespace-pre-wrap">{m.content}</div>
                      <span className="text-[8px] text-[#7C7C8A] block mt-1">
                        {new Date(m.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-[#7C7C8A] text-center py-8">Click a session to view the conversation</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Push Alert */}
        {tab === "push-alert" && !loading && (
          <div className="space-y-4">
            {/* Crisis Mode Master Switch */}
            <div className={cn(
              "border rounded-xl p-4 transition-all duration-300",
              crisisMode
                ? "bg-red-500/10 border-red-500/40 shadow-[0_0_30px_rgba(255,71,87,0.1)]"
                : "bg-[#0C0C10] border-[#1E1E28]"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn("w-3 h-3 rounded-full transition-colors", crisisMode ? "bg-red-500 animate-pulse" : "bg-[#2E2E3A]")} />
                  <div>
                    <p className="text-sm font-bold text-white">Crisis Mode</p>
                    <p className="text-[10px] text-[#7C7C8A]">
                      {crisisMode ? "ACTIVE — Red theme, interception map, siren enabled" : "Inactive — Normal dashboard state"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => toggleCrisisMode(!crisisMode)}
                  disabled={crisisLoading}
                  className={cn(
                    "relative w-14 h-7 rounded-full transition-all duration-300 cursor-pointer",
                    crisisMode ? "bg-red-500" : "bg-[#2E2E3A]",
                    crisisLoading && "opacity-50"
                  )}
                >
                  <div className={cn(
                    "absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300",
                    crisisMode ? "left-7" : "left-0.5"
                  )} />
                </button>
              </div>
              {crisisMode && (
                <p className="text-[9px] text-red-400 font-mono mt-2">
                  Dashboard is in crisis mode. All users see red theme, missile interception map, and receive siren alerts. Send &quot;All Clear&quot; to deactivate.
                </p>
              )}
            </div>

            {/* Quick Templates */}
            <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#7C7C8A] mb-3">Quick Templates (One-Click Send)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  {
                    label: "Missile Threat", color: "border-red-500/50 bg-red-500/5 hover:bg-red-500/15",
                    data: {
                      severity: "critical", category: "THREAT",
                      title: "Due to the current situation, potential missile threats, immediately seek a safe place in the closest secure building, steer away from windows, doors, and open areas. Await further instructions. (MOI)",
                      titleAr: "\u0646\u0638\u0631\u0627 \u0644\u0644\u0623\u0648\u0636\u0627\u0639 \u0627\u0644\u0631\u0627\u0647\u0646\u0629 \u062a\u0647\u062f\u064a\u062f \u0635\u0627\u0631\u0648\u062e\u064a \u0645\u062d\u062a\u0645\u0644\u060c \u064a\u0631\u062c\u0649 \u0627\u0644\u0627\u062d\u062a\u0645\u0627\u0621 \u0641\u0648\u0631\u0627 \u0641\u064a \u0645\u0628\u0646\u0649 \u0622\u0645\u0646 \u0628\u0639\u064a\u062f\u0627 \u0639\u0646 \u0627\u0644\u0646\u0648\u0627\u0641\u0630 \u0648\u0627\u0644\u0623\u0628\u0648\u0627\u0628 \u0648\u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u0645\u0641\u062a\u0648\u062d\u0629 \u0648\u0627\u0646\u062a\u0638\u0631 \u0627\u0644\u062a\u0639\u0644\u064a\u0645\u0627\u062a \u0627\u0644\u0631\u0633\u0645\u064a\u0629 (\u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u062f\u0627\u062e\u0644\u064a\u0629)",
                      description: "Emergency alert issued by MOI. Seek immediate shelter.",
                      descriptionAr: "\u062a\u0646\u0628\u064a\u0647 \u0637\u0648\u0627\u0631\u0626 \u0635\u0627\u062f\u0631 \u0639\u0646 \u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u062f\u0627\u062e\u0644\u064a\u0629. \u0627\u0628\u062d\u062b \u0639\u0646 \u0645\u0623\u0648\u0649 \u0641\u0648\u0631\u064a.",
                      regions: "UAE", expiresInHours: 1,
                    },
                  },
                  {
                    label: "All Clear", color: "border-green-500/50 bg-green-500/5 hover:bg-green-500/15",
                    data: {
                      severity: "medium", category: "GENERAL",
                      title: "Thank you for your cooperation. We reassure you that the situation is currently safe. You may resume your normal activities while continuing to remain cautious and take the necessary precautions, and to follow official instructions. (MOI)",
                      titleAr: "\u0634\u0643\u0631\u0627\u064b \u0644\u062a\u0639\u0627\u0648\u0646\u0643\u0645\u060c \u0648\u0646\u0637\u0645\u0626\u0646\u0643\u0645 \u0628\u0623\u0646 \u0627\u0644\u0648\u0636\u0639 \u0622\u0645\u0646 \u062d\u0627\u0644\u064a\u0627\u064b\u060c \u0648\u064a\u0645\u0643\u0646\u0643\u0645 \u0627\u0633\u062a\u0626\u0646\u0627\u0641 \u0623\u0646\u0634\u0637\u062a\u0643\u0645 \u0627\u0644\u0645\u0639\u062a\u0627\u062f\u0629 \u0645\u0639 \u0636\u0631\u0648\u0631\u0629 \u0623\u062e\u0630 \u0627\u0644\u062d\u064a\u0637\u0629 \u0648\u0627\u0644\u062d\u0630\u0631 \u0648\u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u0645\u0633\u062a\u062c\u062f\u0627\u062a. (\u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u062f\u0627\u062e\u0644\u064a\u0629)",
                      description: "Situation resolved. Resume normal activities with caution.",
                      descriptionAr: "\u062a\u0645 \u062d\u0644 \u0627\u0644\u0645\u0648\u0642\u0641. \u0627\u0633\u062a\u0623\u0646\u0641 \u0623\u0646\u0634\u0637\u062a\u0643 \u0627\u0644\u0639\u0627\u062f\u064a\u0629 \u0645\u0639 \u0627\u0644\u062d\u0630\u0631.",
                      regions: "UAE", expiresInHours: 6,
                    },
                  },
                  {
                    label: "Drone Threat", color: "border-orange-500/50 bg-orange-500/5 hover:bg-orange-500/15",
                    data: {
                      severity: "critical", category: "THREAT",
                      title: "Hostile drone activity detected. Seek immediate shelter in a reinforced building. Stay away from open areas and rooftops. Follow Civil Defense instructions. (MOI)",
                      titleAr: "\u062a\u0645 \u0631\u0635\u062f \u0646\u0634\u0627\u0637 \u0637\u0627\u0626\u0631\u0627\u062a \u0645\u0633\u064a\u0631\u0629 \u0645\u0639\u0627\u062f\u064a\u0629. \u0627\u0628\u062d\u062b \u0639\u0646 \u0645\u0623\u0648\u0649 \u0641\u0648\u0631\u064a \u0641\u064a \u0645\u0628\u0646\u0649 \u0645\u062d\u0635\u0646. \u0627\u0628\u062a\u0639\u062f \u0639\u0646 \u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u0645\u0641\u062a\u0648\u062d\u0629 \u0648\u0627\u0644\u0623\u0633\u0637\u062d. \u0627\u062a\u0628\u0639 \u062a\u0639\u0644\u064a\u0645\u0627\u062a \u0627\u0644\u062f\u0641\u0627\u0639 \u0627\u0644\u0645\u062f\u0646\u064a. (\u0648\u0632\u0627\u0631\u0629 \u0627\u0644\u062f\u0627\u062e\u0644\u064a\u0629)",
                      description: "Drone threat alert. Take cover immediately.",
                      descriptionAr: "\u062a\u0646\u0628\u064a\u0647 \u062a\u0647\u062f\u064a\u062f \u0637\u0627\u0626\u0631\u0627\u062a \u0645\u0633\u064a\u0631\u0629. \u0627\u062d\u062a\u0645\u0650 \u0641\u0648\u0631\u0627\u064b.",
                      regions: "UAE", expiresInHours: 1,
                    },
                  },
                  {
                    label: "Weather Emergency", color: "border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/15",
                    data: {
                      severity: "high", category: "WEATHER",
                      title: "Severe weather warning: Heavy rainfall and thunderstorms expected. Avoid low-lying areas and wadis. Do not drive through flooded roads. Follow NCEMA instructions.",
                      titleAr: "\u062a\u062d\u0630\u064a\u0631 \u0637\u0642\u0633 \u0634\u062f\u064a\u062f: \u064a\u062a\u0648\u0642\u0639 \u0647\u0637\u0648\u0644 \u0623\u0645\u0637\u0627\u0631 \u063a\u0632\u064a\u0631\u0629 \u0648\u0639\u0648\u0627\u0635\u0641 \u0631\u0639\u062f\u064a\u0629. \u062a\u062c\u0646\u0628 \u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u0645\u0646\u062e\u0641\u0636\u0629 \u0648\u0627\u0644\u0623\u0648\u062f\u064a\u0629. \u0644\u0627 \u062a\u0642\u062f \u0639\u0628\u0631 \u0627\u0644\u0637\u0631\u0642 \u0627\u0644\u0645\u063a\u0645\u0648\u0631\u0629. \u0627\u062a\u0628\u0639 \u062a\u0639\u0644\u064a\u0645\u0627\u062a \u0627\u0644\u0647\u064a\u0626\u0629 \u0627\u0644\u0648\u0637\u0646\u064a\u0629 \u0644\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0637\u0648\u0627\u0631\u0626.",
                      description: "Severe weather alert for UAE regions.",
                      descriptionAr: "\u062a\u0646\u0628\u064a\u0647 \u0637\u0642\u0633 \u0634\u062f\u064a\u062f \u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a.",
                      regions: "UAE", expiresInHours: 12,
                    },
                  },
                ].map((tpl) => (
                  <button key={tpl.label}
                    onClick={async () => {
                      setAlertSent("");
                      setLoading(true);
                      try {
                        const res = await fetch("/api/admin/alert", {
                          method: "POST",
                          headers: { "Content-Type": "application/json", "x-admin-key": key },
                          body: JSON.stringify(tpl.data),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || "Failed");
                        setAlertSent(`"${tpl.label}" pushed! (${data.alertCount} active)`);
                        // Auto-toggle crisis mode based on template type
                        if (tpl.label === "Missile Threat" || tpl.label === "Drone Threat") {
                          await toggleCrisisMode(true);
                        } else if (tpl.label === "All Clear") {
                          await toggleCrisisMode(false);
                        }
                        // Refresh alerts list
                        fetch("/api/admin/alert", { headers: { "x-admin-key": key } })
                          .then((r) => r.json()).then((d) => setAllAlerts(d.alerts || [])).catch(() => {});
                      } catch (err: any) {
                        setError(err.message || "Failed");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className={cn("text-left p-3 rounded-lg border transition-all", tpl.color)}>
                    <p className="text-xs font-bold text-white mb-1">{tpl.label}</p>
                    <p className="text-[9px] text-[#7C7C8A] line-clamp-2">{tpl.data.title}</p>
                    <p className="text-[8px] text-[#7C7C8A]/60 mt-1 font-mono" dir="rtl">{tpl.data.titleAr.slice(0, 60)}...</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Alert Form */}
            <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7C7C8A]">Custom Alert</p>
                <button onClick={() => setAlertLang(alertLang === "en" ? "ar" : "en")}
                  className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#12121A] border border-[#1E1E28] text-[10px] font-bold">
                  <span className={alertLang === "en" ? "text-[#00E5B8]" : "text-[#7C7C8A]"}>EN</span>
                  <span className="text-[#7C7C8A]">/</span>
                  <span className={alertLang === "ar" ? "text-[#00E5B8]" : "text-[#7C7C8A]"}>AR</span>
                </button>
              </div>

              {alertSent && (
                <div className="bg-[#00E5B8]/10 border border-[#00E5B8]/30 rounded-lg px-3 py-2 text-xs text-[#00E5B8]">
                  {alertSent}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Severity</label>
                  <select value={alertForm.severity}
                    onChange={(e) => setAlertForm((f) => ({ ...f, severity: e.target.value }))}
                    className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#00E5B8]/40">
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Category</label>
                  <select value={alertForm.category}
                    onChange={(e) => setAlertForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#00E5B8]/40">
                    <option value="THREAT">Threat</option>
                    <option value="WEATHER">Weather</option>
                    <option value="SEISMIC">Seismic</option>
                    <option value="AVIATION">Aviation</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>
              </div>

              {/* English fields */}
              <div className={alertLang === "ar" ? "hidden" : ""}>
                <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Title (English)</label>
                <input type="text" value={alertForm.title}
                  onChange={(e) => setAlertForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Missile threat detected near Abu Dhabi"
                  className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40" />
              </div>
              <div className={alertLang === "ar" ? "hidden" : ""}>
                <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Description (English)</label>
                <textarea value={alertForm.description}
                  onChange={(e) => setAlertForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Details about the alert..."
                  rows={2}
                  className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40 resize-none" />
              </div>

              {/* Arabic fields */}
              <div className={alertLang === "en" ? "hidden" : ""}>
                <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Title (Arabic)</label>
                <input type="text" value={alertForm.titleAr} dir="rtl"
                  onChange={(e) => setAlertForm((f) => ({ ...f, titleAr: e.target.value }))}
                  placeholder="\u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0628\u0627\u0644\u0639\u0631\u0628\u064a\u0629"
                  className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40 text-right" />
              </div>
              <div className={alertLang === "en" ? "hidden" : ""}>
                <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Description (Arabic)</label>
                <textarea value={alertForm.descriptionAr} dir="rtl"
                  onChange={(e) => setAlertForm((f) => ({ ...f, descriptionAr: e.target.value }))}
                  placeholder="\u062a\u0641\u0627\u0635\u064a\u0644 \u0627\u0644\u062a\u0646\u0628\u064a\u0647..."
                  rows={2}
                  className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40 resize-none text-right" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Regions</label>
                  <input type="text" value={alertForm.regions}
                    onChange={(e) => setAlertForm((f) => ({ ...f, regions: e.target.value }))}
                    placeholder="UAE, Abu Dhabi, Dubai"
                    className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40" />
                </div>
                <div>
                  <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Expires In (hours)</label>
                  <input type="number" value={alertForm.expiresInHours}
                    onChange={(e) => setAlertForm((f) => ({ ...f, expiresInHours: Number(e.target.value) || 1 }))}
                    className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#00E5B8]/40" />
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!alertForm.title) return;
                  setAlertSent("");
                  setLoading(true);
                  try {
                    const res = await fetch("/api/admin/alert", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", "x-admin-key": key },
                      body: JSON.stringify(alertForm),
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || "Failed");
                    setAlertSent(`Alert pushed! ID: ${data.id} (${data.alertCount} active)`);
                    setAlertForm((f) => ({ ...f, title: "", titleAr: "", description: "", descriptionAr: "" }));
                    fetch("/api/admin/alert", { headers: { "x-admin-key": key } })
                      .then((r) => r.json()).then((d) => setAllAlerts(d.alerts || [])).catch(() => {});
                  } catch (err: any) {
                    setError(err.message || "Failed to push alert");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={!alertForm.title || loading}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50">
                {loading ? "Pushing..." : "Push Alert Now"}
              </button>
            </div>

            {/* Alert Management Table */}
            <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-[#1E1E28] flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7C7C8A]">All Alerts ({allAlerts.length})</p>
                <div className="flex gap-2 text-[9px] font-mono">
                  <span className="text-green-400">{allAlerts.filter((a) => a.active).length} active</span>
                  <span className="text-[#7C7C8A]">{allAlerts.filter((a) => !a.active).length} archived</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead>
                    <tr className="border-b border-[#1E1E28] text-[#7C7C8A] uppercase tracking-wider">
                      <th className="text-left px-3 py-2 font-bold">Status</th>
                      <th className="text-left px-3 py-2 font-bold">Severity</th>
                      <th className="text-left px-3 py-2 font-bold">Title</th>
                      <th className="text-left px-3 py-2 font-bold">Issued</th>
                      <th className="text-left px-3 py-2 font-bold">Expires</th>
                      <th className="text-left px-3 py-2 font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allAlerts.map((alert) => {
                      const isExpired = alert.expiresAt && new Date(alert.expiresAt) < new Date();
                      return (
                        <tr key={alert.id} className={cn("border-b border-[#1E1E28]/30 hover:bg-[#12121A] transition-colors", !alert.active && "opacity-50")}>
                          <td className="px-3 py-2">
                            <span className={cn("inline-block w-2 h-2 rounded-full", alert.active ? (isExpired ? "bg-amber" : "bg-green-400") : "bg-[#7C7C8A]")} />
                          </td>
                          <td className="px-3 py-2">
                            <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                              alert.severity === "critical" ? "bg-red-500/20 text-red-400" :
                              alert.severity === "high" ? "bg-orange-500/20 text-orange-400" :
                              alert.severity === "medium" ? "bg-amber/20 text-amber" : "bg-green-500/20 text-green-400"
                            )}>{alert.severity}</span>
                          </td>
                          <td className="px-3 py-2 max-w-xs">
                            <p className="text-white truncate">{alert.title}</p>
                            {alert.titleAr && <p className="text-[#7C7C8A] truncate text-[8px] mt-0.5" dir="rtl">{alert.titleAr}</p>}
                          </td>
                          <td className="px-3 py-2 text-[#7C7C8A] font-mono whitespace-nowrap">
                            {alert.issuedAt ? new Date(alert.issuedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                          </td>
                          <td className="px-3 py-2 font-mono whitespace-nowrap">
                            <span className={isExpired ? "text-red-400" : "text-[#7C7C8A]"}>
                              {alert.expiresAt ? new Date(alert.expiresAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={async () => {
                                try {
                                  await fetch("/api/admin/alert", {
                                    method: "PATCH",
                                    headers: { "Content-Type": "application/json", "x-admin-key": key },
                                    body: JSON.stringify({ id: alert.id, active: !alert.active }),
                                  });
                                  setAllAlerts((prev) => prev.map((a) => a.id === alert.id ? { ...a, active: !a.active } : a));
                                } catch { setError("Failed to update alert"); }
                              }}
                              className={cn("px-2 py-1 rounded text-[8px] font-bold uppercase transition-colors",
                                alert.active ? "bg-[#7C7C8A]/20 text-[#7C7C8A] hover:bg-red-500/20 hover:text-red-400" : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                              )}>
                              {alert.active ? "Archive" : "Restore"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {allAlerts.length === 0 && (
                      <tr><td colSpan={6} className="px-4 py-6 text-center text-[#7C7C8A]">No alerts yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* AI Config */}
        {tab === "ai-config" && aiConfig && !loading && (
          <div className="max-w-2xl space-y-4">
            <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-[#7C7C8A]">AI Advisory Configuration</p>
                {aiConfigSaved && <span className="text-xs text-[#00E5B8]">{aiConfigSaved}</span>}
              </div>

              <div>
                <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Personality</label>
                <select value={aiConfig.personality}
                  onChange={(e) => setAiConfig((c) => c ? { ...c, personality: e.target.value } : c)}
                  className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#00E5B8]/40">
                  <option value="advisor">Trusted Advisor (calm, authoritative)</option>
                  <option value="friend">Friendly Expert (warm, conversational)</option>
                  <option value="military">Military Briefing (concise, factual)</option>
                  <option value="journalist">Journalist (neutral, fact-driven)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Response Length</label>
                <select value={aiConfig.maxResponseLength}
                  onChange={(e) => setAiConfig((c) => c ? { ...c, maxResponseLength: e.target.value } : c)}
                  className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#00E5B8]/40">
                  <option value="short">Short (2-3 paragraphs, quick answers)</option>
                  <option value="medium">Medium (3-5 paragraphs, balanced detail)</option>
                  <option value="detailed">Detailed (5+ paragraphs, comprehensive)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Tone & Voice</label>
                <textarea value={aiConfig.tone}
                  onChange={(e) => setAiConfig((c) => c ? { ...c, tone: e.target.value } : c)}
                  rows={2}
                  placeholder="Describe the tone: warm, professional, calm..."
                  className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40 resize-none" />
              </div>

              <div>
                <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Response Style Instructions</label>
                <textarea value={aiConfig.responseStyle}
                  onChange={(e) => setAiConfig((c) => c ? { ...c, responseStyle: e.target.value } : c)}
                  rows={3}
                  placeholder="How should it structure responses?"
                  className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40 resize-none" />
              </div>

              <div>
                <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Custom Rules (one per line)</label>
                <textarea value={aiConfig.customRules}
                  onChange={(e) => setAiConfig((c) => c ? { ...c, customRules: e.target.value } : c)}
                  rows={4}
                  placeholder="If someone is scared, acknowledge that FIRST&#10;Never repeat yourself&#10;For emergencies: Police 999"
                  className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40 resize-none font-mono text-xs" />
              </div>

              <div>
                <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Content Filters (topics/words to avoid)</label>
                <textarea value={aiConfig.filters}
                  onChange={(e) => setAiConfig((c) => c ? { ...c, filters: e.target.value } : c)}
                  rows={2}
                  placeholder="No profanity. No speculation about military ops."
                  className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40 resize-none" />
              </div>

              <div>
                <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Banned Topics (comma-separated)</label>
                <input type="text" value={aiConfig.bannedTopics}
                  onChange={(e) => setAiConfig((c) => c ? { ...c, bannedTopics: e.target.value } : c)}
                  placeholder="Politics, religion, personal opinions"
                  className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40" />
              </div>

              <div>
                <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Sign-off Line (appended to serious advisories)</label>
                <input type="text" value={aiConfig.signOff}
                  onChange={(e) => setAiConfig((c) => c ? { ...c, signOff: e.target.value } : c)}
                  placeholder="Stay safe. Follow official MOI/NCEMA updates."
                  className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40" />
              </div>

              <button
                onClick={async () => {
                  setAiConfigSaved("");
                  setLoading(true);
                  try {
                    const res = await fetch("/api/admin/ai-config", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", "x-admin-key": key },
                      body: JSON.stringify(aiConfig),
                    });
                    if (!res.ok) throw new Error("Failed");
                    setAiConfigSaved("Config saved! Changes apply to new conversations immediately.");
                  } catch {
                    setError("Failed to save AI config");
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="w-full bg-[#00E5B8] hover:bg-[#00E5B8]/90 text-[#050507] font-bold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50">
                {loading ? "Saving..." : "Save AI Configuration"}
              </button>

              <p className="text-[9px] text-[#7C7C8A] text-center">
                Changes take effect immediately for all new chat conversations.
              </p>
            </div>
          </div>
        )}

        {/* Popular Queries */}
        {tab === "queries" && !loading && (
          <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-[#1E1E28]">
              <p className="text-xs font-bold uppercase tracking-wider text-[#7C7C8A]">Most Asked Questions</p>
            </div>
            <div className="divide-y divide-[#1E1E28]/50">
              {queries.map((q, i) => (
                <div key={i} className="px-4 py-3 flex items-center gap-3">
                  <span className="text-sm font-bold font-mono text-[#7C7C8A] w-6 text-right">{i + 1}</span>
                  <span className="text-xs text-white flex-1">{q.query}</span>
                  <span className="text-xs font-mono text-[#00E5B8] shrink-0">{q.count}x</span>
                </div>
              ))}
              {queries.length === 0 && <p className="text-xs text-[#7C7C8A] p-4">No queries yet</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
