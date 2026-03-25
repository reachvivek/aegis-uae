"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatTimeAgo } from "@/lib/utils";
import {
  GlobeIcon, ClockIcon, WarningIcon, ArrowSquareOutIcon,
  ChatsIcon, FlagIcon, TrendUpIcon, TrendDownIcon,
} from "@phosphor-icons/react";
import { useIntel } from "@/hooks/useIntel";

type Sentiment = "escalation" | "de-escalation" | "neutral";

interface Development {
  id: string;
  timestamp: string;
  headline: string;
  detail: string;
  source: string;
  parties: string[];
  sentiment: Sentiment;
  impactOnUAE: string;
  prediction?: string;
}

const fallbackDevelopments: Development[] = [
  {
    id: "d1", timestamp: "2026-03-25T12:30:00Z",
    headline: "Trump: 'Severe consequences' if Iran targets Gulf shipping lanes",
    detail: "US President warns of military response if Strait of Hormuz traffic is disrupted. Pentagon confirms USS Eisenhower carrier group repositioned to Arabian Sea.",
    source: "Reuters", parties: ["US", "Iran"],
    sentiment: "escalation", impactOnUAE: "Elevated naval activity near UAE waters. No direct threat to civilian ops.",
    prediction: "60% chance of further sanctions within 48h. Low probability of direct military action.",
  },
  {
    id: "d2", timestamp: "2026-03-25T10:00:00Z",
    headline: "Iran FM calls for 'regional dialogue' in response to GCC statement",
    detail: "Iranian Foreign Minister proposes multilateral talks with GCC nations. UAE, Saudi, Oman mentioned as potential mediators.",
    source: "Al Jazeera", parties: ["Iran", "GCC", "UAE"],
    sentiment: "de-escalation", impactOnUAE: "Positive signal for diplomatic resolution. UAE may host preliminary talks.",
    prediction: "Talks unlikely before April. Posturing phase expected to continue 1-2 weeks.",
  },
  {
    id: "d3", timestamp: "2026-03-25T08:15:00Z",
    headline: "Israel conducts strikes in southern Lebanon; Hezbollah retaliates",
    detail: "IDF confirms targeted strikes on Hezbollah infrastructure. 12 rockets fired at northern Israel in response. No casualties reported.",
    source: "AP", parties: ["Israel", "Hezbollah"],
    sentiment: "escalation", impactOnUAE: "Indirect - flight routes via Levant may see rerouting. BEY connectivity already restricted.",
  },
  {
    id: "d4", timestamp: "2026-03-25T06:00:00Z",
    headline: "UN Security Council emergency session on Gulf tensions",
    detail: "UNSC convenes at Russia's request. Draft resolution calling for ceasefire and de-escalation. US, UK expected to abstain.",
    source: "UN News", parties: ["UN", "US", "Russia"],
    sentiment: "neutral", impactOnUAE: "Diplomatic activity may reduce short-term escalation risk.",
  },
  {
    id: "d5", timestamp: "2026-03-25T03:00:00Z",
    headline: "Houthi spokesperson: 'All options on table' for Gulf targets",
    detail: "Ansar Allah media releases statement claiming capability to strike 'deep into Gulf states'. Likely propaganda but raises threat posture.",
    source: "WAM", parties: ["Houthis", "Yemen"],
    sentiment: "escalation", impactOnUAE: "Direct threat rhetoric. UAE air defense on heightened alert. No change to civil aviation status.",
    prediction: "Rhetoric cycle - expect UAV probing attempts within 24-48h.",
  },
];

const sentimentConfig: Record<Sentiment, { label: string; color: string; bg: string; Icon: React.ComponentType<any> }> = {
  escalation: { label: "ESCALATION", color: "text-danger", bg: "bg-danger-dim", Icon: TrendUpIcon },
  "de-escalation": { label: "DE-ESCALATION", color: "text-success", bg: "bg-success-dim", Icon: TrendDownIcon },
  neutral: { label: "NEUTRAL", color: "text-muted-foreground", bg: "bg-muted", Icon: ChatsIcon },
};

