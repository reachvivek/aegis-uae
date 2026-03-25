"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatTimeAgo } from "@/lib/utils";
import {
  CrosshairIcon, CheckCircleIcon, ArrowSquareOutIcon, ClockIcon,
  GraduationCapIcon, BriefcaseIcon, BuildingsIcon, NewspaperIcon,
  WarningIcon, XCircleIcon, ShieldCheckIcon, CaretDownIcon, CaretUpIcon,
} from "@phosphor-icons/react";
import { useNews } from "@/hooks/useNews";

type TruthStatus = "confirmed" | "developing" | "cleared";

interface TruthItem {
  text: string;
  status: TruthStatus;
  source: "govt" | "atc" | "ai";
}

const groundTruth: { items: TruthItem[]; lastUpdated: string; sources: number } = {
  items: [
    { text: "UAE airspace fully reopened; all commercial flights at DXB and AUH operating normally.", status: "confirmed", source: "govt" },
    { text: "Heavy rainfall expected across Abu Dhabi and Dubai through Wednesday evening.", status: "developing", source: "govt" },
    { text: "No active NOTAMs restricting civilian air corridors over UAE territory.", status: "confirmed", source: "atc" },
    { text: "Earlier reports of DXB runway closure have been resolved. Normal ops resumed.", status: "cleared", source: "atc" },
  ],
  lastUpdated: "2026-03-25T12:00:00Z",
  sources: 12,
};

const truthStatusConfig: Record<TruthStatus, { icon: React.ComponentType<any>; text: string; color: string }> = {
  confirmed: { icon: CheckCircleIcon, text: "Confirmed", color: "text-success" },
  developing: { icon: WarningIcon, text: "Developing", color: "text-amber" },
  cleared: { icon: XCircleIcon, text: "Cleared", color: "text-muted-foreground" },
};

const sourceLabels: Record<string, { label: string; color: string }> = {
  govt: { label: "GOVT", color: "text-teal bg-teal-dim" },
  atc: { label: "ATC", color: "text-cyan bg-cyan/10" },
  ai: { label: "AI", color: "text-purple-400 bg-purple-500/10" },
};

type Category = "all" | "students" | "employees" | "govt";

interface Article {
  id: string;
  title: string;
  source: string;
  verified: boolean;
  publishedAt: string;
  tag: string;
  tagColor: string;
  categories: Category[];
}

const fallbackArticles: Article[] = [
  { id: "1", title: "UAE Universities Shift to Online Classes Until March 30 Due to Weather", source: "WAM", verified: true, publishedAt: "2026-03-25T10:00:00Z", tag: "EDUCATION", tagColor: "text-purple-400 bg-purple-500/10", categories: ["all", "students"] },
  { id: "2", title: "MOHRE: Private Sector Remote Work Advisory Extended Through Week", source: "WAM", verified: true, publishedAt: "2026-03-25T09:00:00Z", tag: "EMPLOYMENT", tagColor: "text-blue-400 bg-blue-500/10", categories: ["all", "employees"] },
  { id: "3", title: "Federal Government Offices at Reduced Capacity", source: "WAM", verified: true, publishedAt: "2026-03-25T08:30:00Z", tag: "GOVT", tagColor: "text-amber bg-amber-dim", categories: ["all", "employees", "govt"] },
  { id: "4", title: "GCAA Confirms Full Airspace Restoration", source: "GCAA", verified: true, publishedAt: "2026-03-25T08:00:00Z", tag: "OFFICIAL", tagColor: "text-teal bg-teal-dim", categories: ["all"] },
  { id: "5", title: "Schools in Abu Dhabi & Al Ain Resume In-Person Thursday", source: "ADEK", verified: true, publishedAt: "2026-03-25T05:00:00Z", tag: "EDUCATION", tagColor: "text-purple-400 bg-purple-500/10", categories: ["all", "students"] },
  { id: "6", title: "DEWA: Power Restoration at 99.7% Across Dubai", source: "WAM", verified: true, publishedAt: "2026-03-24T22:00:00Z", tag: "INFRA", tagColor: "text-yellow-400 bg-yellow-500/10", categories: ["all", "govt"] },
];

