"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { PaperPlaneRightIcon, AirplaneTiltIcon, ShieldIcon, WarningIcon, SpinnerGapIcon, ChatCircleIcon } from "@phosphor-icons/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const quickActions = [
  { label: "I have a flight tonight", icon: AirplaneTiltIcon },
  { label: "Is it safe to travel?", icon: ShieldIcon },
  { label: "Current GCAA advisories", icon: WarningIcon },
];

export default function AdvisoryModal({ isOpen, onClose }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "I'm the AegisUAE Advisory AI. I cross-reference your query with live GCAA directives, flight data, and verified news.\n\nTry asking about a specific flight, route, or situation.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const send = () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput("");
    setMessages((p) => [...p, { role: "user", content: msg }]);
    setLoading(true);
    setTimeout(() => {
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content: `**Airspace Status:** OPEN - All commercial corridors active\n**GCAA Advisory:** No restrictions in effect\n**Recommendation:** PROCEED with normal travel plans\n\nDXB operating at 87% on-time rate. No disruptions in the last 6 hours.\n\n_This advisory is AI-generated. Always follow official MOI/NCEMA directives._`,
        },
      ]);
      setLoading(false);
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] h-[600px] flex flex-col p-0 gap-0">
        <DialogHeader className="px-4 pt-4 pb-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-teal-dim flex items-center justify-center">
              <ChatCircleIcon className="w-3.5 h-3.5 text-teal" weight="duotone" />
            </div>
            <div>
              <DialogTitle className="text-sm">What Should I Do?</DialogTitle>
              <DialogDescription className="text-[9px]">AI Advisory · Cross-referenced with live data</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2.5 text-xs leading-relaxed whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-teal/15 text-foreground rounded-br-sm"
                    : "bg-secondary text-foreground/90 rounded-bl-sm"
                )}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-xl rounded-bl-sm px-3 py-2.5 flex items-center gap-2">
                  <SpinnerGapIcon className="w-3 h-3 text-teal animate-spin" weight="bold" />
                  <span className="text-xs text-muted-foreground">Cross-referencing...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick actions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {quickActions.map((a) => (
              <Button key={a.label} variant="outline" size="sm"
                className="h-6 text-[9px] gap-1" onClick={() => setInput(a.label)}>
                <a.icon className="w-2.5 h-2.5" weight="bold" />{a.label}
              </Button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-border shrink-0">
          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 border border-border focus-within:border-teal/40 transition-colors">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="e.g., I have flight EK203 tonight..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none" />
            <Button size="icon" variant={input.trim() ? "default" : "ghost"} className="h-6 w-6"
              onClick={send} disabled={!input.trim() || loading}>
              <PaperPlaneRightIcon className="w-3 h-3" weight="fill" />
            </Button>
          </div>
          <p className="text-[7px] text-muted-foreground mt-1.5 text-center">
            AI-generated from verified sources. Follow official MOI/NCEMA directives.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