export default function LatestDevelopments() {
  const { developments: apiDevs } = useIntel();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Map API developments, fallback to mock
  const developments: Development[] = apiDevs.length > 0
    ? apiDevs.map((d: any) => ({
        id: d.id,
        timestamp: d.timestamp,
        headline: d.headline,
        detail: d.headline,
        source: d.source || "GDELT",
        parties: [],
        sentiment: d.sentiment as Sentiment,
        impactOnUAE: "",
      }))
    : fallbackDevelopments;

  return (
    <Card className="h-full flex flex-col border-border/50">
      <CardHeader className="px-3 pt-3 pb-2 shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-foreground flex items-center gap-1.5">
            <GlobeIcon className="w-3.5 h-3.5 text-teal" weight="duotone" />
            Geopolitical Intel
          </CardTitle>
          <span className="text-[7px] font-mono text-muted-foreground flex items-center gap-1">
            <ClockIcon className="w-2.5 h-2.5" weight="bold" />
            {mounted ? formatTimeAgo("2026-03-25T12:30:00Z") : "..."}
          </span>
        </div>
        <p className="text-[7px] font-mono text-muted-foreground mt-0.5">
          Iran · US · Israel · Regional dynamics
        </p>
      </CardHeader>

      <CardContent className="px-3 pb-3 flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {developments.map((dev) => {
              const sc = sentimentConfig[dev.sentiment];
              const SentIcon = sc.Icon;
              return (
                <div key={dev.id} className="bg-secondary/30 rounded-lg p-2.5 border border-border/30 hover:border-border/60 transition-colors">
                  {/* Top row */}
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <Badge variant="outline" className={cn("text-[6px] border-0 px-1 py-0 font-bold gap-0.5", sc.color, sc.bg)}>
                      <SentIcon className="w-2 h-2" weight="bold" />
                      {sc.label}
                    </Badge>
                    {dev.parties.map((p) => (
                      <Badge key={p} variant="outline" className="text-[6px] border-border/40 text-muted-foreground px-1 py-0">
                        <FlagIcon className="w-1.5 h-1.5 mr-0.5" weight="bold" />
                        {p}
                      </Badge>
                    ))}
                    <span className="text-[7px] font-mono text-muted-foreground ml-auto">
                      {mounted ? formatTimeAgo(dev.timestamp) : "..."}
                    </span>
                  </div>

                  {/* Headline */}
                  <p className="text-[10px] font-semibold text-foreground/90 leading-snug mb-1">{dev.headline}</p>

                  {/* Detail */}
                  <p className="text-[8px] text-foreground/60 leading-relaxed mb-1.5">{dev.detail}</p>

                  {/* Source */}
                  <div className="flex items-center gap-1 mb-1.5">
                    <Badge variant="outline" className="text-[6px] border-0 px-1 py-0 text-teal bg-teal-dim">
                      {dev.source}
                    </Badge>
                  </div>

                  {/* UAE Impact */}
                  <div className="bg-card/50 rounded-md p-1.5 border border-border/20">
                    <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-wider mb-0.5 flex items-center gap-0.5">
                      <WarningIcon className="w-2 h-2" weight="bold" /> UAE Impact
                    </p>
                    <p className="text-[8px] text-foreground/70 leading-relaxed">{dev.impactOnUAE}</p>
                  </div>

                  {/* Prediction */}
                  {dev.prediction && (
                    <div className="mt-1.5 bg-teal-dim/30 rounded-md p-1.5 border border-teal/10">
                      <p className="text-[7px] font-bold text-teal uppercase tracking-wider mb-0.5">AI Prediction</p>
                      <p className="text-[8px] text-foreground/70 leading-relaxed">{dev.prediction}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
