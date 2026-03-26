"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  PaperPlaneRightIcon, AirplaneTiltIcon, ShieldIcon, WarningIcon,
  SpinnerGapIcon, ChatCircleIcon, ImageIcon, XCircleIcon, PhoneIcon,
} from "@phosphor-icons/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  image?: string;
}

const quickActions = [
  { label: "I have a flight tonight", icon: AirplaneTiltIcon },
  { label: "Is it safe to travel?", icon: ShieldIcon },
  { label: "Current alerts & advisories", icon: WarningIcon },
];

// Simple markdown-to-JSX renderer for bold and bullets
function renderMarkdown(text: string) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    // Bold: **text**
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={j} className="text-foreground">{part.slice(2, -2)}</strong>;
      }
      // Italic: _text_
      if (part.startsWith("_") && part.endsWith("_") && part.length > 2) {
        return <em key={j} className="text-muted-foreground">{part.slice(1, -1)}</em>;
      }
      return part;
    });

    // Bullet points
    if (line.startsWith("- ")) {
      return <div key={i} className="flex gap-1.5 ml-1"><span className="text-teal shrink-0">-</span><span>{rendered.slice(1)}</span></div>;
    }

    return <div key={i}>{rendered}{i < lines.length - 1 && line === "" ? <br /> : null}</div>;
  });
}

export default function AdvisoryModal({ isOpen, onClose }: Props) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Welcome to **AegisUAE Advisory**. I have access to live dashboard data including airspace status, threat levels, weather alerts, and verified news.\n\nAsk me about flights, safety, weather, or current alerts. You can also attach a screenshot to report something.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [showHelplines, setShowHelplines] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef(typeof crypto !== "undefined" ? crypto.randomUUID() : Math.random().toString(36).slice(2));

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    // Small delay to ensure DOM has updated
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
    return () => clearTimeout(timer);
  }, [messages, loading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = () => setPendingImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const send = async () => {
    if ((!input.trim() && !pendingImage) || loading) return;
    const msg = input.trim();
    setInput("");

    const userMessage: Message = {
      role: "user",
      content: msg || (pendingImage ? "Attached a screenshot" : ""),
      image: pendingImage || undefined,
    };
    const image = pendingImage;
    setPendingImage(null);

    setMessages((p) => [...p, userMessage]);
    setLoading(true);

    try {
      // Build conversation history for API (skip images in history, just mark them)
      const history = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
        hasImage: !!m.image,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          imageDescription: image ? msg || "User attached a screenshot" : undefined,
          sessionId: sessionIdRef.current,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Request failed");
      }

      const data = await res.json();
      setMessages((p) => [...p, { role: "assistant", content: data.reply }]);
    } catch (err: any) {
      setMessages((p) => [
        ...p,
        {
          role: "assistant",
          content: "I'm temporarily unable to process requests. The advisory system will be back shortly.\n\nFor emergencies: **Police (999)**, **Civil Defense (998)**, **Ambulance (998)**.",
        },
      ]);
    } finally {
      setLoading(false);
    }
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
              <DialogDescription className="text-[9px]">AI Advisory - Cross-referenced with live data</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-4 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2.5 text-xs leading-relaxed",
                  m.role === "user"
                    ? "bg-teal/15 text-foreground rounded-br-sm"
                    : "bg-secondary text-foreground/90 rounded-bl-sm"
                )}>
                  {m.image && (
                    <img
                      src={m.image}
                      alt="Screenshot"
                      className="rounded-lg mb-2 max-h-48 w-auto border border-border/30"
                    />
                  )}
                  {m.role === "assistant" ? renderMarkdown(m.content) : m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary rounded-xl rounded-bl-sm px-3 py-2.5 flex items-center gap-2">
                  <SpinnerGapIcon className="w-3 h-3 text-teal animate-spin" weight="bold" />
                  <span className="text-xs text-muted-foreground">Analyzing with live data...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Quick actions */}
        {messages.length <= 1 && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {quickActions.map((a) => (
              <Button key={a.label} variant="outline" size="sm"
                className="h-6 text-[9px] gap-1" onClick={() => { setInput(a.label); }}>
                <a.icon className="w-2.5 h-2.5" weight="bold" />{a.label}
              </Button>
            ))}
          </div>
        )}

        {/* Pending image preview */}
        {pendingImage && (
          <div className="px-3 pb-1">
            <div className="relative inline-block">
              <img src={pendingImage} alt="Preview" className="h-16 rounded-lg border border-border/50" />
              <button
                onClick={() => setPendingImage(null)}
                className="absolute -top-1.5 -right-1.5 bg-background rounded-full"
              >
                <XCircleIcon className="w-4 h-4 text-muted-foreground hover:text-danger transition-colors" weight="fill" />
              </button>
            </div>
          </div>
        )}

        {/* Helpline numbers - collapsible */}
        {showHelplines && (
          <div className="px-4 pb-2 shrink-0 animate-in fade-in slide-in-from-bottom-1 duration-200">
            <div className="bg-danger-dim/30 border border-danger/15 rounded-lg p-2.5">
              <p className="text-[8px] font-bold text-danger uppercase mb-1.5">Emergency Helplines</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { name: "Police", number: "999" },
                  { name: "Ambulance", number: "998" },
                  { name: "Civil Defense", number: "997" },
                  { name: "Coast Guard", number: "996" },
                  { name: "NCEMA Hotline", number: "800-NCEMA" },
                  { name: "DHA Health", number: "800-342" },
                ].map((h) => (
                  <a key={h.number} href={`tel:${h.number}`} className="flex items-center gap-1.5 bg-card/50 rounded-md px-2 py-1.5 hover:bg-card transition-colors">
                    <PhoneIcon className="w-2.5 h-2.5 text-danger shrink-0" weight="bold" />
                    <div className="min-w-0">
                      <p className="text-[8px] font-bold text-foreground leading-none">{h.number}</p>
                      <p className="text-[6px] text-muted-foreground">{h.name}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t border-border shrink-0">
          <div className="flex items-center gap-2 bg-secondary rounded-lg px-3 py-2 border border-border focus-within:border-teal/40 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 text-muted-foreground hover:text-teal transition-colors"
              title="Attach screenshot"
            >
              <ImageIcon className="w-4 h-4" weight="duotone" />
            </button>
            <button
              onClick={() => setShowHelplines(!showHelplines)}
              className={cn("shrink-0 transition-colors", showHelplines ? "text-danger" : "text-muted-foreground hover:text-danger")}
              title="Emergency helplines"
            >
              <PhoneIcon className="w-4 h-4" weight="duotone" />
            </button>

            <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about flights, safety, alerts..."
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none" />
            <Button size="icon" variant={(input.trim() || pendingImage) ? "default" : "ghost"} className="h-6 w-6"
              onClick={send} disabled={(!input.trim() && !pendingImage) || loading}>
              <PaperPlaneRightIcon className="w-3 h-3" weight="fill" />
            </Button>
          </div>
          <p className="text-[7px] text-muted-foreground mt-1.5 text-center">
            Powered by live data. Follow official MOI/NCEMA directives.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
