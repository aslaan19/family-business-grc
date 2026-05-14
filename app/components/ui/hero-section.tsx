/* eslint-disable react-hooks/rules-of-hooks */
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
  useScroll,
  useInView,
} from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Shield,
  TrendingUp,
  Users,
  Building2,
  CheckCircle2,
  ChevronDown,
  BarChart3,
  Zap,
  Award,
} from "lucide-react";
import { useLanguage } from "../../lib/language-context";
import { cn } from "../../lib/utils";

// ─── TYPES ─────────────────────────────────────────────────────────────────────
type Dir = "rtl" | "ltr";

// ─── ANIMATED COUNTER ──────────────────────────────────────────────────────────
function AnimatedCounter({
  value,
  suffix = "",
  delay = 0,
}: {
  value: number;
  suffix?: string;
  delay?: number;
}) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => {
      const start = Date.now();
      const dur = 1800;
      const tick = () => {
        const p = Math.min((Date.now() - start) / dur, 1);
        const e = 1 - Math.pow(1 - p, 3);
        setCount(Math.floor(e * value));
        if (p < 1) requestAnimationFrame(tick);
      };
      tick();
    }, delay * 1000);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <>
      {count}
      {suffix}
    </>
  );
}

// ─── GLOWING LINE CHART ────────────────────────────────────────────────────────
function GlowingLineChart() {
  const pathRef = useRef<SVGPathElement>(null);
  const [len, setLen] = useState(0);
  useEffect(() => {
    if (pathRef.current) setLen(pathRef.current.getTotalLength());
  }, []);

  const points =
    "M 20 115 C 50 110 70 95 100 80 S 150 55 190 42 S 240 28 275 18";
  const areaPoints = points + " L 275 130 L 20 130 Z";

  return (
    <svg viewBox="0 0 300 145" className="w-full h-full" aria-hidden>
      <defs>
        <linearGradient id="hLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
          <stop offset="40%" stopColor="#10b981" stopOpacity="1" />
          <stop offset="100%" stopColor="#059669" stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id="hAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
        <filter id="hGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Grid lines */}
      {[28, 56, 84, 112].map((y, i) => (
        <motion.line
          key={y}
          x1="20"
          y1={y}
          x2="278"
          y2={y}
          stroke="#e5e7eb"
          strokeWidth="0.8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.2 + i * 0.05 }}
        />
      ))}

      {/* Area fill */}
      <motion.path
        d={areaPoints}
        fill="url(#hAreaGrad)"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      />

      {/* Main line */}
      <motion.path
        ref={pathRef}
        d={points}
        fill="none"
        stroke="url(#hLineGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
        filter="url(#hGlow)"
        initial={{ strokeDasharray: len, strokeDashoffset: len }}
        animate={{ strokeDashoffset: 0 }}
        transition={{ duration: 1.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      />

      {/* Data points */}
      {[
        [100, 80],
        [190, 42],
        [275, 18],
      ].map(([cx, cy], i) => (
        <motion.g
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.6 + i * 0.15, type: "spring", stiffness: 300 }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
        >
          <circle cx={cx} cy={cy} r="10" fill="#10b981" fillOpacity="0.15" />
          <circle cx={cx} cy={cy} r="4" fill="#10b981" />
          <motion.circle
            cx={cx}
            cy={cy}
            r="10"
            stroke="#10b981"
            strokeWidth="1.5"
            fill="none"
            animate={{ r: [10, 18, 10], opacity: [0.5, 0, 0.5] }}
            transition={{ delay: 2 + i * 0.2, duration: 2.5, repeat: Infinity }}
          />
        </motion.g>
      ))}

      {/* Value callout at last point */}
      <motion.g
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.3, duration: 0.5 }}
      >
        <rect x="250" y="0" width="46" height="16" rx="4" fill="#10b981" />
        <text
          x="273"
          y="11.5"
          textAnchor="middle"
          fontSize="8"
          fontWeight="700"
          fill="white"
        >
          +150%
        </text>
      </motion.g>
    </svg>
  );
}

// ─── CIRCULAR PROGRESS ─────────────────────────────────────────────────────────
function CircularProgress({
  value,
  label,
  delay,
  size = 90,
}: {
  value: number;
  label: string;
  delay: number;
  size?: number;
}) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            className="text-border"
            strokeWidth="5"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="currentColor"
            className="text-emerald-500"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (value / 100) * circ }}
            transition={{ delay: delay + 0.2, duration: 1.4, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-base font-bold text-foreground tabular-nums">
            <AnimatedCounter value={value} suffix="%" delay={delay + 0.4} />
          </span>
        </div>
      </div>
      <span className="text-[11px] text-muted-foreground text-center font-medium leading-tight">
        {label}
      </span>
    </div>
  );
}

