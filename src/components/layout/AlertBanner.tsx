"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { cn, formatTimeAgo } from "@/lib/utils";
import {
  CloudRainIcon, CloudLightningIcon, AirplaneTiltIcon, WarningIcon,
  MapPinIcon, ClockIcon, WarningCircleIcon, WarningDiamondIcon,
  ShieldWarning, X, Siren, CheckCircle,
} from "@phosphor-icons/react";
import { useAlerts } from "@/hooks/useAlerts";
import { useEarthquakes } from "@/hooks/useEarthquakes";
import { useCrisisMode } from "@/hooks/useCrisisMode";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type AlertSeverity = "critical" | "warning" | "advisory";
type ModalType = "critical" | "allclear" | "detail" | null;

interface CriticalAlert {
  id: string;
  severity: AlertSeverity;
  category: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  icon: React.ReactNode;
  source: string;
  regions: string[];
  issuedAt: string;
  expiresAt: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  WEATHER: <CloudRainIcon className="w-3 h-3" weight="duotone" />,
  SEISMIC: <WarningIcon className="w-3 h-3" weight="duotone" />,
  AIRSPACE: <AirplaneTiltIcon className="w-3 h-3" weight="duotone" />,
};

const fallbackAlerts: CriticalAlert[] = [
  {
    id: "1", severity: "warning", category: "WEATHER",
    title: "Heavy Rainfall Warning - Abu Dhabi, Dubai & Northern Emirates",
    description: "NCM: Expect 30-50mm rainfall over 24h. Flash flooding in low-lying areas. Reduced highway visibility.",
    icon: <CloudRainIcon className="w-3 h-3" weight="duotone" />, source: "NCM",
    regions: ["Abu Dhabi", "Dubai", "Sharjah"],
    issuedAt: "2026-03-25T11:00:00Z", expiresAt: "2026-03-26T11:00:00Z",
  },
  {
    id: "2", severity: "warning", category: "WEATHER",
    title: "Thunderstorm Watch - Eastern UAE & Al Ain",
    description: "Isolated thunderstorms with lightning activity. Secure outdoor items and avoid open areas.",
    icon: <CloudLightningIcon className="w-3 h-3" weight="duotone" />, source: "NCM",
    regions: ["Al Ain", "Fujairah"],
    issuedAt: "2026-03-25T09:00:00Z", expiresAt: "2026-03-25T21:00:00Z",
  },
  {
    id: "3", severity: "advisory", category: "AIRSPACE",
    title: "DXB RWY 12L/30R Maintenance 0200-0600 UTC",
    description: "Single runway operations. 15-25 min additional delays expected.",
    icon: <AirplaneTiltIcon className="w-3 h-3" weight="duotone" />, source: "GCAA",
    regions: ["DXB"],
    issuedAt: "2026-03-25T08:00:00Z", expiresAt: "2026-03-26T06:00:00Z",
  },
];

const severityConfig: Record<AlertSeverity, {
  text: string; bg: string; border: string; dot: string; label: string;
}> = {
  critical: { text: "text-danger", bg: "bg-danger-dim", border: "border-danger/20", dot: "bg-danger", label: "CRITICAL" },
  warning: { text: "text-amber", bg: "bg-amber-dim", border: "border-amber/20", dot: "bg-amber", label: "WARNING" },
  advisory: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", dot: "bg-blue-400", label: "ADVISORY" },
};

