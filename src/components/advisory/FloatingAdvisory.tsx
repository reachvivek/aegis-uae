"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChatCircleIcon, XIcon, BroadcastIcon } from "@phosphor-icons/react";
import AdvisoryModal from "./AdvisoryModal";

export default function FloatingAdvisory() {
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);

  // Show hint bubble after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hintDismissed) setShowHint(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [hintDismissed]);

  // Auto-hide hint after 8 seconds
  useEffect(() => {
    if (!showHint) return;
    const timer = setTimeout(() => setShowHint(false), 8000);
    return () => clearTimeout(timer);
  }, [showHint]);

  const handleOpen = () => {
    setOpen(true);
    setShowHint(false);
    setHintDismissed(true);
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-[9998] flex items-end gap-2.5">
        {/* Hint bubble */}
        {showHint && !open && (
          <div className="animate-in fade-in slide-in-from-right-2 duration-300 mb-1">
            <div className="relative bg-card border border-border rounded-xl px-3.5 py-2.5 shadow-lg max-w-[220px]">
              {/* Arrow */}
              <div className="absolute -right-1.5 bottom-4 w-3 h-3 bg-card border-r border-b border-border rotate-[-45deg]" />

              <div className="flex items-start gap-2">
                <BroadcastIcon className="w-3.5 h-3.5 text-teal shrink-0 mt-0.5" weight="duotone" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground leading-snug">
                    Have a flight tonight? Need guidance?
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-1">
                    AI-powered advisory cross-referenced with live data.
                  </p>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowHint(false); setHintDismissed(true); }}
                  className="shrink-0 text-muted-foreground hover:text-foreground transition-colors -mt-0.5 -mr-1"
                >
                  <XIcon className="w-3 h-3" weight="bold" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAB */}
        <Button
          onClick={handleOpen}
          size="icon"
          className={cn(
            "h-11 w-11 rounded-full shadow-xl",
            "bg-teal hover:bg-teal/90 text-background",
            "transition-all duration-200 hover:scale-105 active:scale-95",
            "border border-teal/30",
          )}
          style={{
            boxShadow: "0 0 16px rgba(0,229,184,0.2), 0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <ChatCircleIcon className="w-[18px] h-[18px]" weight="fill" />
        </Button>
      </div>

      <AdvisoryModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
}
