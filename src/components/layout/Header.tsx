"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { BiTooltip } from "@/components/ui/bi-tooltip";
import { ShieldCheckIcon, WifiHighIcon, TranslateIcon } from "@phosphor-icons/react";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export default function Header() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const { lang, setLang, t } = useLanguage();

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setDate(now.toLocaleDateString("en-US", {
        weekday: "short", month: "short", day: "numeric", year: "numeric",
        timeZone: "Asia/Dubai",
      }));
      setTime(now.toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: true, timeZone: "Asia/Dubai",
      }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="w-full bg-background/80 backdrop-blur-sm border-b border-border/50 shrink-0">
      <div className="max-w-[1920px] mx-auto px-2 sm:px-3 h-9 sm:h-10 flex items-center">
        {/* Left - Brand */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-1 min-w-0">
          <BiTooltip en="AegisUAE — Crisis Informatics System" ar="إيجس الإمارات — نظام معلومات الأزمات">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-teal-dim flex items-center justify-center border border-teal/20 shrink-0">
              <ShieldCheckIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal" weight="duotone" />
            </div>
          </BiTooltip>
          <div className="leading-none min-w-0">
            <h1 className="text-xs sm:text-sm font-bold tracking-tight truncate">
              <span className="gradient-text">Aegis</span>
              <span className="text-foreground">UAE</span>
            </h1>
            <p className="text-[6px] sm:text-[7px] text-muted-foreground uppercase tracking-[0.15em] mt-0.5 hidden sm:block">
              {t("Crisis Informatics System", "نظام معلومات الأزمات")}
            </p>
          </div>
        </div>

        {/* Center - Date & Time */}
        <BiTooltip en="UAE Standard Time (GST / UTC+4)" ar="توقيت الإمارات (GST / UTC+4)">
          <div className="flex items-center gap-1.5 sm:gap-2 font-mono">
            <span className="text-[8px] sm:text-[10px] text-muted-foreground hidden sm:inline">{date}</span>
            <span className="w-px h-3.5 bg-border/50 hidden sm:block" />
            <span className="text-xs sm:text-sm font-bold tracking-tight text-foreground">{time}</span>
            <span className="text-[8px] sm:text-[9px] font-bold text-teal">GST</span>
          </div>
        </BiTooltip>

        {/* Right - Language toggle + Status */}
        <div className="flex items-center justify-end flex-1 gap-2">
          {/* Language toggle */}
          <BiTooltip en="Switch language / تغيير اللغة" ar="تغيير اللغة / Switch language">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className={cn(
                "flex items-center gap-1 h-6 px-2 rounded-md text-[9px] font-bold transition-all border",
                "bg-[#12121A] border-[#1E1E28] hover:border-teal/40 text-[#7C7C8A] hover:text-teal"
              )}
            >
              <TranslateIcon className="w-3 h-3" weight="bold" />
              <span>{lang === "en" ? "ع" : "EN"}</span>
            </button>
          </BiTooltip>

          <BiTooltip en="System status — All operational" ar="حالة النظام — جميع الأنظمة تعمل">
            <Badge variant="outline" className="text-[7px] sm:text-[8px] gap-1 border-border text-muted-foreground">
              <WifiHighIcon className="w-2.5 h-2.5 text-success" weight="bold" />
              <span className="hidden sm:inline">{t("All Systems Operational", "جميع الأنظمة تعمل")}</span>
              <span className="sm:hidden">{t("OK", "جاهز")}</span>
            </Badge>
          </BiTooltip>
        </div>
      </div>
    </div>
  );
}
