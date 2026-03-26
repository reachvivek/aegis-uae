"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { WarningIcon, CheckCircleIcon, BroadcastIcon, ClockIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StandardModal from "@/components/ui/standard-modal";
import { useNewsTicker } from "@/hooks/useNewsTicker";

interface TickerItem {
  text: string;
  severity: "breaking" | "alert" | "info";
  time: string; // ISO or relative label
  detail: string;
  source: string;
}

const fallbackTickerItems: TickerItem[] = [
  {
    text: "BREAKING: 5 UAVs intercepted over Abu Dhabi airspace - all neutralized, no casualties",
    severity: "breaking", time: "2h ago", source: "UAE MOD",
    detail: "The UAE Ministry of Defense confirmed that five unmanned aerial vehicles (UAVs) were detected and intercepted over Abu Dhabi airspace at approximately 14:30 GST. The Pantsir-S1 and THAAD defense systems successfully neutralized all five targets. Debris fell in unpopulated areas east of Al Dhafra. Civil defense teams have secured the debris sites. No civilian casualties or infrastructure damage reported. The attack is believed to have originated from Houthi-controlled territory in Yemen.",
  },
  {
    text: "DXB Airport operating normally - 87% on-time rate - no flight cancellations reported",
    severity: "info", time: "1h ago", source: "GCAA",
    detail: "Dubai International Airport (DXB) continues normal operations with an 87% on-time departure rate. All three terminals are fully operational. Runway 12R/30L is in use as primary. No cancellations have been reported in the last 24 hours. Passengers are advised to check with airlines for any minor delays due to increased security screening. The airport handled 1,247 flights in the past 24 hours.",
  },
  {
    text: "NCM: Heavy rainfall warning extended until Wed evening - Abu Dhabi, Dubai, Sharjah affected",
    severity: "alert", time: "3h ago", source: "NCM",
    detail: "The National Centre of Meteorology has extended the heavy rainfall warning (Amber) until Wednesday evening. Rainfall of 30-50mm is expected across Abu Dhabi, Dubai, and Sharjah. Flash flooding is likely in low-lying areas and wadis. Residents are advised to avoid unnecessary travel, stay away from flooded areas, and follow official guidance. Schools in affected areas may shift to remote learning. Emergency services are on standby.",
  },
  {
    text: "GCAA: All UAE civilian air corridors OPEN - no active NOTAMs restricting commercial flights",
    severity: "info", time: "4h ago", source: "GCAA",
    detail: "The General Civil Aviation Authority confirms all UAE civilian air corridors remain fully open. No NOTAMs restricting commercial flight operations have been issued. Airspace management systems are operating normally. Military defensive operations are being conducted in designated restricted zones without impact on civilian routes. Airlines are advised to monitor real-time NOTAM updates.",
  },
  {
    text: "Trump warns Iran of 'severe consequences' - USS Eisenhower repositioned to Arabian Sea",
    severity: "breaking", time: "5h ago", source: "Reuters",
    detail: "U.S. President Trump issued a stern warning to Iran, stating that any further attacks on Gulf allies would result in 'severe consequences.' The USS Dwight D. Eisenhower carrier strike group has been repositioned from the Red Sea to the Arabian Sea, placing it within striking range of Iranian targets. The Pentagon described the move as 'defensive repositioning.' Iran's foreign ministry called it 'provocative escalation.' Gulf states have urged restraint from all parties.",
  },
  {
    text: "Iran FM proposes regional dialogue with GCC - UAE mentioned as potential mediator",
    severity: "info", time: "8h ago", source: "Al Jazeera",
    detail: "Iran's Foreign Minister has proposed a new round of regional dialogue with GCC nations, specifically mentioning the UAE as a potential mediator given its recent diplomatic normalization efforts. The proposal includes a ceasefire framework, prisoner exchange, and economic cooperation measures. UAE's Ministry of Foreign Affairs has acknowledged receipt of the proposal and is 'studying it carefully.' Analysts view this as a potential de-escalation signal.",
  },
  {
    text: "Houthi spokesperson threatens Gulf targets - UAE air defense on heightened alert",
    severity: "alert", time: "6h ago", source: "AFP",
    detail: "A Houthi military spokesperson released a video statement threatening further attacks on Gulf infrastructure, specifically naming UAE and Saudi Arabia. In response, UAE armed forces have raised air defense readiness to the highest level. Additional Patriot PAC-3 batteries have been deployed around critical infrastructure. Residents near military installations may notice increased activity. The threat is being assessed by UAE intelligence agencies.",
  },
  {
    text: "Al Ain: Debris from earlier intercept contained - civil defense cordoned area - no injuries",
    severity: "alert", time: "12h ago", source: "WAM",
    detail: "Civil defense teams in Al Ain have successfully cordoned off and contained debris from an earlier missile interception. The debris fell in an agricultural area approximately 15km east of Al Ain city center. No injuries were reported. Hazmat teams have assessed the area and confirmed no chemical or radiological contamination. The cordon is expected to remain in place for 24-48 hours while military engineers remove the debris.",
  },
  {
    text: "UN Security Council emergency session on Gulf tensions - draft ceasefire resolution tabled",
    severity: "info", time: "10h ago", source: "UN News",
    detail: "The UN Security Council convened an emergency session to discuss escalating tensions in the Gulf region. A draft ceasefire resolution was tabled by the UK, calling for an immediate cessation of hostilities and return to diplomatic negotiations. Russia and China signaled conditional support. The US abstained from initial comments. The UAE's permanent representative urged the council to act decisively. A vote is expected within 48 hours.",
  },
  {
    text: "Oman land route via Hatta OPEN - 4h30m to Muscat - primary evacuation corridor clear",
    severity: "info", time: "1h ago", source: "MOI UAE",
    detail: "The Ministry of Interior confirms the primary land evacuation route via Hatta to Oman remains fully open and clear. Current travel time to Muscat is approximately 4 hours 30 minutes. The Hatta border crossing is processing vehicles efficiently with minimal wait times. Oman is providing visa-on-arrival for all UAE residents. Travelers are advised to carry essential documents, water, and fuel for the journey.",
  },
];

