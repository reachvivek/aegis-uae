"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useLanguage, type Lang } from "@/contexts/LanguageContext";
import {
  ShieldCheckIcon, GlobeHemisphereWestIcon, MapPinIcon,
  NewspaperIcon, CrosshairIcon, ChatCircleDotsIcon,
  PathIcon, RadioactiveIcon, ArrowRightIcon, CheckIcon,
  TranslateIcon, RocketIcon,
} from "@phosphor-icons/react";

const ONBOARDING_KEY = "aegis-onboarded";

interface Step {
  id: string;
  icon: React.ComponentType<any>;
  iconColor: string;
  iconBg: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  highlight?: string;
}

const tourSteps: Step[] = [
  {
    id: "map",
    icon: MapPinIcon,
    iconColor: "text-teal",
    iconBg: "bg-teal-dim",
    titleEn: "Live Stability Map",
    titleAr: "خريطة الاستقرار المباشرة",
    descEn: "Real-time map showing airport status, flight activity, regional stability indicators, and active threat zones across the UAE and surrounding region.",
    descAr: "خريطة في الوقت الفعلي تعرض حالة المطارات ونشاط الرحلات ومؤشرات الاستقرار الإقليمي ومناطق التهديد النشطة في الإمارات والمنطقة المحيطة.",
  },
  {
    id: "news",
    icon: NewspaperIcon,
    iconColor: "text-teal",
    iconBg: "bg-teal-dim",
    titleEn: "News & Ground Truth",
    titleAr: "الأخبار والحقائق الموثقة",
    descEn: "Auto-updating news feed every 15 minutes with verified ground truth facts. Filter by category: Students, Work, or Government updates.",
    descAr: "موجز أخبار يتم تحديثه تلقائياً كل 15 دقيقة مع حقائق موثقة. فلتر حسب الفئة: طلاب، عمل، أو تحديثات حكومية.",
  },
  {
    id: "threats",
    icon: CrosshairIcon,
    iconColor: "text-danger",
    iconBg: "bg-danger-dim",
    titleEn: "Threat Timeline",
    titleAr: "الجدول الزمني للتهديدات",
    descEn: "Track active threats, military activity, and security events in real-time. Color-coded severity levels help you assess risk instantly.",
    descAr: "تتبع التهديدات النشطة والنشاط العسكري والأحداث الأمنية في الوقت الفعلي. مستويات الخطورة المرمزة بالألوان تساعدك على تقييم المخاطر فوراً.",
  },
  {
    id: "evac",
    icon: PathIcon,
    iconColor: "text-danger",
    iconBg: "bg-danger-dim",
    titleEn: "EVAC & SAFE Buttons",
    titleAr: "أزرار الإخلاء والأمان",
    descEn: "EVAC shows evacuation routes including land borders (Oman, Saudi) and maritime options. SAFE helps locate nearby shelters and safe zones.",
    descAr: "زر الإخلاء يعرض مسارات الإخلاء بما في ذلك الحدود البرية (عمان، السعودية) والخيارات البحرية. زر الأمان يساعد في تحديد الملاجئ القريبة.",
  },
  {
    id: "advisory",
    icon: ChatCircleDotsIcon,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
    titleEn: "AI Crisis Advisor",
    titleAr: "مستشار الأزمات الذكي",
    descEn: "Chat with our AI advisor for personalized guidance. Ask about evacuation options, safety measures, school closures, or work-from-home policies.",
    descAr: "تحدث مع مستشار الذكاء الاصطناعي للحصول على إرشادات مخصصة. اسأل عن خيارات الإخلاء وإجراءات السلامة وإغلاق المدارس أو سياسات العمل من المنزل.",
  },
];