// ─── TICKER ────────────────────────────────────────────────────────────────────
function Ticker({ dir }: { dir: Dir }) {
  const items = [
    {
      label: dir === "rtl" ? "مؤشر الحوكمة" : "Governance Index",
      value: "+12.4%",
    },
    {
      label: dir === "rtl" ? "إدارة المخاطر" : "Risk Management",
      value: "+8.7%",
    },
    { label: dir === "rtl" ? "الامتثال" : "Compliance Score", value: "98.2%" },
    {
      label: dir === "rtl" ? "رضا العملاء" : "Client Satisfaction",
      value: "+15.3%",
    },
    {
      label: dir === "rtl" ? "العائد على الاستثمار" : "Average ROI",
      value: "+24%",
    },
    {
      label: dir === "rtl" ? "المشاريع المكتملة" : "Projects Delivered",
      value: "100+",
    },
  ];
  const doubled = [...items, ...items, ...items];

  return (
    <div className="relative overflow-hidden">
      {/* Fade edges */}
      <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex items-center gap-0 shrink-0"
        animate={{ x: dir === "rtl" ? [0, "33.33%"] : [0, "-33.33%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-5 py-3 whitespace-nowrap shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[12px] font-medium text-muted-foreground">
              {item.label}
            </span>
            <span className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
              {item.value}
            </span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── DASHBOARD CARD (right side) ───────────────────────────────────────────────
function DashboardPanel({ dir, t }: { dir: Dir; t: (k: string) => string }) {
  const [isMobile, setIsMobile] = useState(true);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 1024);
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const cardBase =
    "bg-white dark:bg-card border border-border/60 rounded-2xl shadow-sm";

  return (
    <div className={cn("relative w-full", !isMobile && "h-[540px]")}>
      {isMobile ? (
        /* ── Mobile: clean vertical stack ── */
        <div className="flex flex-col gap-4">
          {/* Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={cn(cardBase, "p-5")}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t("hero.growth")}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {t("hero.chart.period")}
                  </p>
                </div>
              </div>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 2.2, type: "spring", stiffness: 300 }}
                className="px-2.5 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold"
              >
                +150%
              </motion.span>
            </div>
            <div className="h-32">
              <GlowingLineChart />
            </div>
          </motion.div>

          {/* 2-col metrics */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                icon: Shield,
                value: 98,
                suffix: "%",
                label: t("hero.compliance"),
                accent: true,
              },
              {
                icon: TrendingUp,
                value: 24,
                suffix: "%",
                label: t("hero.roi"),
                accent: false,
              },
            ].map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + i * 0.1, duration: 0.5 }}
                className={cn(cardBase, "p-4 flex items-center gap-3")}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    m.accent ? "bg-emerald-500" : "bg-emerald-500/10",
                  )}
                >
                  <m.icon
                    className={cn(
                      "w-5 h-5",
                      m.accent ? "text-white" : "text-emerald-600",
                    )}
                  />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground tabular-nums">
                    <AnimatedCounter
                      value={m.value}
                      suffix={m.suffix}
                      delay={0.8 + i * 0.1}
                    />
                  </p>
                  <p className="text-[11px] text-muted-foreground">{m.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Circular progress row */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
            className={cn(cardBase, "p-5")}
          >
            <div className="flex justify-around">
              <CircularProgress
                value={92}
                label={t("hero.satisfaction")}
                delay={1}
                size={84}
              />
              <CircularProgress
                value={87}
                label={t("hero.efficiency")}
                delay={1.15}
                size={84}
              />
            </div>
          </motion.div>
        </div>
      ) : (
        /* ── Desktop: overlapping floating cards ── */
        <>
          {/* Main chart card — center */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              cardBase,
              "absolute inset-x-0 top-14 p-7 shadow-xl z-10",
            )}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {t("hero.growth")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("hero.chart.period")}
                  </p>
                </div>
              </div>
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.2, type: "spring" }}
                className="px-3 py-1.5 rounded-full bg-emerald-500 text-white text-sm font-bold shadow-md shadow-emerald-500/25"
              >
                +150%
              </motion.span>
            </div>
            <div className="h-44">
              <GlowingLineChart />
            </div>
          </motion.div>

          {/* Compliance card — top */}
          <motion.div
            initial={{ opacity: 0, x: dir === "rtl" ? -30 : 30, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              cardBase,
              "absolute top-0 z-20 p-4 shadow-lg",
              dir === "rtl" ? "left-0" : "right-0",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3.5",
                dir === "ltr" && "flex-row-reverse",
              )}
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/25">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className={dir === "ltr" ? "text-left" : "text-right"}>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  <AnimatedCounter value={98} suffix="%" delay={1.1} />
                </p>
                <p className="text-[11px] text-muted-foreground font-medium">
                  {t("hero.compliance")}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Circular progress card — bottom */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              cardBase,
              "absolute bottom-0 z-20 p-5 shadow-lg",
              dir === "rtl" ? "right-4" : "left-4",
            )}
          >
            <div className="flex gap-6">
              <CircularProgress
                value={92}
                label={t("hero.satisfaction")}
                delay={1.2}
                size={84}
              />
              <CircularProgress
                value={87}
                label={t("hero.efficiency")}
                delay={1.35}
                size={84}
              />
            </div>
          </motion.div>

          {/* ROI side card */}
          <motion.div
            initial={{ opacity: 0, x: dir === "rtl" ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className={cn(
              cardBase,
              "absolute top-1/2 -translate-y-1/2 z-20 p-4 shadow-lg",
              dir === "rtl" ? "-right-10 lg:-right-14" : "-left-10 lg:-left-14",
            )}
          >
            <div
              className={cn(
                "flex items-center gap-3",
                dir === "ltr" && "flex-row-reverse",
              )}
            >
              <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-teal-600" />
              </div>
              <div className={dir === "ltr" ? "text-left" : "text-right"}>
                <p className="text-lg font-bold text-foreground tabular-nums">
                  <AnimatedCounter value={24} suffix="%" delay={1.5} />
                </p>
                <p className="text-[10px] text-muted-foreground font-medium">
                  {t("hero.roi")}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Subtle notification card — floating */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
            className={cn(
              cardBase,
              "absolute z-20 p-3 shadow-lg",
              dir === "rtl" ? "left-2 top-[58%]" : "right-2 top-[58%]",
            )}
          >
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-background" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-foreground whitespace-nowrap">
                  {dir === "rtl" ? "تقرير جديد جاهز" : "New report ready"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {dir === "rtl" ? "الآن" : "Just now"}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}

// ─── BACKGROUND ELEMENTS ───────────────────────────────────────────────────────
function BackgroundAtmosphere() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      aria-hidden
    >
      {/* Primary orb */}
      <motion.div
        className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.75 0.15 155 / 0.07) 0%, transparent 70%)",
        }}
        animate={{ scale: [1, 1.08, 1], rotate: [0, 15, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Secondary orb */}
      <motion.div
        className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.65 0.12 175 / 0.06) 0%, transparent 70%)",
        }}
        animate={{ scale: [1.08, 1, 1.08], rotate: [0, -20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.022]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Accent line — horizontal rule near top */}
      <motion.div
        className="absolute top-[72px] inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

// ─── CURSOR FOLLOWER ────────────────────────────────────────────────────────────
function CursorFollower() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { damping: 35, stiffness: 180 });
  const sy = useSpring(my, { damping: 35, stiffness: 180 });

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      mx.set(e.clientX - 200);
      my.set(e.clientY - 200);
    };
    window.addEventListener("mousemove", fn);
    return () => window.removeEventListener("mousemove", fn);
  }, [mx, my]);

  return (
    <motion.div
      className="fixed w-[400px] h-[400px] rounded-full pointer-events-none z-0"
      style={{
        x: sx,
        y: sy,
        background:
          "radial-gradient(circle, oklch(0.75 0.15 155 / 0.04) 0%, transparent 70%)",
      }}
    />
  );
}