const severityIcon: Record<string, React.ComponentType<any>> = {
  breaking: WarningIcon,
  alert: BroadcastIcon,
  info: CheckCircleIcon,
};

const severityColor: Record<string, string> = {
  breaking: "text-danger",
  alert: "text-amber",
  info: "text-teal",
};

function TickerStrip({ items, onItemClick }: { items: TickerItem[]; onItemClick: (item: TickerItem) => void }) {
  return (
    <>
      {items.map((item, i) => {
        const Icon = severityIcon[item.severity];
        return (
          <button
            key={i}
            onClick={() => onItemClick(item)}
            className="flex items-center gap-1.5 shrink-0 px-4 cursor-pointer hover:bg-white/5 rounded transition-colors"
          >
            <Icon className={cn("w-2.5 h-2.5 shrink-0", severityColor[item.severity])} weight="bold" />
            <span className={cn(
              "text-[9px] font-mono whitespace-nowrap",
              item.severity === "breaking" ? "text-foreground font-bold" : "text-foreground/70"
            )}>
              {item.text}
            </span>
            <span className="text-[7px] font-mono text-muted-foreground/60 whitespace-nowrap flex items-center gap-0.5">
              <ClockIcon className="w-2 h-2" weight="bold" />
              {item.time}
            </span>
            <span className="text-border/50 ml-2">|</span>
          </button>
        );
      })}
    </>
  );
}

export default function NewsTicker() {
  const { items: apiItems } = useNewsTicker();
  const [selected, setSelected] = useState<TickerItem | null>(null);

  // Map API items, fallback to mock
  const tickerItems: TickerItem[] = apiItems.length > 0
    ? apiItems.map((item: any) => ({
        text: item.headline,
        severity: item.severity === "critical" ? "breaking" as const : item.severity === "warning" ? "alert" as const : "info" as const,
        time: item.timestamp ? new Date(item.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "",
        detail: item.detail || "",
        source: item.source || "Feed",
      }))
    : fallbackTickerItems;

  return (
    <>
      <div className="w-full bg-card/80 border-t border-b border-border/30 shrink-0 overflow-hidden h-6 relative">
        {/* Label */}
        <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-2 bg-danger shadow-[4px_0_12px_rgba(0,0,0,0.5)]">
          <span className="text-[8px] font-bold text-white tracking-[0.15em] uppercase">BREAKING</span>
        </div>

        {/* Two identical strips side by side */}
        <div className="flex items-center h-full animate-ticker pl-14 w-max">
          <TickerStrip items={tickerItems} onItemClick={setSelected} />
          <TickerStrip items={tickerItems} onItemClick={setSelected} />
        </div>
      </div>

      {/* News detail modal */}
      {selected && (
        <StandardModal
          open={!!selected}
          onOpenChange={(open) => !open && setSelected(null)}
          size="md"
          title={
            <span className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn(
                "text-[8px] border-0 font-bold uppercase",
                selected.severity === "breaking" ? "text-danger bg-danger-dim" :
                selected.severity === "alert" ? "text-amber bg-amber-dim" :
                "text-teal bg-teal-dim"
              )}>
                {selected.severity}
              </Badge>
              <span className="text-[9px] font-mono text-muted-foreground">{selected.source}</span>
              <span className="text-[9px] font-mono text-muted-foreground flex items-center gap-0.5 ml-auto">
                <ClockIcon className="w-2.5 h-2.5" weight="bold" />
                {selected.time}
              </span>
            </span>
          }
          footer={
            <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
              Close
            </Button>
          }
        >
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground leading-snug">
              {selected.text}
            </p>
            {selected.detail && selected.detail !== selected.text && (
              <p className="text-xs leading-relaxed text-foreground/70">
                {selected.detail}
              </p>
            )}
            {(!selected.detail || selected.detail === selected.text) && (
              <p className="text-xs text-muted-foreground italic">
                Full article details not available. Check the source ({selected.source}) for complete coverage.
              </p>
            )}
          </div>
        </StandardModal>
      )}
    </>
  );
}