export default function TruthFeed() {
  const { articles: apiArticles } = useNews();
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<Category>("all");
  const [truthOpen, setTruthOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  // Map API articles, fallback to mock
  const articles: Article[] = apiArticles.length > 0
    ? apiArticles.map((a: any, i: number) => ({
        id: `news-${i}`,
        title: a.title,
        source: a.source || "Feed",
        verified: true,
        publishedAt: a.pubDate || new Date().toISOString(),
        tag: (a.category || "NEWS").toUpperCase(),
        tagColor: a.severity === "critical" ? "text-danger bg-danger-dim" : a.severity === "warning" ? "text-amber bg-amber-dim" : "text-teal bg-teal-dim",
        categories: ["all"] as Category[],
      }))
    : fallbackArticles;

  const filtered = articles.filter((a) => a.categories.includes(tab));

  return (
    <Card className="h-full flex flex-col border-border/50">
      {/* Header with category tabs inline */}
      <CardHeader className="px-3 pt-2.5 pb-1.5 shrink-0">
        <div className="flex items-center justify-between mb-1.5">
          <CardTitle className="text-[10px] font-bold uppercase tracking-[0.1em] text-foreground flex items-center gap-1.5">
            <NewspaperIcon className="w-3.5 h-3.5 text-teal" weight="duotone" />
            News & Updates
          </CardTitle>
          {/* Ground Truth toggle */}
          <button
            onClick={() => setTruthOpen(!truthOpen)}
            className="flex items-center gap-1 text-[7px] font-mono text-teal cursor-pointer hover:text-teal/80 transition-colors"
          >
            <CrosshairIcon className="w-2.5 h-2.5" weight="bold" />
            Ground Truth ({groundTruth.items.length})
            {truthOpen ? <CaretUpIcon className="w-2.5 h-2.5" weight="bold" /> : <CaretDownIcon className="w-2.5 h-2.5" weight="bold" />}
          </button>
        </div>

        {/* Category filter tabs */}
        <Tabs value={tab} onValueChange={(v) => setTab(v as Category)}>
          <TabsList className="h-6 w-full bg-secondary/50">
            <TabsTrigger value="all" className="text-[7px] h-4.5 gap-0.5 data-[state=active]:text-teal data-[state=active]:bg-teal-dim">
              <NewspaperIcon className="w-2.5 h-2.5" weight="bold" /> All
            </TabsTrigger>
            <TabsTrigger value="students" className="text-[7px] h-4.5 gap-0.5 data-[state=active]:text-purple-400 data-[state=active]:bg-purple-500/10">
              <GraduationCapIcon className="w-2.5 h-2.5" weight="bold" /> Students
            </TabsTrigger>
            <TabsTrigger value="employees" className="text-[7px] h-4.5 gap-0.5 data-[state=active]:text-blue-400 data-[state=active]:bg-blue-500/10">
              <BriefcaseIcon className="w-2.5 h-2.5" weight="bold" /> Work
            </TabsTrigger>
            <TabsTrigger value="govt" className="text-[7px] h-4.5 gap-0.5 data-[state=active]:text-amber data-[state=active]:bg-amber-dim">
              <BuildingsIcon className="w-2.5 h-2.5" weight="bold" /> Govt
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>

      {/* Scrollable content */}
      <CardContent className="px-3 pb-3 flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="space-y-1.5">
            {/* Ground Truth - collapsible, inline */}
            {truthOpen && (
              <div className="bg-teal-dim/30 border border-teal/15 rounded-lg p-2.5 mb-1">
                <div className="flex items-center gap-1 mb-1.5">
                  <CrosshairIcon className="w-2.5 h-2.5 text-teal" weight="bold" />
                  <span className="text-[8px] font-bold text-teal uppercase">Verified Facts</span>
                  <span className="text-[7px] font-mono text-muted-foreground ml-auto flex items-center gap-0.5">
                    <ClockIcon className="w-2 h-2" weight="bold" />
                    {mounted ? formatTimeAgo(groundTruth.lastUpdated) : "..."}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {groundTruth.items.map((item, i) => {
                    const sc = truthStatusConfig[item.status];
                    const StatusIcon = sc.icon;
                    const sl = sourceLabels[item.source];
                    return (
                      <li key={i} className="flex gap-1.5">
                        <StatusIcon className={cn("w-2.5 h-2.5 mt-0.5 shrink-0", sc.color)} weight="bold" />
                        <div className="flex-1 min-w-0">
                          <p className={cn(
                            "text-[9px] leading-snug",
                            item.status === "cleared" ? "text-muted-foreground line-through" : "text-foreground/85"
                          )}>
                            {item.text}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Badge variant="outline" className={cn("text-[5px] border-0 px-1 py-0", sc.color, item.status === "confirmed" ? "bg-success-dim" : item.status === "developing" ? "bg-amber-dim" : "bg-muted")}>
                              {sc.text}
                            </Badge>
                            <Badge variant="outline" className={cn("text-[5px] border-0 px-1 py-0", sl.color)}>
                              <ShieldCheckIcon className="w-1.5 h-1.5 mr-0.5" weight="bold" />{sl.label}
                            </Badge>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Articles */}
            {filtered.map((a) => (
              <a key={a.id} href="#" className="block group">
                <div className="border border-border/40 hover:border-border rounded-lg p-2 transition-colors bg-card/40 hover:bg-card/80">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Badge variant="outline" className={cn("text-[6px] border-0 px-1 py-0", a.tagColor)}>
                      {a.tag}
                    </Badge>
                    {a.verified && <CheckCircleIcon className="w-2.5 h-2.5 text-success" weight="fill" />}
                    <span className="text-[6px] font-mono text-muted-foreground ml-auto">
                      {a.source} · {mounted ? formatTimeAgo(a.publishedAt) : "..."}
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-foreground/80 leading-snug line-clamp-2 group-hover:text-foreground transition-colors">
                    {a.title}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
