"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface PushAlertPanelProps {
  adminKey: string;
  crisisMode: boolean;
  crisisLoading: boolean;
  toggleCrisisMode: (active: boolean) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
  error: string;
  setError: (e: string) => void;
}

const templates = [
  {
    label: "Missile Threat", color: "border-red-500/50 bg-red-500/5 hover:bg-red-500/15", dot: "bg-red-500",
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
    label: "All Clear", color: "border-green-500/50 bg-green-500/5 hover:bg-green-500/15", dot: "bg-green-500",
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
    label: "Drone Threat", color: "border-orange-500/50 bg-orange-500/5 hover:bg-orange-500/15", dot: "bg-orange-500",
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
    label: "Weather Emergency", color: "border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/15", dot: "bg-blue-500",
    data: {
      severity: "high", category: "WEATHER",
      title: "Severe weather warning: Heavy rainfall and thunderstorms expected. Avoid low-lying areas and wadis. Do not drive through flooded roads. Follow NCEMA instructions.",
      titleAr: "\u062a\u062d\u0630\u064a\u0631 \u0637\u0642\u0633 \u0634\u062f\u064a\u062f: \u064a\u062a\u0648\u0642\u0639 \u0647\u0637\u0648\u0644 \u0623\u0645\u0637\u0627\u0631 \u063a\u0632\u064a\u0631\u0629 \u0648\u0639\u0648\u0627\u0635\u0641 \u0631\u0639\u062f\u064a\u0629. \u062a\u062c\u0646\u0628 \u0627\u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u0645\u0646\u062e\u0641\u0636\u0629 \u0648\u0627\u0644\u0623\u0648\u062f\u064a\u0629. \u0644\u0627 \u062a\u0642\u062f \u0639\u0628\u0631 \u0627\u0644\u0637\u0631\u0642 \u0627\u0644\u0645\u063a\u0645\u0648\u0631\u0629. \u0627\u062a\u0628\u0639 \u062a\u0639\u0644\u064a\u0645\u0627\u062a \u0627\u0644\u0647\u064a\u0626\u0629 \u0627\u0644\u0648\u0637\u0646\u064a\u0629 \u0644\u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0637\u0648\u0627\u0631\u0626.",
      description: "Severe weather alert for UAE regions.",
      descriptionAr: "\u062a\u0646\u0628\u064a\u0647 \u0637\u0642\u0633 \u0634\u062f\u064a\u062f \u0644\u0645\u0646\u0627\u0637\u0642 \u0627\u0644\u0625\u0645\u0627\u0631\u0627\u062a.",
      regions: "UAE", expiresInHours: 12,
    },
  },
];

