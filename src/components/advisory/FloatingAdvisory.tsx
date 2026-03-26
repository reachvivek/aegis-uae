"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChatCircleIcon, XIcon, BroadcastIcon,
  AirplaneTiltIcon, ShieldIcon, CloudRainIcon, GraduationCapIcon, BriefcaseIcon,
} from "@phosphor-icons/react";
import { useLanguage } from "@/contexts/LanguageContext";
import AdvisoryModal from "./AdvisoryModal";

const suggestions = [
  { en: "Is it safe to go outside?", ar: "هل الخروج آمن؟", icon: ShieldIcon },
  { en: "Are flights operating normally?", ar: "هل الرحلات تعمل بشكل طبيعي؟", icon: AirplaneTiltIcon },
  { en: "Should I go to work tomorrow?", ar: "هل أذهب للعمل غدا؟", icon: BriefcaseIcon },
  { en: "Are schools open today?", ar: "هل المدارس مفتوحة اليوم؟", icon: GraduationCapIcon },
  { en: "What's the weather warning?", ar: "ما هو تحذير الطقس؟", icon: CloudRainIcon },
];

export default function FloatingAdvisory() {
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState("");
  const [showHint, setShowHint] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { t } = useLanguage();

  // Show hint bubble after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hintDismissed) setShowHint(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [hintDismissed]);

  // Auto-hide hint after 8 seconds, then show suggestions
  useEffect(() => {
    if (!showHint) return;
    const timer = setTimeout(() => {
      setShowHint(false);
      setShowSuggestions(true);
    }, 8000);
    return () => clearTimeout(timer);
  }, [showHint]);

  // Show suggestions after hint is dismissed
  useEffect(() => {
    if (hintDismissed && !showSuggestions && !open) {
      const timer = setTimeout(() => setShowSuggestions(true), 500);
      return () => clearTimeout(timer);
    }
  }, [hintDismissed, showSuggestions, open]);

  const handleOpen = (question?: string) => {
    if (question) setPrefill(question);
    setOpen(true);
    setShowHint(false);
    setHintDismissed(true);
    setShowSuggestions(false);
  };

  return (
    <>
      <div className="fixed bottom-5 right-5 z-[9998] flex flex-col items-end gap-2">
        {/* Suggestion chips */}
        {showSuggestions && !open && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col items-end gap-1 mb-0.5">
            {suggestions.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.en}
                  onClick={() => handleOpen(t(s.en, s.ar))}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm border border-border/50 shadow-md hover:bg-secondary hover:border-teal/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] max-w-[240px]"
                >
                  <Icon className="w-3 h-3 text-teal shrink-0" weight="bold" />
                  <span className="text-[10px] text-foreground/80 whitespace-nowrap">{t(s.en, s.ar)}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-end gap-2.5">
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
                      {t("Have a flight tonight? Need guidance?", "هل لديك رحلة الليلة؟ تحتاج توجيه؟")}
                    </p>
                    <p className="text-[9px] text-muted-foreground mt-1">
                      {t("AI-powered advisory cross-referenced with live data.", "استشارات مدعومة بالذكاء الاصطناعي مع بيانات حية.")}
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
            onClick={() => handleOpen()}
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
      </div>

      <AdvisoryModal isOpen={open} onClose={() => setOpen(false)} prefill={prefill} onPrefillConsumed={() => setPrefill("")} />
    </>
  );
}
