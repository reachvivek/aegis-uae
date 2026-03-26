"use client";

import { type ReactNode } from "react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { useLanguage } from "@/contexts/LanguageContext";

interface BiTooltipProps {
  en: string;
  ar: string;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
}

export function BiTooltip({ en, ar, children, side = "top", align = "center" }: BiTooltipProps) {
  const { lang } = useLanguage();
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<span className="inline-flex" />}>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} align={align}>
          <span dir={lang === "ar" ? "rtl" : "ltr"} className="text-[10px]">
            {lang === "ar" ? ar : en}
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