export default function PushAlertPanel({
  adminKey, crisisMode, crisisLoading, toggleCrisisMode, loading, setLoading, error, setError,
}: PushAlertPanelProps) {
  const [alertForm, setAlertForm] = useState({ severity: "critical", category: "THREAT", title: "", titleAr: "", description: "", descriptionAr: "", regions: "UAE", expiresInHours: 1 });
  const [alertSent, setAlertSent] = useState("");
  const [allAlerts, setAllAlerts] = useState<any[]>([]);
  const [alertLang, setAlertLang] = useState<"en" | "ar">("en");
  const [alertsLoaded, setAlertsLoaded] = useState(false);

  // Load alerts on first render
  if (!alertsLoaded) {
    setAlertsLoaded(true);
    fetch("/api/admin/alert", { headers: { "x-admin-key": adminKey } })
      .then((r) => r.json())
      .then((d) => setAllAlerts(d.alerts || []))
      .catch(() => {});
  }

  const sendTemplate = async (tpl: typeof templates[0]) => {
    setAlertSent("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/alert", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
        body: JSON.stringify(tpl.data),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setAlertSent(`"${tpl.label}" pushed! (${data.alertCount} active)`);
      if (tpl.label === "Missile Threat" || tpl.label === "Drone Threat") {
        await toggleCrisisMode(true);
      } else if (tpl.label === "All Clear") {
        await toggleCrisisMode(false);
      }
      fetch("/api/admin/alert", { headers: { "x-admin-key": adminKey } })
        .then((r) => r.json()).then((d) => setAllAlerts(d.alerts || [])).catch(() => {});
    } catch (err: any) {
      setError(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Crisis Mode Switch */}
      <div className={cn(
        "border rounded-xl p-5 transition-all duration-300",
        crisisMode
          ? "bg-red-500/10 border-red-500/40 shadow-[0_0_30px_rgba(255,71,87,0.1)]"
          : "bg-[#0C0C10] border-[#1E1E28]"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-4 h-4 rounded-full transition-colors", crisisMode ? "bg-red-500 animate-pulse" : "bg-[#2E2E3A]")} />
            <div>
              <p className="text-sm font-bold text-white">Crisis Mode Master Switch</p>
              <p className="text-[10px] text-[#7C7C8A]">
                {crisisMode ? "ACTIVE — Red theme, interception map, siren enabled across all users" : "Inactive — Normal dashboard state for all users"}
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
          <p className="text-[9px] text-red-400 font-mono mt-3 bg-red-500/5 rounded-lg px-3 py-2 border border-red-500/10">
            Dashboard is in crisis mode. All users see red theme, missile interception map, and receive siren alerts. Send &quot;All Clear&quot; to deactivate.
          </p>
        )}
      </div>

      {/* Quick Templates */}
      <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7C8A] mb-4">Quick Templates — One Click Send</p>
        {alertSent && (
          <div className="bg-[#00E5B8]/10 border border-[#00E5B8]/30 rounded-lg px-3 py-2 text-xs text-[#00E5B8] mb-4">
            {alertSent}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map((tpl) => (
            <button
              key={tpl.label}
              onClick={() => sendTemplate(tpl)}
              disabled={loading}
              className={cn("text-left p-4 rounded-xl border transition-all group", tpl.color, loading && "opacity-50")}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-2 h-2 rounded-full", tpl.dot)} />
                <p className="text-xs font-bold text-white">{tpl.label}</p>
              </div>
              <p className="text-[9px] text-[#7C7C8A] line-clamp-2">{tpl.data.title}</p>
              <p className="text-[8px] text-[#7C7C8A]/50 mt-1.5 font-mono" dir="rtl">{tpl.data.titleAr.slice(0, 60)}...</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Alert Form */}
      <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7C8A]">Custom Alert</p>
          <button onClick={() => setAlertLang(alertLang === "en" ? "ar" : "en")}
            className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#12121A] border border-[#1E1E28] text-[10px] font-bold">
            <span className={alertLang === "en" ? "text-[#00E5B8]" : "text-[#7C7C8A]"}>EN</span>
            <span className="text-[#7C7C8A]">/</span>
            <span className={alertLang === "ar" ? "text-[#00E5B8]" : "text-[#7C7C8A]"}>AR</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Severity</label>
            <select value={alertForm.severity} onChange={(e) => setAlertForm((f) => ({ ...f, severity: e.target.value }))}
              className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#00E5B8]/40">
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Category</label>
            <select value={alertForm.category} onChange={(e) => setAlertForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#00E5B8]/40">
              <option value="THREAT">Threat</option>
              <option value="WEATHER">Weather</option>
              <option value="SEISMIC">Seismic</option>
              <option value="AVIATION">Aviation</option>
              <option value="GENERAL">General</option>
            </select>
          </div>
        </div>

        <div className={alertLang === "ar" ? "hidden" : ""}>
          <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Title (English)</label>
          <input type="text" value={alertForm.title} onChange={(e) => setAlertForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Missile threat detected near Abu Dhabi"
            className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40" />
        </div>
        <div className={alertLang === "ar" ? "hidden" : ""}>
          <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Description (English)</label>
          <textarea value={alertForm.description} onChange={(e) => setAlertForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Details about the alert..." rows={2}
            className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40 resize-none" />
        </div>

        <div className={alertLang === "en" ? "hidden" : ""}>
          <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Title (Arabic)</label>
          <input type="text" value={alertForm.titleAr} dir="rtl" onChange={(e) => setAlertForm((f) => ({ ...f, titleAr: e.target.value }))}
            placeholder="العنوان بالعربية"
            className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40 text-right" />
        </div>
        <div className={alertLang === "en" ? "hidden" : ""}>
          <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Description (Arabic)</label>
          <textarea value={alertForm.descriptionAr} dir="rtl" onChange={(e) => setAlertForm((f) => ({ ...f, descriptionAr: e.target.value }))}
            placeholder="تفاصيل التنبيه..." rows={2}
            className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40 resize-none text-right" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Regions</label>
            <input type="text" value={alertForm.regions} onChange={(e) => setAlertForm((f) => ({ ...f, regions: e.target.value }))}
              placeholder="UAE, Abu Dhabi, Dubai"
              className="w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40" />
          </div>
          <div>
            <label className="text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1">Expires In (hours)</label>
            <input type="number" value={alertForm.expiresInHours} onChange={(e) => setAlertForm((f) => ({ ...f, expiresInHours: Number(e.target.value) || 1 }))}
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
                headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
                body: JSON.stringify(alertForm),
              });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Failed");
              setAlertSent(`Alert pushed! ID: ${data.id} (${data.alertCount} active)`);
              setAlertForm((f) => ({ ...f, title: "", titleAr: "", description: "", descriptionAr: "" }));
              fetch("/api/admin/alert", { headers: { "x-admin-key": adminKey } })
                .then((r) => r.json()).then((d) => setAllAlerts(d.alerts || [])).catch(() => {});
            } catch (err: any) {
              setError(err.message || "Failed to push alert");
            } finally {
              setLoading(false);
            }
          }}
          disabled={!alertForm.title || loading}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Pushing..." : "Push Alert Now"}
        </button>
      </div>

      {/* Alert Management Table */}
      <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1E1E28] flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7C7C8A]">All Alerts ({allAlerts.length})</p>
          <div className="flex gap-3 text-[9px] font-mono">
            <span className="text-green-400">{allAlerts.filter((a) => a.active).length} active</span>
            <span className="text-[#7C7C8A]">{allAlerts.filter((a) => !a.active).length} archived</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[10px]">
            <thead>
              <tr className="border-b border-[#1E1E28] text-[#7C7C8A] uppercase tracking-wider">
                <th className="text-left px-3 py-2.5 font-bold">Status</th>
                <th className="text-left px-3 py-2.5 font-bold">Severity</th>
                <th className="text-left px-3 py-2.5 font-bold">Title</th>
                <th className="text-left px-3 py-2.5 font-bold">Issued</th>
                <th className="text-left px-3 py-2.5 font-bold">Expires</th>
                <th className="text-left px-3 py-2.5 font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {allAlerts.map((alert) => {
                const isExpired = alert.expiresAt && new Date(alert.expiresAt) < new Date();
                return (
                  <tr key={alert.id} className={cn("border-b border-[#1E1E28]/30 hover:bg-[#12121A] transition-colors", !alert.active && "opacity-40")}>
                    <td className="px-3 py-2.5">
                      <span className={cn("inline-block w-2 h-2 rounded-full", alert.active ? (isExpired ? "bg-amber" : "bg-green-400") : "bg-[#7C7C8A]")} />
                    </td>
                    <td className="px-3 py-2.5">
                      <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase",
                        alert.severity === "critical" ? "bg-red-500/20 text-red-400" :
                        alert.severity === "high" ? "bg-orange-500/20 text-orange-400" :
                        alert.severity === "medium" ? "bg-amber/20 text-amber" : "bg-green-500/20 text-green-400"
                      )}>{alert.severity}</span>
                    </td>
                    <td className="px-3 py-2.5 max-w-xs">
                      <p className="text-white truncate">{alert.title}</p>
                      {alert.titleAr && <p className="text-[#7C7C8A] truncate text-[8px] mt-0.5" dir="rtl">{alert.titleAr}</p>}
                    </td>
                    <td className="px-3 py-2.5 text-[#7C7C8A] font-mono whitespace-nowrap">
                      {alert.issuedAt ? new Date(alert.issuedAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                    </td>
                    <td className="px-3 py-2.5 font-mono whitespace-nowrap">
                      <span className={isExpired ? "text-red-400" : "text-[#7C7C8A]"}>
                        {alert.expiresAt ? new Date(alert.expiresAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={async () => {
                          try {
                            await fetch("/api/admin/alert", {
                              method: "PATCH",
                              headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
                              body: JSON.stringify({ id: alert.id, active: !alert.active }),
                            });
                            setAllAlerts((prev) => prev.map((a) => a.id === alert.id ? { ...a, active: !a.active } : a));
                          } catch { setError("Failed to update alert"); }
                        }}
                        className={cn("px-2 py-1 rounded text-[8px] font-bold uppercase transition-colors",
                          alert.active ? "bg-[#7C7C8A]/20 text-[#7C7C8A] hover:bg-red-500/20 hover:text-red-400" : "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        )}
                      >
                        {alert.active ? "Archive" : "Restore"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {allAlerts.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-[#7C7C8A]">No alerts yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