export default function OnboardingModal() {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0); // 0=welcome/language, 1..N=tour, N+1=done

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) {
      // Small delay so dashboard renders first
      const timer = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const complete = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOpen(false);
  };

  const skip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setOpen(false);
  };

  if (!open) return null;

  const totalSteps = tourSteps.length + 2; // welcome + tour steps + done
  const isWelcome = step === 0;
  const isDone = step === totalSteps - 1;
  const tourIndex = step - 1;
  const currentTour = tourSteps[tourIndex];

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={skip} />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-[#0C0C10] border border-[#1E1E28] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Progress bar */}
        <div className="h-1 bg-[#1E1E28]">
          <div
            className="h-full bg-teal transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {isWelcome && (
            <WelcomeStep
              lang={lang}
              setLang={setLang}
              onNext={() => setStep(1)}
              onSkip={skip}
              t={t}
            />
          )}

          {!isWelcome && !isDone && currentTour && (
            <TourStep
              step={currentTour}
              index={tourIndex}
              total={tourSteps.length}
              lang={lang}
              onNext={() => setStep(step + 1)}
              onBack={() => setStep(step - 1)}
              onSkip={skip}
              t={t}
            />
          )}

          {isDone && (
            <DoneStep onComplete={complete} t={t} />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Welcome / Language Selection ─── */
function WelcomeStep({
  lang, setLang, onNext, onSkip, t,
}: {
  lang: Lang; setLang: (l: Lang) => void; onNext: () => void; onSkip: () => void;
  t: (en: string, ar: string) => string;
}) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-2xl bg-teal-dim flex items-center justify-center mx-auto mb-4 border border-teal/20">
        <ShieldCheckIcon className="w-7 h-7 text-teal" weight="duotone" />
      </div>
      <h2 className="text-lg font-bold text-white mb-1">
        {t("Welcome to", "مرحباً بك في")} <span className="text-teal">Aegis</span>UAE
      </h2>
      <p className="text-xs text-[#7C7C8A] mb-6">
        {t(
          "Your real-time crisis information dashboard for the UAE",
          "لوحة معلومات الأزمات في الوقت الفعلي للإمارات"
        )}
      </p>

      {/* Language selection */}
      <div className="mb-6">
        <div className="flex items-center justify-center gap-1.5 mb-3">
          <TranslateIcon className="w-3.5 h-3.5 text-[#7C7C8A]" weight="bold" />
          <span className="text-[10px] text-[#7C7C8A] uppercase tracking-wider font-bold">
            {t("Choose your language", "اختر لغتك")}
          </span>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setLang("en")}
            className={cn(
              "flex-1 max-w-[140px] py-3 rounded-xl border-2 transition-all text-sm font-bold",
              lang === "en"
                ? "border-teal bg-teal/10 text-teal"
                : "border-[#1E1E28] bg-[#12121A] text-[#7C7C8A] hover:border-[#2E2E38]"
            )}
          >
            <span className="text-lg block mb-0.5">EN</span>
            <span className="text-[9px] font-normal opacity-70">English</span>
          </button>
          <button
            onClick={() => setLang("ar")}
            className={cn(
              "flex-1 max-w-[140px] py-3 rounded-xl border-2 transition-all text-sm font-bold",
              lang === "ar"
                ? "border-teal bg-teal/10 text-teal"
                : "border-[#1E1E28] bg-[#12121A] text-[#7C7C8A] hover:border-[#2E2E38]"
            )}
          >
            <span className="text-lg block mb-0.5">ع</span>
            <span className="text-[9px] font-normal opacity-70">العربية</span>
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onSkip}
          className="flex-1 text-[10px] text-[#7C7C8A] hover:text-white py-2.5 transition-colors"
        >
          {t("Skip tour", "تخطي الجولة")}
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-teal hover:bg-teal/90 text-[#050507] font-bold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          {t("Quick Tour", "جولة سريعة")}
          <ArrowRightIcon className="w-3.5 h-3.5" weight="bold" />
        </button>
      </div>
    </div>
  );
}

/* ─── Tour Step ─── */
function TourStep({
  step, index, total, lang, onNext, onBack, onSkip, t,
}: {
  step: Step; index: number; total: number; lang: Lang;
  onNext: () => void; onBack: () => void; onSkip: () => void;
  t: (en: string, ar: string) => string;
}) {
  const Icon = step.icon;
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border border-white/5", step.iconBg)}>
          <Icon className={cn("w-5 h-5", step.iconColor)} weight="duotone" />
        </div>
        <div className="flex-1">
          <span className="text-[9px] text-[#7C7C8A] font-mono uppercase">
            {t(`Step ${index + 1} of ${total}`, `الخطوة ${index + 1} من ${total}`)}
          </span>
          <h3 className="text-sm font-bold text-white leading-tight">
            {lang === "ar" ? step.titleAr : step.titleEn}
          </h3>
        </div>
      </div>

      <p className={cn(
        "text-xs text-[#A0A0B0] leading-relaxed mb-6",
        lang === "ar" && "text-right"
      )} dir={lang === "ar" ? "rtl" : "ltr"}>
        {lang === "ar" ? step.descAr : step.descEn}
      </p>

      {/* Step indicators */}
      <div className="flex justify-center gap-1.5 mb-5">
        {tourSteps.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === index ? "w-6 bg-teal" : i < index ? "w-3 bg-teal/40" : "w-3 bg-[#1E1E28]"
            )}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="text-[10px] text-[#7C7C8A] hover:text-white px-3 py-2.5 transition-colors"
        >
          {t("Back", "رجوع")}
        </button>
        <button
          onClick={onSkip}
          className="flex-1 text-[10px] text-[#7C7C8A] hover:text-white py-2.5 transition-colors"
        >
          {t("Skip", "تخطي")}
        </button>
        <button
          onClick={onNext}
          className="flex-1 bg-teal hover:bg-teal/90 text-[#050507] font-bold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          {t("Next", "التالي")}
          <ArrowRightIcon className="w-3.5 h-3.5" weight="bold" />
        </button>
      </div>
    </div>
  );
}

/* ─── Done ─── */
function DoneStep({ onComplete, t }: { onComplete: () => void; t: (en: string, ar: string) => string }) {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4 border border-success/20">
        <RocketIcon className="w-7 h-7 text-success" weight="duotone" />
      </div>
      <h2 className="text-lg font-bold text-white mb-1">
        {t("You're all set!", "أنت جاهز!")}
      </h2>
      <p className="text-xs text-[#7C7C8A] mb-2">
        {t(
          "Stay informed. Stay safe. Trust verified sources.",
          "ابقَ على اطلاع. ابقَ آمناً. ثق بالمصادر الموثقة."
        )}
      </p>
      <div className="bg-[#12121A] border border-[#1E1E28] rounded-lg p-3 mb-5">
        <p className="text-[10px] text-[#7C7C8A] leading-relaxed">
          {t(
            "Tip: Use the AI advisor (chat bubble) anytime for personalized guidance. You can change language from the header.",
            "نصيحة: استخدم مستشار الذكاء الاصطناعي (فقاعة المحادثة) في أي وقت للحصول على إرشادات مخصصة. يمكنك تغيير اللغة من الشريط العلوي."
          )}
        </p>
      </div>
      <button
        onClick={onComplete}
        className="w-full bg-teal hover:bg-teal/90 text-[#050507] font-bold text-sm py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1.5"
      >
        <CheckIcon className="w-4 h-4" weight="bold" />
        {t("Enter Dashboard", "دخول لوحة التحكم")}
      </button>
    </div>
  );
}