// ─── HERO SECTION ──────────────────────────────────────────────────────────────
export function HeroSection() {
  const { t, dir } = useLanguage();
  const isRTL = dir === "rtl";
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 1024);
    fn();
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  const features = [t("hero.feature1"), t("hero.feature2"), t("hero.feature3")];
  const stats = [
    { value: 100, suffix: "+", label: t("hero.stat1.label"), icon: Building2 },
    { value: 15, suffix: "+", label: t("hero.stat2.label"), icon: Award },
    { value: 50, suffix: "+", label: t("hero.stat3.label"), icon: Users },
  ];

  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      <BackgroundAtmosphere />
      {!isMobile && <CursorFollower />}

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-12">
        {/* ── TICKER BAR ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="pt-16 sm:pt-20 pb-2 border-b border-border/40"
        >
          <Ticker dir={dir} />
        </motion.div>

        {/* ── MAIN GRID ── */}
        <div
          className={cn(
            "grid gap-10 lg:gap-20 items-center py-12 lg:py-0 lg:min-h-[calc(100vh-92px)]",
            "lg:grid-cols-[1fr_1fr]",
          )}
        >
          {/* ══ CONTENT COLUMN ══ */}
          <div
            className={cn(
              "relative z-10",
              isRTL ? "lg:order-2 text-right" : "lg:order-1 text-left",
            )}
          >
            {/* Headline */}
            <div className="mb-7 overflow-hidden">
              <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[4.25rem] font-bold text-foreground leading-[1.08] tracking-tight">
                {/* Line 1 */}
                <motion.span
                  className="block"
                  initial={{ opacity: 0, y: 56 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.25,
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {t("hero.title.line1")}
                </motion.span>
                {/* Line 2 — accent color */}
                <motion.span
                  className="block text-emerald-600 dark:text-emerald-400 mt-1"
                  initial={{ opacity: 0, y: 56 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.38,
                    duration: 0.7,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  {t("hero.title.line2")}
                </motion.span>
              </motion.h1>
            </div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="text-base lg:text-lg text-muted-foreground leading-relaxed max-w-lg mb-8"
            >
              {t("hero.description")}
            </motion.p>

            {/* Feature checklist */}
            <motion.div
              className="flex flex-col gap-2.5 mb-9"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
            >
              {features.map((feat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: isRTL ? 24 : -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: 0.72 + i * 0.08,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className={cn(
                    "flex items-center gap-3",
                    !isRTL && "flex-row-reverse justify-end",
                  )}
                >
                  <span className="text-sm font-medium text-foreground/80">
                    {feat}
                  </span>
                  <div className="w-5 h-5 rounded-full bg-emerald-500/12 flex items-center justify-center shrink-0">
                    <CheckCircle2
                      className="w-3.5 h-3.5 text-emerald-600"
                      strokeWidth={2.5}
                    />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.95, duration: 0.55 }}
              className={cn(
                "flex flex-col sm:flex-row gap-3 mb-10",
                !isRTL && "sm:flex-row-reverse sm:justify-end",
              )}
            >
              {/* Primary CTA */}
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "group inline-flex items-center justify-center gap-3",
                  "bg-emerald-600 hover:bg-emerald-700 text-white",
                  "px-7 py-3.5 rounded-full font-semibold text-[15px]",
                  "shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/30",
                  "transition-all duration-200",
                )}
              >
                {t("hero.cta.primary")}
                <motion.span
                  className="shrink-0"
                  whileHover={{ x: isRTL ? -4 : 4 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <ArrowIcon className="w-4 h-4" />
                </motion.span>
              </motion.a>

              {/* Secondary CTA */}
              <motion.a
                href="#services"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "inline-flex items-center justify-center gap-2",
                  "bg-white dark:bg-card border border-border",
                  "text-foreground px-7 py-3.5 rounded-full font-semibold text-[15px]",
                  "hover:bg-muted/40 transition-all duration-200 shadow-sm",
                )}
              >
                {t("hero.cta.secondary")}
              </motion.a>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className={cn(
                "pt-8 border-t border-border/50",
                "grid grid-cols-3 gap-6",
              )}
            >
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.18 + i * 0.08 }}
                  className={cn("group", isRTL ? "text-right" : "text-left")}
                >
                  <div
                    className={cn(
                      "flex items-baseline gap-1 mb-1",
                      !isRTL && "justify-start",
                    )}
                  >
                    <span className="text-3xl lg:text-4xl font-bold text-foreground tabular-nums tracking-tight">
                      <AnimatedCounter
                        value={s.value}
                        suffix={s.suffix}
                        delay={1.25 + i * 0.08}
                      />
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium leading-snug">
                    {s.label}
                  </p>
                  {/* Subtle underline accent */}
                  <motion.div
                    className="mt-1.5 h-px bg-emerald-500/30 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1.4 + i * 0.08, duration: 0.5 }}
                    style={{ transformOrigin: isRTL ? "right" : "left" }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* ══ GRAPHICS COLUMN ══ */}
          <div className={cn("w-full", isRTL ? "lg:order-1" : "lg:order-2")}>
            <DashboardPanel dir={dir} t={t} />
          </div>
        </div>

        {/* ── SCROLL INDICATOR ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 text-muted-foreground/50"
        >
          <span className="text-[10px] font-medium uppercase tracking-widest">
            {dir === "rtl" ? "اكتشف المزيد" : "Explore"}
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