// Unified modal theme config
const modalTheme = {
  critical: {
    color: "danger", colorClass: "text-danger", bgTint: "bg-danger/20", borderTint: "border-danger/30",
    shadowTint: "shadow-[0_0_60px_rgba(255,71,87,0.15)]", borderColor: "border-danger/40",
    divider: "border-danger/10", badgeBg: "bg-danger", badgeBorder: "border-danger/30", badgeText: "text-danger", badgeTintBg: "bg-danger/10",
    infoBg: "bg-danger/5", infoBorder: "border-danger/15",
    btnBg: "bg-danger/10 hover:bg-danger/20 border-danger/20",
    label: "CRITICAL ALERT",
    Icon: Siren,
    instructionsTitle: "Immediate Actions",
    instructions: [
      { text: "Move away from", highlight: "windows, glass & doors" },
      { text: "Seek shelter in an", highlight: "interior room or basement" },
      { text: "Stay away from", highlight: "open areas & balconies" },
      { text: "Await official instructions from", highlight: "MOI / NCEMA" },
    ],
  },
  allclear: {
    color: "green-500", colorClass: "text-green-400", bgTint: "bg-green-500/20", borderTint: "border-green-500/30",
    shadowTint: "shadow-[0_0_60px_rgba(34,197,94,0.15)]", borderColor: "border-green-500/40",
    divider: "border-green-500/10", badgeBg: "bg-green-500", badgeBorder: "border-green-500/30", badgeText: "text-green-400", badgeTintBg: "bg-green-500/10",
    infoBg: "bg-green-500/5", infoBorder: "border-green-500/15",
    btnBg: "bg-green-500/10 hover:bg-green-500/20 border-green-500/20",
    label: "ALL CLEAR",
    Icon: CheckCircle,
    instructionsTitle: "Safety Guidance",
    instructions: [
      { text: "You may", highlight: "resume normal activities" },
      { text: "Continue to", highlight: "remain cautious and follow official channels" },
      { text: "Report any", highlight: "suspicious activity to authorities" },
      { text: "Keep", highlight: "emergency contacts accessible" },
    ],
  },
};

// Default all-clear alert data
const allClearAlert: CriticalAlert = {
  id: "allclear", severity: "advisory", category: "GENERAL",
  title: "Thank you for your cooperation. We reassure you that the situation is currently safe. You may resume your normal activities while continuing to remain cautious and take the necessary precautions, and to follow official instructions. (MOI)",
  titleAr: "شكراً لتعاونكم، ونطمئنكم بأن الوضع آمن حالياً، ويمكنكم استئناف أنشطتكم المعتادة مع ضرورة أخذ الحيطة والحذر ومتابعة المستجدات. (وزارة الداخلية)",
  description: "Situation resolved. Resume normal activities with caution.",
  descriptionAr: "تم حل الموقف. استأنف أنشطتك العادية مع الحذر.",
  icon: <CheckCircle className="w-3 h-3" weight="duotone" />, source: "MOI",
  regions: ["UAE"], issuedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 6 * 3600000).toISOString(),
};

