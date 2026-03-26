"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import AdminSidebar from "./components/AdminSidebar";
import AdminHeader from "./components/AdminHeader";
import OverviewPanel from "./components/OverviewPanel";
import ConversationsPanel from "./components/ConversationsPanel";
import QueriesPanel from "./components/QueriesPanel";
import PushAlertPanel from "./components/PushAlertPanel";
import AIConfigPanel from "./components/AIConfigPanel";

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
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
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

  // Fetch crisis mode on auth
  useEffect(() => {
    if (!authenticated) return;
    fetch("/api/admin/crisis-mode")
      .then((r) => r.json())
      .then((d) => setCrisisMode(d.active === true))
      .catch(() => {});
  }, [authenticated]);

  // Fetch tab-specific data
  useEffect(() => {
    if (!authenticated) return;
    if (tab === "overview") fetchData("overview").then((d) => d && setOverview(d));
    if (tab === "conversations") fetchData("conversations").then((d) => d && setSessions(d.sessions || []));
    if (tab === "queries") fetchData("popular-queries").then((d) => d && setQueries(d.queries || []));
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

  // --- Login screen ---
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-white mb-1">
                <span className="text-[#00E5B8]">Aegis</span>UAE
              </h1>
              <p className="text-[10px] text-[#7C7C8A] uppercase tracking-widest">Admin Console</p>
            </div>
            {error && <p className="text-xs text-red-400 mb-3 text-center bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">{error}</p>}
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && login()}
              placeholder="Enter admin key"
              className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40 mb-4 transition-colors"
              autoFocus
            />
            <button
              onClick={login}
              disabled={!key || loading}
              className="w-full bg-[#00E5B8] hover:bg-[#00E5B8]/90 text-[#050507] font-bold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Access Console"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Dashboard with sidebar ---
  return (
    <div className="flex min-h-screen bg-[#050507] text-white">
      {/* Sidebar */}
      <AdminSidebar tab={tab} setTab={(t) => { setTab(t); setSelectedChat(null); }} crisisMode={crisisMode} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <AdminHeader
          tab={tab}
          crisisMode={crisisMode}
          crisisLoading={crisisLoading}
          toggleCrisisMode={toggleCrisisMode}
        />

        {/* Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {loading && <div className="text-center text-[#7C7C8A] text-sm py-8">Loading...</div>}
          {error && (
            <div className="text-center text-red-400 text-sm py-3 mb-4 bg-red-500/10 rounded-lg border border-red-500/20">
              {error}
              <button onClick={() => setError("")} className="ml-3 text-[#7C7C8A] hover:text-white text-xs">×</button>
            </div>
          )}

          {tab === "overview" && overview && !loading && (
            <OverviewPanel overview={overview} />
          )}

          {tab === "conversations" && !loading && (
            <ConversationsPanel
              sessions={sessions}
              selectedChat={selectedChat}
              selectedSessionId={selectedSessionId}
              onSelectSession={viewConversation}
            />
          )}

          {tab === "queries" && !loading && (
            <QueriesPanel queries={queries} />
          )}

          {tab === "push-alert" && !loading && (
            <PushAlertPanel
              adminKey={key}
              crisisMode={crisisMode}
              crisisLoading={crisisLoading}
              toggleCrisisMode={toggleCrisisMode}
              loading={loading}
              setLoading={setLoading}
              error={error}
              setError={setError}
            />
          )}

          {tab === "ai-config" && aiConfig && !loading && (
            <AIConfigPanel
              aiConfig={aiConfig}
              setAiConfig={setAiConfig}
              adminKey={key}
              loading={loading}
              setLoading={setLoading}
              setError={setError}
            />
          )}
        </main>
      </div>
    </div>
  );
}
