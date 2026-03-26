"use client";

import { useState } from "react";

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

interface AIConfigPanelProps {
  aiConfig: AIConfig;
  setAiConfig: (fn: (c: AIConfig | null) => AIConfig | null) => void;
  adminKey: string;
  loading: boolean;
  setLoading: (l: boolean) => void;
  setError: (e: string) => void;
}

const inputClass = "w-full bg-[#12121A] border border-[#1E1E28] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#7C7C8A] outline-none focus:border-[#00E5B8]/40 transition-colors";
const labelClass = "text-[10px] text-[#7C7C8A] uppercase tracking-wider block mb-1.5";

export default function AIConfigPanel({ aiConfig, setAiConfig, adminKey, loading, setLoading, setError }: AIConfigPanelProps) {
  const [saved, setSaved] = useState("");

  return (
    <div className="max-w-2xl space-y-5">
      <div className="bg-[#0C0C10] border border-[#1E1E28] rounded-xl p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-white">AI Advisory Configuration</p>
            <p className="text-[9px] text-[#7C7C8A]">Tune the chatbot personality, tone, and response behavior</p>
          </div>
          {saved && <span className="text-xs text-[#00E5B8] bg-[#00E5B8]/10 px-2 py-1 rounded">{saved}</span>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Personality</label>
            <select value={aiConfig.personality}
              onChange={(e) => setAiConfig((c) => c ? { ...c, personality: e.target.value } : c)}
              className={inputClass}>
              <option value="advisor">Trusted Advisor (calm, authoritative)</option>
              <option value="friend">Friendly Expert (warm, conversational)</option>
              <option value="military">Military Briefing (concise, factual)</option>
              <option value="journalist">Journalist (neutral, fact-driven)</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Response Length</label>
            <select value={aiConfig.maxResponseLength}
              onChange={(e) => setAiConfig((c) => c ? { ...c, maxResponseLength: e.target.value } : c)}
              className={inputClass}>
              <option value="short">Short (2-3 paragraphs)</option>
              <option value="medium">Medium (3-5 paragraphs)</option>
              <option value="detailed">Detailed (5+ paragraphs)</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Tone & Voice</label>
          <textarea value={aiConfig.tone}
            onChange={(e) => setAiConfig((c) => c ? { ...c, tone: e.target.value } : c)}
            rows={2} placeholder="Describe the tone: warm, professional, calm..."
            className={inputClass + " resize-none"} />
        </div>

        <div>
          <label className={labelClass}>Response Style Instructions</label>
          <textarea value={aiConfig.responseStyle}
            onChange={(e) => setAiConfig((c) => c ? { ...c, responseStyle: e.target.value } : c)}
            rows={3} placeholder="How should it structure responses?"
            className={inputClass + " resize-none"} />
        </div>

        <div>
          <label className={labelClass}>Custom Rules (one per line)</label>
          <textarea value={aiConfig.customRules}
            onChange={(e) => setAiConfig((c) => c ? { ...c, customRules: e.target.value } : c)}
            rows={4} placeholder={"If someone is scared, acknowledge that FIRST\nNever repeat yourself\nFor emergencies: Police 999"}
            className={inputClass + " resize-none font-mono text-xs"} />
        </div>

        <div>
          <label className={labelClass}>Content Filters</label>
          <textarea value={aiConfig.filters}
            onChange={(e) => setAiConfig((c) => c ? { ...c, filters: e.target.value } : c)}
            rows={2} placeholder="No profanity. No speculation about military ops."
            className={inputClass + " resize-none"} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Banned Topics (comma-separated)</label>
            <input type="text" value={aiConfig.bannedTopics}
              onChange={(e) => setAiConfig((c) => c ? { ...c, bannedTopics: e.target.value } : c)}
              placeholder="Politics, religion, personal opinions"
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Sign-off Line</label>
            <input type="text" value={aiConfig.signOff}
              onChange={(e) => setAiConfig((c) => c ? { ...c, signOff: e.target.value } : c)}
              placeholder="Stay safe. Follow official MOI/NCEMA updates."
              className={inputClass} />
          </div>
        </div>

        <button
          onClick={async () => {
            setSaved("");
            setLoading(true);
            try {
              const res = await fetch("/api/admin/ai-config", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-admin-key": adminKey },
                body: JSON.stringify(aiConfig),
              });
              if (!res.ok) throw new Error("Failed");
              setSaved("Saved! Changes apply immediately.");
            } catch {
              setError("Failed to save AI config");
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading}
          className="w-full bg-[#00E5B8] hover:bg-[#00E5B8]/90 text-[#050507] font-bold text-sm py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save AI Configuration"}
        </button>

        <p className="text-[9px] text-[#7C7C8A] text-center">Changes take effect immediately for all new conversations.</p>
      </div>
    </div>
  );
}