export default function AlertBanner() {
  const { alerts: apiAlerts } = useAlerts();
  const { quakes } = useEarthquakes();
  const { crisisMode } = useCrisisMode();
  const [activeIndex, setActiveIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalAlert, setModalAlert] = useState<CriticalAlert | null>(null);
  const dismissedIds = useRef<Set<string>>(new Set());
  const shownIds = useRef<Set<string>>(new Set());
  const sirenCtxRef = useRef<AudioContext | null>(null);
  const prevCrisisMode = useRef(false);
  const thankYouTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Map API alerts to component format, fallback to mock data
  const alerts: CriticalAlert[] = (() => {
    if (apiAlerts.length === 0) return fallbackAlerts;

    const parseRegions = (r: any): string[] => {
      if (Array.isArray(r)) return r;
      if (typeof r === "string") {
        try { const parsed = JSON.parse(r); if (Array.isArray(parsed)) return parsed; } catch {}
        return r ? [r] : [];
      }
      return [];
    };

    const mapped: CriticalAlert[] = apiAlerts.map((a: any) => ({
      id: a.id,
      severity: a.severity as AlertSeverity,
      category: a.category || "GENERAL",
      title: a.title,
      titleAr: a.titleAr || "",
      description: a.description || "",
      descriptionAr: a.descriptionAr || "",
      icon: categoryIcons[a.category] || <WarningIcon className="w-3 h-3" weight="duotone" />,
      source: a.source || "System",
      regions: parseRegions(a.regions),
      issuedAt: a.issuedAt,
      expiresAt: a.expiresAt,
    }));

    const seismic = mapped.filter((a) => a.category === "SEISMIC");
    const nonSeismic = mapped.filter((a) => a.category !== "SEISMIC");

    if (seismic.length > 1) {
      const maxMag = seismic.reduce((max, a) => {
        const match = a.title.match(/M([\d.]+)/);
        const mag = match ? parseFloat(match[1]) : 0;
        return mag > max ? mag : max;
      }, 0);
      const highestSeverity = seismic.some((a) => a.severity === "critical")
        ? "critical" as AlertSeverity
        : seismic.some((a) => a.severity === "warning")
          ? "warning" as AlertSeverity
          : "advisory" as AlertSeverity;

      const summary: CriticalAlert = {
        id: "seismic-summary", severity: highestSeverity, category: "SEISMIC",
        title: `${seismic.length} Seismic Events Detected – Highest M${maxMag.toFixed(1)}`,
        description: `${seismic.length} earthquakes recorded in the region. Strongest: M${maxMag.toFixed(1)}.`,
        icon: categoryIcons["SEISMIC"], source: "USGS",
        regions: ["UAE Region"], issuedAt: seismic[0].issuedAt, expiresAt: seismic[0].expiresAt,
      };
      return [...nonSeismic, summary];
    }
    return mapped;
  })();

  useEffect(() => setMounted(true), []);

  // --- Sound functions ---
  const stopSiren = useCallback(() => {
    if (sirenCtxRef.current) {
      try { sirenCtxRef.current.close(); } catch {}
      sirenCtxRef.current = null;
    }
  }, []);

  const playCriticalSiren = useCallback(() => {
    stopSiren();
    try {
      const ctx = new AudioContext();
      sirenCtxRef.current = ctx;
      const now = ctx.currentTime;
      const duration = 5;

      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sawtooth";
      for (let t = 0; t < duration; t += 0.5) {
        osc1.frequency.setValueAtTime(600, now + t);
        osc1.frequency.linearRampToValueAtTime(1200, now + t + 0.25);
        osc1.frequency.linearRampToValueAtTime(600, now + t + 0.5);
      }
      gain1.gain.setValueAtTime(0.35, now);
      gain1.gain.setValueAtTime(0.35, now + duration - 0.3);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc1.connect(gain1).connect(ctx.destination);
      osc1.start(now); osc1.stop(now + duration);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "square";
      for (let t = 0; t < duration; t += 0.5) {
        osc2.frequency.setValueAtTime(800, now + t);
        osc2.frequency.linearRampToValueAtTime(1400, now + t + 0.25);
        osc2.frequency.linearRampToValueAtTime(800, now + t + 0.5);
      }
      gain2.gain.setValueAtTime(0.2, now);
      gain2.gain.setValueAtTime(0.2, now + duration - 0.3);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc2.connect(gain2).connect(ctx.destination);
      osc2.start(now); osc2.stop(now + duration);

      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = "sine"; osc3.frequency.value = 150;
      for (let t = 0; t < duration; t += 0.25) {
        gain3.gain.setValueAtTime(0.25, now + t);
        gain3.gain.linearRampToValueAtTime(0.05, now + t + 0.125);
        gain3.gain.linearRampToValueAtTime(0.25, now + t + 0.25);
      }
      gain3.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc3.connect(gain3).connect(ctx.destination);
      osc3.start(now); osc3.stop(now + duration);

      setTimeout(() => {
        if (sirenCtxRef.current === ctx) { try { ctx.close(); } catch {} sirenCtxRef.current = null; }
      }, (duration + 0.5) * 1000);
    } catch {}
  }, [stopSiren]);

  const playReliefSound = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const now = ctx.currentTime;
      // C5 -> E5 -> G5 ascending major chord
      [{ freq: 523, start: 0, end: 0.6 }, { freq: 659, start: 0.15, end: 0.8 }, { freq: 784, start: 0.35, end: 1.2 }]
        .forEach(({ freq, start, end }) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sine"; o.frequency.value = freq;
          g.gain.setValueAtTime(0, now + start);
          g.gain.linearRampToValueAtTime(0.3, now + start + 0.05);
          g.gain.exponentialRampToValueAtTime(0.001, now + end);
          o.connect(g).connect(ctx.destination);
          o.start(now + start); o.stop(now + end);
        });
      setTimeout(() => { try { ctx.close(); } catch {} }, 1500);
    } catch {}
  }, []);

  // --- Modal helpers ---
  const openModal = useCallback((type: ModalType, alert: CriticalAlert) => {
    setModalType(type);
    setModalAlert(alert);
    setModalOpen(true);
    if (type === "critical") playCriticalSiren();
    else if (type === "allclear") playReliefSound();
  }, [playCriticalSiren, playReliefSound]);

  const dismissModal = useCallback(() => {
    stopSiren();
    if (modalAlert && modalType === "critical") dismissedIds.current.add(modalAlert.id);
    if (thankYouTimer.current) clearTimeout(thankYouTimer.current);
    setModalOpen(false);
    setModalType(null);
    setModalAlert(null);
  }, [modalAlert, modalType, stopSiren]);

  // --- Crisis mode transition: auto-dismiss critical, show all-clear ---
  useEffect(() => {
    if (prevCrisisMode.current && !crisisMode) {
      stopSiren();
      // Replace current modal with all-clear
      setModalType("allclear");
      setModalAlert(allClearAlert);
      setModalOpen(true);
      playReliefSound();
      if (thankYouTimer.current) clearTimeout(thankYouTimer.current);
      thankYouTimer.current = setTimeout(() => {
        setModalOpen(false); setModalType(null); setModalAlert(null);
      }, 5 * 60 * 1000);
    }
    prevCrisisMode.current = crisisMode;
    return () => { if (thankYouTimer.current) clearTimeout(thankYouTimer.current); };
  }, [crisisMode, stopSiren, playReliefSound]);

  // --- Auto-open critical modal ONLY when crisis mode is active ---
  useEffect(() => {
    if (!crisisMode) return; // No popup unless crisis mode is on
    const criticals = alerts.filter(
      (a) => a.severity === "critical" && !dismissedIds.current.has(a.id) && !shownIds.current.has(a.id)
    );
    if (criticals.length > 0) {
      shownIds.current.add(criticals[0].id);
      openModal("critical", criticals[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiAlerts, crisisMode]);

  // Filter banner alerts: when crisis mode is OFF, hide threat alerts and all-clear messages
  // (they are handled via modals). Only one type shows at a time.
  const isAllClear = (a: CriticalAlert) =>
    a.title.toLowerCase().includes("thank you for your cooperation") || a.title.toLowerCase().includes("situation is currently safe");
  const bannerAlerts = crisisMode
    ? alerts // During crisis: show everything including threats
    : alerts.filter((a) => a.severity !== "critical" && !isAllClear(a)); // Normal: hide threats & all-clear

  // Auto-rotate banner
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActiveIndex((prev) => (prev + 1) % bannerAlerts.length), 4000);
    return () => clearInterval(id);
  }, [paused, bannerAlerts.length]);

  if (bannerAlerts.length === 0) return null;

  const current = bannerAlerts[activeIndex % bannerAlerts.length];
  if (!current) return null;
  const s = severityConfig[current.severity] || severityConfig.advisory;
  const theme = modalType && modalType !== "detail" ? modalTheme[modalType] : null;

  // For detail modal, derive colors from the alert's severity
  const detailSeverity = modalType === "detail" && modalAlert ? modalAlert.severity : null;
  const detailConfig = detailSeverity ? severityConfig[detailSeverity] : null;

  // Open any alert in detail view when clicked
  const openDetailModal = (alert: CriticalAlert) => {
    setModalType("detail");
    setModalAlert(alert);
    setModalOpen(true);
  };

  return (
    <>
      {/* Detail Modal — for any alert type clicked from the banner */}
      {modalType === "detail" && modalAlert && (
        <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) dismissModal(); }}>
          <DialogContent
            showCloseButton={false}
            className={cn(
              "sm:max-w-lg max-h-[75vh] bg-[#0a0a0e] p-0 flex flex-col",
              detailSeverity === "critical" ? "border-danger/40" : detailSeverity === "warning" ? "border-amber/40" : "border-blue-400/40"
            )}
          >
            {/* Header */}
            <div className={cn("flex items-center gap-3 px-5 pt-5 pb-3 border-b border-border/30 shrink-0")}>
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border",
                detailSeverity === "critical" ? "bg-danger/10 border-danger/20" :
                detailSeverity === "warning" ? "bg-amber/10 border-amber/20" : "bg-blue-500/10 border-blue-500/20"
              )}>
                {modalAlert.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <Badge variant="outline" className={cn("text-[7px] border-0 font-bold", detailConfig?.bg, detailConfig?.text)}>
                    {detailConfig?.label}
                  </Badge>
                  <Badge variant="outline" className="text-[7px] border-0 bg-muted text-muted-foreground">
                    {modalAlert.category}
                  </Badge>
                </div>
                <p className="text-[9px] font-mono text-muted-foreground">
                  {modalAlert.source} &middot; {mounted ? formatTimeAgo(modalAlert.issuedAt) : "..."}
                </p>
              </div>
              <button onClick={dismissModal} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" weight="bold" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-none">
              <h3 className={cn("text-sm font-semibold leading-snug", detailConfig?.text)}>
                {modalAlert.title}
              </h3>
              {modalAlert.titleAr && (
                <h3 className={cn("text-sm font-semibold leading-snug text-right", detailConfig?.text)} dir="rtl">
                  {modalAlert.titleAr}
                </h3>
              )}

              {modalAlert.description && (
                <p className="text-xs text-muted-foreground leading-relaxed">{modalAlert.description}</p>
              )}
              {modalAlert.descriptionAr && (
                <p className="text-xs text-muted-foreground leading-relaxed text-right" dir="rtl">{modalAlert.descriptionAr}</p>
              )}

              {/* Seismic detail: show individual earthquakes */}
              {modalAlert.category === "SEISMIC" && quakes.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Recent Seismic Events</p>
                  <div className="space-y-1.5">
                    {quakes.slice(0, 10).map((q: any, i: number) => {
                      const mag = q.magnitude || 0;
                      const sevColor = mag >= 5 ? "text-danger" : mag >= 4 ? "text-amber" : "text-blue-400";
                      return (
                        <div key={i} className="flex items-center gap-2.5 bg-card/50 border border-border/30 rounded-lg px-3 py-2">
                          <div className={cn("text-lg font-bold font-mono w-10 text-center", sevColor)}>
                            {mag.toFixed(1)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-foreground/80 truncate">{q.place || q.location || "Unknown location"}</p>
                            <p className="text-[8px] font-mono text-muted-foreground">
                              Depth: {q.depth || "N/A"}km &middot; {mounted ? formatTimeAgo(q.time || q.timestamp) : "..."}
                            </p>
                          </div>
                          <Badge variant="outline" className={cn(
                            "text-[7px] border-0 font-bold",
                            mag >= 5 ? "bg-danger-dim text-danger" : mag >= 4 ? "bg-amber-dim text-amber" : "bg-blue-500/10 text-blue-400"
                          )}>
                            M{mag.toFixed(1)}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Meta info */}
              <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground border-t border-border/30 pt-3">
                <div className="flex items-center gap-1.5">
                  <MapPinIcon className="w-2.5 h-2.5" weight="bold" />
                  {modalAlert.regions.join(", ")}
                </div>
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-2.5 h-2.5" weight="bold" />
                  Until {new Date(modalAlert.expiresAt).toLocaleTimeString("en-US", {
                    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai",
                  })} GST
                </div>
              </div>

              {/* Emergency contacts */}
              <div className={cn(
                "border rounded-lg p-3",
                detailSeverity === "critical" ? "bg-danger/5 border-danger/15" :
                detailSeverity === "warning" ? "bg-amber/5 border-amber/15" : "bg-blue-500/5 border-blue-500/15"
              )}>
                <p className={cn("text-[9px] font-bold uppercase tracking-wider mb-1.5", detailConfig?.text)}>
                  Emergency Contacts / جهات الطوارئ
                </p>
                <div className="flex gap-4 text-[9px] font-mono text-muted-foreground">
                  <span>Emergency <strong className={detailConfig?.text}>999</strong></span>
                  <span>Civil Defense <strong className={detailConfig?.text}>997</strong></span>
                  <span>Ambulance <strong className={detailConfig?.text}>998</strong></span>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Unified Alert Modal (critical OR all-clear) */}
      {theme && (
        <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) dismissModal(); }}>
          <DialogContent
            showCloseButton={false}
            className={cn("sm:max-w-xl max-h-[70vh] bg-[#0a0a0e] p-0 flex flex-col", theme.borderColor, theme.shadowTint)}
          >
            {/* Fixed header */}
            <div className={cn("flex flex-col items-center gap-2.5 pt-5 pb-3 px-5 shrink-0 border-b", theme.divider)}>
              <div className="relative">
                <div className={cn("absolute inset-0 rounded-full animate-ping", theme.bgTint)}
                  style={modalType === "allclear" ? { animationDuration: "2s" } : undefined} />
                <div className={cn("relative w-12 h-12 rounded-full flex items-center justify-center border", theme.bgTint, theme.borderTint)}>
                  <theme.Icon className={cn("w-6 h-6", theme.colorClass)} weight="duotone" />
                </div>
              </div>
              <Badge className={cn("text-white border-0 text-[10px] font-bold tracking-widest px-3", theme.badgeBg)}>
                {theme.label}
              </Badge>
            </div>

            {/* Scrollable middle */}
            {modalAlert && (
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-none">
                {/* English */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={cn("text-[8px]", theme.badgeBorder, theme.badgeText, theme.badgeTintBg)}>
                      {modalAlert.category}
                    </Badge>
                    <span className="text-[9px] font-mono text-muted-foreground">{modalAlert.source}</span>
                  </div>
                  <h3 className={cn("text-sm font-semibold leading-snug", theme.colorClass)}>
                    {modalAlert.title}
                  </h3>
                  {modalAlert.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{modalAlert.description}</p>
                  )}
                </div>

                {/* Arabic */}
                {modalAlert.titleAr && (
                  <div className={cn("space-y-2 border-t pt-3", theme.divider)} dir="rtl">
                    <h3 className={cn("text-sm font-semibold leading-snug text-right", theme.colorClass)}>
                      {modalAlert.titleAr}
                    </h3>
                    {modalAlert.descriptionAr && (
                      <p className="text-xs text-muted-foreground leading-relaxed text-right">{modalAlert.descriptionAr}</p>
                    )}
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground border-t border-border/50 pt-2">
                  <div className="flex items-center gap-1.5">
                    <MapPinIcon className="w-2.5 h-2.5" weight="bold" />
                    {modalAlert.regions.join(", ")}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ClockIcon className="w-2.5 h-2.5" weight="bold" />
                    {mounted ? formatTimeAgo(modalAlert.issuedAt) : "..."}
                  </div>
                </div>

                {/* Instructions */}
                <div className={cn("border rounded-lg p-3 space-y-1.5", theme.infoBg, theme.infoBorder)}>
                  <p className={cn("text-[10px] font-bold uppercase tracking-wider", theme.colorClass)}>
                    {theme.instructionsTitle}
                  </p>
                  <ul className="text-[11px] text-foreground/80 space-y-1 list-none">
                    {theme.instructions.map((inst, i) => (
                      <li key={i}>{inst.text} <strong className={theme.colorClass}>{inst.highlight}</strong></li>
                    ))}
                  </ul>
                  <div className="flex gap-4 pt-1 text-[9px] font-mono text-muted-foreground">
                    <span>Emergency <strong className={theme.colorClass}>999</strong></span>
                    <span>Civil Defense <strong className={theme.colorClass}>997</strong></span>
                    <span>Ambulance <strong className={theme.colorClass}>998</strong></span>
                  </div>
                </div>

                {modalType === "allclear" && (
                  <p className="text-[9px] text-muted-foreground/50 font-mono text-center">
                    This message will auto-dismiss in 5 minutes
                  </p>
                )}
              </div>
            )}

            {/* Fixed footer */}
            <div className={cn("shrink-0 px-5 pb-5 pt-3 border-t", theme.divider)}>
              <button
                onClick={dismissModal}
                className={cn("w-full py-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer", theme.btnBg, theme.colorClass)}
              >
                Acknowledge & Dismiss
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Regular banner — clickable to open detail */}
      <div
        className={cn(
          "w-full border-b shrink-0 transition-colors duration-500 border-l-2 cursor-pointer",
          s.bg, s.border,
          current.severity === "critical" ? "border-l-danger" :
          current.severity === "warning" ? "border-l-amber" : "border-l-blue-400"
        )}
        onClick={() => openDetailModal(current)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="max-w-[1920px] mx-auto px-2 sm:px-3 py-1 sm:py-1.5">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Badge variant="outline" className={cn("text-[7px] sm:text-[8px] gap-1 shrink-0 border-0 font-bold", s.bg, s.text)}>
              <WarningIcon className={cn("w-2.5 h-2.5", current.severity !== "advisory" && "pulse-live")} weight="bold" />
              <span className="hidden sm:inline">{bannerAlerts.length} ALERT{bannerAlerts.length > 1 ? "S" : ""}</span>
              <span className="sm:hidden">{bannerAlerts.length}</span>
            </Badge>

            <Badge variant="outline" className={cn("text-[7px] shrink-0 border-0 font-bold", s.bg, s.text)}>
              {s.label}
            </Badge>
            <Badge variant="outline" className="text-[7px] shrink-0 border-0 bg-muted text-muted-foreground hidden sm:flex">
              {current.category}
            </Badge>

            <div key={current.id} className="flex items-center gap-1.5 flex-1 min-w-0 animate-in fade-in slide-in-from-bottom-1 duration-300">
              <span className={cn("shrink-0", s.text)}>{current.icon}</span>
              <p className={cn("text-[11px] font-medium truncate", s.text)}>{current.title}</p>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); openDetailModal(current); }}
              className={cn("text-[8px] font-bold hover:underline cursor-pointer shrink-0", s.text)}
            >
              VIEW
            </button>

            <span className="hidden lg:flex items-center gap-0.5 text-[7px] font-mono text-muted-foreground shrink-0">
              <MapPinIcon className="w-2 h-2" weight="bold" />
              {current.regions.join(" / ")}
            </span>

            <div className="hidden md:flex items-center gap-1 shrink-0 text-[7px] font-mono text-muted-foreground">
              <ClockIcon className="w-2 h-2" weight="bold" />
              {mounted ? formatTimeAgo(current.issuedAt) : "..."}
              <span className="text-border/50">·</span>
              Until {new Date(current.expiresAt).toLocaleTimeString("en-US", {
                hour: "2-digit", minute: "2-digit", timeZone: "Asia/Dubai",
              })} GST
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-auto">
              {bannerAlerts.map((a, i) => {
                const ac = severityConfig[a.severity] || severityConfig.advisory;
                return (
                  <button
                    key={a.id}
                    onClick={() => setActiveIndex(i)}
                    className={cn(
                      "rounded-full transition-all duration-300 cursor-pointer",
                      i === activeIndex
                        ? cn("w-4 h-1.5", ac.dot)
                        : cn("w-1.5 h-1.5 opacity-40 hover:opacity-70", ac.dot)
                    )}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
