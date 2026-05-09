"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Mail,
  Loader2,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Shield,
  FileText,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Award,
  Target,
  Search,
  ChevronRight,
  Lock,
  Eye,
  Crown,
  Briefcase,
  Building2,
  Calendar,
  Users,
  Sparkles,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Question {
  categoryKey: string;
  categoryOrder: number;
  questionOrder: number;
  questionEn: string;
  questionAr: string;
}

interface Answer {
  id: string;
  selectedLabel: string;
  selectedValue: number;
  question: Question;
}

interface AssessmentData {
  id: string;
  totalScore: number;
  maxScore: number;
  pct: number | null;
  submittedAt: string;
  answers: Answer[];
  catBreakdown: Record<string, { score: number; max: number; pct: number }>;
}

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  organization: string | null;
  createdAt: string;
  stage: string;
  assessment1: AssessmentData | null;
  assessment2: AssessmentData | null;
}

// ─── Premium Executive Design Tokens ────────────────────────────────────────────

const EXECUTIVE = {
  // Dark Forest Greens
  forest: {
    950: "#021008",
    900: "#041A0F",
    850: "#062616",
    800: "#0A3320",
    700: "#0F4A2D",
    600: "#15613A",
    500: "#1B7847",
    400: "#259456",
    300: "#3DB872",
    200: "#6AD498",
    100: "#A8E9C3",
    50: "#E5F7ED",
  },
  // Warm Ivory / Cream (not pure white)
  cream: {
    50: "#FEFCF8",
    100: "#FBF8F1",
    200: "#F7F2E7",
    300: "#F0E9D8",
    400: "#E8DDC6",
    500: "#D9CAA8",
  },
  // Gold Accents
  gold: {
    600: "#8B6914",
    500: "#B8891C",
    400: "#D4A024",
    300: "#E8B93D",
    200: "#F5D67A",
    100: "#FBF0C9",
  },
  // Charcoal for text
  charcoal: {
    900: "#111827",
    800: "#1F2937",
    700: "#374151",
    600: "#4B5563",
    500: "#6B7280",
    400: "#9CA3AF",
    300: "#D1D5DB",
  },
};

// ─── Score Styling ──────────────────────────────────────────────────────────────

function scoreStyle(pct: number) {
  if (pct >= 80)
    return {
      label: "Excellent",
      labelAr: "ممتاز",
      color: EXECUTIVE.forest[500],
      bg: EXECUTIVE.forest[50],
      ring: EXECUTIVE.forest[200],
      text: "emerald",
    };
  if (pct >= 60)
    return {
      label: "Good",
      labelAr: "جيد",
      color: EXECUTIVE.forest[600],
      bg: EXECUTIVE.cream[200],
      ring: EXECUTIVE.forest[300],
      text: "sky",
    };
  if (pct >= 40)
    return {
      label: "Average",
      labelAr: "متوسط",
      color: EXECUTIVE.gold[500],
      bg: EXECUTIVE.gold[100],
      ring: EXECUTIVE.gold[300],
      text: "amber",
    };
  return {
    label: "Needs Work",
    labelAr: "يحتاج تحسين",
    color: "#991B1B",
    bg: "#FEF2F2",
    ring: "#FECACA",
    text: "red",
  };
}

function catColor(pct: number): string {
  if (pct >= 70) return EXECUTIVE.forest[500];
  if (pct >= 50) return EXECUTIVE.gold[500];
  return "#DC2626";
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function groupAnswers(answers: Answer[]) {
  return answers.reduce<Record<string, Answer[]>>((acc, a) => {
    (acc[a.question.categoryKey] ??= []).push(a);
    return acc;
  }, {});
}

// ─── CHART: Executive Arc Donut ─────────────────────────────────────────────────

function ExecutiveDonut({ pct }: { pct: number }) {
  const r = 80;
  const stroke = 14;
  const circ = 2 * Math.PI * r;
  const ss = scoreStyle(pct);
  const dash = (pct / 100) * circ;

  return (
    <div className="relative" style={{ width: 220, height: 220 }}>
      {/* Outer decorative ring */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${EXECUTIVE.gold[400]}15, ${EXECUTIVE.forest[700]}10, ${EXECUTIVE.gold[400]}15)`,
          padding: 4,
        }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{ background: EXECUTIVE.forest[900] }}
        />
      </div>

      <svg
        viewBox="0 0 220 220"
        className="absolute inset-0 w-full h-full"
        style={{ transform: "rotate(-90deg)" }}
      >
        <defs>
          <filter id="donutGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="execArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={EXECUTIVE.gold[400]} />
            <stop offset="50%" stopColor={EXECUTIVE.cream[200]} />
            <stop offset="100%" stopColor={EXECUTIVE.gold[400]} />
          </linearGradient>
        </defs>

        {/* Track */}
        <circle
          cx="110"
          cy="110"
          r={r}
          fill="none"
          stroke={EXECUTIVE.forest[800]}
          strokeWidth={stroke}
        />

        {/* Progress Arc */}
        <circle
          cx="110"
          cy="110"
          r={r}
          fill="none"
          stroke="url(#execArcGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          filter="url(#donutGlow)"
          style={{ transition: "stroke-dasharray 1.5s ease-out" }}
        />

        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((t) => {
          const angle = (t / 100) * 2 * Math.PI - Math.PI / 2;
          const x1 = 110 + (r - 10) * Math.cos(angle);
          const y1 = 110 + (r - 10) * Math.sin(angle);
          const x2 = 110 + (r + 3) * Math.cos(angle);
          const y2 = 110 + (r + 3) * Math.sin(angle);
          return (
            <line
              key={t}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={EXECUTIVE.gold[400]}
              strokeWidth="2"
              opacity={0.5}
            />
          );
        })}
      </svg>

      {/* Center Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="relative">
          <span
            className="text-5xl font-black tracking-tight"
            style={{
              color: EXECUTIVE.cream[100],
              fontFamily: "'Playfair Display', Georgia, serif",
              textShadow: `0 0 40px ${EXECUTIVE.gold[400]}40`,
            }}
          >
            {pct}
            <span className="text-3xl" style={{ color: EXECUTIVE.gold[400] }}>
              %
            </span>
          </span>
        </div>
        <div
          className="flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full"
          style={{ background: `${EXECUTIVE.gold[400]}20` }}
        >
          <Crown className="w-3 h-3" style={{ color: EXECUTIVE.gold[400] }} />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{ color: EXECUTIVE.gold[400] }}
          >
            {ss.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── CHART: Premium Pie Chart ───────────────────────────────────────────────────
function PremiumPieChart({
  yes,
  partial,
  no,
  total,
}: {
  yes: number;
  partial: number;
  no: number;
  total: number;
}) {
  const segments = [
    {
      value: yes,
      color: EXECUTIVE.forest[500],
      label: "Compliant",
      pct: Math.round((yes / total) * 100),
    },
    {
      value: partial,
      color: EXECUTIVE.gold[500],
      label: "Partial",
      pct: Math.round((partial / total) * 100),
    },
    {
      value: no,
      color: "#DC2626",
      label: "Gap",
      pct: Math.round((no / total) * 100),
    },
  ];

  const cx = 100,
    cy = 100,
    r = 80,
    innerR = 48;
  let cumulative = 0;

  const slices = segments.map((seg) => {
    const s = cumulative;
    const slice = (seg.value / total) * 360;
    cumulative += slice;
    const toRad = (deg: number) => ((deg - 90) * Math.PI) / 180;
    const sR = toRad(s),
      eR = toRad(s + slice);
    const large = slice > 180 ? 1 : 0;
    const x1 = cx + r * Math.cos(sR),
      y1 = cy + r * Math.sin(sR);
    const x2 = cx + r * Math.cos(eR),
      y2 = cy + r * Math.sin(eR);
    const xi1 = cx + innerR * Math.cos(sR),
      yi1 = cy + innerR * Math.sin(sR);
    const xi2 = cx + innerR * Math.cos(eR),
      yi2 = cy + innerR * Math.sin(eR);
    const d = `M ${xi1} ${yi1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi2} ${yi2} A ${innerR} ${innerR} 0 ${large} 0 ${xi1} ${yi1} Z`;
    return { ...seg, d };
  });

  return (
    <div className="flex items-center gap-10">
      {/* Donut — larger */}
      <div className="shrink-0">
        <svg viewBox="0 0 200 200" width={200} height={200}>
          {slices.map((s, i) => (
            <path
              key={i}
              d={s.d}
              fill={s.color}
              className="transition-opacity duration-300 hover:opacity-80"
            />
          ))}
          {/* Inner circle */}
          <circle cx={cx} cy={cy} r={innerR - 2} fill={EXECUTIVE.forest[900]} />
          <text
            x={cx}
            y={cy - 6}
            textAnchor="middle"
            fontSize="18"
            fontWeight="900"
            fill={EXECUTIVE.cream[100]}
          >
            {total}
          </text>
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            fontSize="9"
            fontWeight="700"
            fill={EXECUTIVE.cream[500]}
            letterSpacing="0.12em"
          >
            TOTAL
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-5 flex-1 min-w-0">
        {slices.map((s, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    background: s.color,
                    boxShadow: `0 0 8px ${s.color}70`,
                  }}
                />
                <span
                  className="text-sm font-bold"
                  style={{ color: EXECUTIVE.cream[300] }}
                >
                  {s.label}
                </span>
              </div>
              <span
                className="text-sm font-black shrink-0"
                style={{ color: s.color }}
              >
                {s.value}
                <span
                  className="text-xs font-normal ml-1"
                  style={{ color: EXECUTIVE.cream[500] }}
                >
                  ({s.pct}%)
                </span>
              </span>
            </div>
            {/* Progress bar */}
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: EXECUTIVE.forest[800] }}
            >
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${s.pct}%`, background: s.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CHART: Executive Radar ─────────────────────────────────────────────────────
function ExecutiveRadar({ data }: { data: { label: string; pct: number }[] }) {
  const size = 280;
  const cx = 140,
    cy = 140,
    R = 90;
  const n = data.length;
  const step = (2 * Math.PI) / n;
  const start = -Math.PI / 2;

  const polar = (r: number, i: number) => ({
    x: cx + r * Math.cos(start + i * step),
    y: cy + r * Math.sin(start + i * step),
  });

  const rings = [25, 50, 75, 100];
  const pts = data.map((d, i) => polar((d.pct / 100) * R, i));
  const poly =
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  // Short abbreviations for each domain
  const abbreviations = ["BG", "RM", "CO", "IA", "TR", "ET","CM"];

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8">
      {/* Radar Chart */}
      <div className="relative">
        <svg viewBox={`0 0 ${size} ${size}`} className="w-[280px] h-[280px]">
          <defs>
            <radialGradient id="execRadarFill">
              <stop
                offset="0%"
                stopColor={EXECUTIVE.gold[400]}
                stopOpacity="0.5"
              />
              <stop
                offset="100%"
                stopColor={EXECUTIVE.forest[500]}
                stopOpacity="0.15"
              />
            </radialGradient>
            <filter id="radarGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient
              id="radarStroke"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor={EXECUTIVE.gold[300]} />
              <stop offset="50%" stopColor={EXECUTIVE.gold[400]} />
              <stop offset="100%" stopColor={EXECUTIVE.gold[500]} />
            </linearGradient>
          </defs>

          {/* Concentric rings */}
          {rings.map((rv, ri) => (
            <polygon
              key={rv}
              points={data
                .map((_, i) => {
                  const p = polar((rv / 100) * R, i);
                  return `${p.x},${p.y}`;
                })
                .join(" ")}
              fill="none"
              stroke={rv === 100 ? EXECUTIVE.gold[400] : EXECUTIVE.forest[700]}
              strokeWidth={rv === 100 ? 2 : 1}
              strokeDasharray={rv !== 100 ? "3 6" : undefined}
              opacity={rv === 100 ? 0.6 : 0.25 + ri * 0.05}
            />
          ))}

          {/* Axis lines */}
          {data.map((_, i) => {
            const p = polar(R, i);
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={p.x}
                y2={p.y}
                stroke={EXECUTIVE.forest[600]}
                strokeWidth="1"
                strokeDasharray="2 4"
                opacity={0.5}
              />
            );
          })}

          {/* Data polygon with glow */}
          <path
            d={poly}
            fill="url(#execRadarFill)"
            stroke="url(#radarStroke)"
            strokeWidth="3"
            strokeLinejoin="round"
            filter="url(#radarGlow)"
          />

          {/* Data points with abbreviations */}
          {pts.map((p, i) => {
            const abbr = abbreviations[i] || (i + 1).toString();
            return (
              <g key={i}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r="16"
                  fill={EXECUTIVE.forest[800]}
                  stroke={EXECUTIVE.gold[400]}
                  strokeWidth="2"
                />
                <text
                  x={p.x}
                  y={p.y + 4}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="800"
                  fill={EXECUTIVE.cream[100]}
                  fontFamily="'Inter', sans-serif"
                >
                  {abbr}
                </text>
              </g>
            );
          })}

          {/* Center decoration */}
          <circle
            cx={cx}
            cy={cy}
            r="10"
            fill={EXECUTIVE.forest[700]}
            stroke={EXECUTIVE.gold[400]}
            strokeWidth="2"
            opacity="0.8"
          />
          <circle cx={cx} cy={cy} r="4" fill={EXECUTIVE.gold[400]} />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-3 min-w-[200px]">
        <div
          className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2"
          style={{ color: EXECUTIVE.cream[400] }}
        >
          Domain Legend
        </div>
        {data.map((d, i) => {
          const abbr = abbreviations[i] || (i + 1).toString();
          const cc = catColor(d.pct);
          return (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold shrink-0"
                style={{
                  background: EXECUTIVE.forest[800],
                  border: `2px solid ${EXECUTIVE.gold[400]}`,
                  color: EXECUTIVE.cream[100],
                }}
              >
                {abbr}
              </div>
              <div className="flex-1 min-w-0">
                <div
                  className="text-[11px] font-semibold truncate"
                  style={{ color: EXECUTIVE.cream[200] }}
                >
                  {d.label}
                </div>
              </div>
              <div
                className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                style={{
                  background: `${cc}20`,
                  color: cc,
                  border: `1px solid ${cc}40`,
                }}
              >
                {d.pct}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── CHART: Executive Benchmark Bars ──────────────────────────────────────────────

function ExecutiveBenchmarkBar({
  label,
  pct,
  rank,
}: {
  label: string;
  pct: number;
  rank: number;
}) {
  const cc = catColor(pct);
  const ss = scoreStyle(pct);
  const benchmark = 70;

  return (
    <div className="mb-6 group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
            style={{
              background:
                rank === 0
                  ? `linear-gradient(135deg, ${EXECUTIVE.gold[500]}, ${EXECUTIVE.gold[400]})`
                  : EXECUTIVE.forest[800],
              color: rank === 0 ? EXECUTIVE.forest[900] : EXECUTIVE.cream[300],
              boxShadow:
                rank === 0 ? `0 0 12px ${EXECUTIVE.gold[400]}50` : "none",
            }}
          >
            {rank + 1}
          </div>
          <span
            className="text-sm font-bold capitalize"
            style={{ color: EXECUTIVE.cream[200] }}
          >
            {label.replace(/_/g, " ")}
          </span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full"
            style={{
              color: cc,
              background: `${cc}20`,
              border: `1px solid ${cc}40`,
            }}
          >
            {ss.label}
          </span>
          <span className="text-base font-black" style={{ color: cc }}>
            {pct}%
          </span>
        </div>
      </div>

      <div
        className="relative h-3 rounded-full overflow-visible"
        style={{ background: EXECUTIVE.forest[800] }}
      >
        {/* Benchmark line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 z-10"
          style={{ left: `${benchmark}%`, background: EXECUTIVE.gold[400] }}
        />
        <div
          className="absolute -top-5 text-[8px] font-bold px-1.5 py-0.5 rounded"
          style={{
            left: `${benchmark}%`,
            transform: "translateX(-50%)",
            background: EXECUTIVE.gold[400],
            color: EXECUTIVE.forest[900],
          }}
        >
          70%
        </div>

        {/* Progress bar */}
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${EXECUTIVE.forest[700]}, ${cc})`,
            boxShadow: `0 0 16px ${cc}40`,
          }}
        />
      </div>
    </div>
  );
}

// ─── Mini Gauge ───────────────────────────────────────────────────────────────

function ExecutiveMiniGauge({ pct, label }: { pct: number; label: string }) {
  const r = 32,
    sw = 8,
    circ = Math.PI * r;
  const cc = catColor(pct);
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: 90, height: 50 }}>
        <svg viewBox="0 0 90 50" width={90} height={50}>
          <path
            d={`M 10 45 A ${r} ${r} 0 0 1 80 45`}
            fill="none"
            stroke={EXECUTIVE.forest[800]}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <path
            d={`M 10 45 A ${r} ${r} 0 0 1 80 45`}
            fill="none"
            stroke={cc}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div className="absolute bottom-0 left-0 right-0 text-center">
          <span className="text-base font-black" style={{ color: cc }}>
            {pct}%
          </span>
        </div>
      </div>
      <span
        className="text-[9px] font-bold uppercase tracking-wider text-center leading-tight max-w-[80px]"
        style={{ color: EXECUTIVE.cream[400] }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Section Title ─────────────────────────────────────────────────────────────

function ExecutiveSection({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ElementType;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: `linear-gradient(135deg, ${EXECUTIVE.forest[700]}, ${EXECUTIVE.forest[600]})`,
          boxShadow: `0 4px 16px ${EXECUTIVE.forest[900]}50`,
        }}
      >
        <Icon className="w-5 h-5" style={{ color: EXECUTIVE.gold[400] }} />
      </div>
      <div className="flex-1">
        <h2
          className="text-xs font-black uppercase tracking-[0.2em]"
          style={{ color: EXECUTIVE.cream[200] }}
        >
          {title}
        </h2>
        {sub && (
          <p
            className="text-[10px] mt-0.5"
            style={{ color: EXECUTIVE.cream[500] }}
          >
            {sub}
          </p>
        )}
      </div>
      <div
        className="flex-1 h-px"
        style={{
          background: `linear-gradient(90deg, ${EXECUTIVE.gold[400]}40, transparent)`,
        }}
      />
    </div>
  );
}

// ─── Answer Badge ──────────────────────────────────────────────────────────────

function ExecutiveAnswerBadge({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  if (label === "yes")
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold"
        style={{
          background: `${EXECUTIVE.forest[500]}20`,
          color: EXECUTIVE.forest[400],
          border: `1px solid ${EXECUTIVE.forest[500]}40`,
        }}
      >
        <CheckCircle2 className="w-3 h-3" /> Compliant · +{value}
      </span>
    );
  if (label === "partial")
    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold"
        style={{
          background: `${EXECUTIVE.gold[500]}20`,
          color: EXECUTIVE.gold[400],
          border: `1px solid ${EXECUTIVE.gold[500]}40`,
        }}
      >
        <MinusCircle className="w-3 h-3" /> Partial · +{value}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
      <XCircle className="w-3 h-3" /> Gap · +{value}
    </span>
  );
}

// ─── Loading / Error ───────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div
      className="min-h-screen flex items-center justify-center gap-4"
      style={{ background: EXECUTIVE.forest[950] }}
    >
      <div
        className="w-6 h-6 border-2 rounded-full animate-spin"
        style={{
          borderColor: EXECUTIVE.forest[700],
          borderTopColor: EXECUTIVE.gold[400],
        }}
      />
      <span
        className="text-sm font-medium"
        style={{ color: EXECUTIVE.gold[300] }}
      >
        Preparing Executive Report…
      </span>
    </div>
  );
}

function NotFoundState() {
  return (
    <div
      className="min-h-screen flex items-center justify-center flex-col gap-4"
      style={{ background: EXECUTIVE.forest[950] }}
    >
      <Shield className="w-12 h-12" style={{ color: EXECUTIVE.forest[700] }} />
      <p className="font-medium" style={{ color: EXECUTIVE.cream[400] }}>
        Report not found
      </p>
      <Link
        href="/admin/reports"
        className="text-sm hover:underline"
        style={{ color: EXECUTIVE.gold[400] }}
      >
        ← Back to Reports
      </Link>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function Assessment1ReportPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "details">(
    "overview",
  );

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) =>
        setUser((d.users ?? []).find((u: User) => u.id === id) ?? null),
      )
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSendEmail() {
    if (!user) return;
    setSending(true);
    setSendError(null);
    try {
      const res = await fetch("/api/admin/send-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          assessmentType: "assessment1",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setSent(true);
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setSending(false);
    }
  }

  async function handleDownloadPDF() {
    if (!user) return;
    setDownloading(true);
    try {
      const res = await fetch(
        `/api/admin/report-pdf?userId=${user.id}&type=assessment1`,
      );
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CRAM-Executive-Report-${user.name.replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <LoadingState />;
  if (!user || !user.assessment1) return <NotFoundState />;

  // ── Derived ────────────────────────────────────────────────────────────────

  const a1 = user.assessment1;
  const pct = a1.pct ?? 0;
  const ss = scoreStyle(pct);

  const catEntries = Object.entries(a1.catBreakdown).sort(
    ([, a], [, b]) => b.pct - a.pct,
  );
  const radarData = catEntries.map(([key, val]) => ({
    label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    pct: val.pct,
  }));

  const grouped = groupAnswers(a1.answers);
  const displayGrouped = search
    ? Object.fromEntries(
        Object.entries(grouped)
          .map(([k, ans]) => [
            k,
            ans.filter(
              (a) =>
                a.question.questionEn
                  .toLowerCase()
                  .includes(search.toLowerCase()) ||
                a.question.questionAr.includes(search),
            ),
          ])
          .filter(([, ans]) => ans.length > 0),
      )
    : grouped;

  const sortedGrouped = (
    Object.entries(displayGrouped) as [string, typeof a1.answers][]
  ).sort(([ka], [kb]) => {
    const oa =
      a1.answers.find((a) => a.question.categoryKey === ka)?.question
        .categoryOrder ?? 0;
    const ob =
      a1.answers.find((a) => a.question.categoryKey === kb)?.question
        .categoryOrder ?? 0;
    return oa - ob;
  });

  const strengths = catEntries.filter(([, v]) => v.pct >= 70);
  const weaknesses = catEntries.filter(([, v]) => v.pct < 50);

  const yes = a1.answers.filter((a) => a.selectedLabel === "yes").length;
  const partial = a1.answers.filter(
    (a) => a.selectedLabel === "partial",
  ).length;
  const no = a1.answers.filter((a) => a.selectedLabel === "no").length;
  const total = a1.answers.length;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="min-h-screen"
      style={{
        background: EXECUTIVE.forest[950],
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .tab-active { border-bottom: 2px solid ${EXECUTIVE.gold[400]}; color: ${EXECUTIVE.gold[400]}; }
        ::selection { background: ${EXECUTIVE.gold[400]}40; }
      `}</style>

      {/* ── Premium Sticky Header ── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{
          background: `${EXECUTIVE.forest[900]}E6`,
          borderColor: EXECUTIVE.forest[800],
        }}
      >
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/admin/reports"
              className="flex items-center gap-2 text-sm font-medium transition-colors shrink-0 hover:opacity-80"
              style={{ color: EXECUTIVE.cream[400] }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </Link>
            <ChevronRight
              className="w-3 h-3 shrink-0"
              style={{ color: EXECUTIVE.forest[600] }}
            />

            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${EXECUTIVE.forest[700]}, ${EXECUTIVE.gold[500]})`,
                  color: EXECUTIVE.cream[50],
                  boxShadow: `0 4px 16px ${EXECUTIVE.gold[500]}30`,
                }}
              >
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="font-bold truncate"
                    style={{ color: EXECUTIVE.cream[100] }}
                  >
                    {user.name}
                  </span>
                  <span
                    className="text-[10px] px-2.5 py-1 rounded-full font-bold shrink-0"
                    style={{
                      background: `${ss.color}25`,
                      color: ss.color,
                      border: `1px solid ${ss.color}50`,
                    }}
                  >
                    {pct}% · {ss.label}
                  </span>
                </div>
                {user.organization && (
                  <span
                    className="text-xs"
                    style={{ color: EXECUTIVE.cream[500] }}
                  >
                    {user.organization}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Confidential Badge */}
            <div
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                background: `${EXECUTIVE.gold[400]}15`,
                border: `1px solid ${EXECUTIVE.gold[400]}30`,
              }}
            >
              <Lock
                className="w-3 h-3"
                style={{ color: EXECUTIVE.gold[400] }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: EXECUTIVE.gold[400] }}
              >
                Confidential
              </span>
            </div>

            {sendError && (
              <p className="text-xs text-red-400 hidden sm:block">
                {sendError}
              </p>
            )}

            <button
              onClick={handleSendEmail}
              disabled={sending || sent}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: sent
                  ? EXECUTIVE.forest[700]
                  : EXECUTIVE.forest[800],
                color: sent ? EXECUTIVE.forest[300] : EXECUTIVE.cream[300],
                border: `1px solid ${sent ? EXECUTIVE.forest[600] : EXECUTIVE.forest[700]}`,
              }}
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : sent ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              {sent ? "Sent!" : sending ? "Sending…" : "Email Report"}
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: `linear-gradient(135deg, ${EXECUTIVE.gold[500]}, ${EXECUTIVE.gold[400]})`,
                color: EXECUTIVE.forest[900],
                boxShadow: `0 4px 20px ${EXECUTIVE.gold[500]}40`,
              }}
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export PDF
            </button>
          </div>
        </div>

        {/* Premium Tabs */}
        <div
          className="max-w-7xl mx-auto px-8 flex gap-8 border-t"
          style={{ borderColor: EXECUTIVE.forest[800] }}
        >
          {(["overview", "details"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs font-bold uppercase tracking-[0.15em] py-4 transition-all ${
                activeTab === tab
                  ? "tab-active"
                  : "border-b-2 border-transparent"
              }`}
              style={{
                color:
                  activeTab === tab
                    ? EXECUTIVE.gold[400]
                    : EXECUTIVE.cream[500],
              }}
            >
              {tab === "overview" ? "Executive Overview" : "Detailed Analysis"}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-10">
        {/* ── EXECUTIVE HERO BANNER ── */}
        <div
          className="relative rounded-3xl overflow-hidden mb-10"
          style={{ minHeight: 400 }}
        >
          {/* Multi-layer background */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(145deg, ${EXECUTIVE.forest[900]} 0%, ${EXECUTIVE.forest[850]} 40%, ${EXECUTIVE.forest[800]} 100%)`,
            }}
          />

          {/* Premium grid pattern */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(${EXECUTIVE.gold[400]}30 1px, transparent 1px),
                linear-gradient(90deg, ${EXECUTIVE.gold[400]}30 1px, transparent 1px)
              `,
              backgroundSize: "60px 60px",
            }}
          />

          {/* Radial glows */}
          <div
            className="absolute -right-32 -top-32 w-[500px] h-[500px] rounded-full"
            style={{
              background: `radial-gradient(circle, ${EXECUTIVE.gold[400]}15, transparent 60%)`,
            }}
          />
          <div
            className="absolute -left-20 bottom-0 w-80 h-80 rounded-full"
            style={{
              background: `radial-gradient(circle, ${EXECUTIVE.forest[500]}20, transparent 60%)`,
            }}
          />

          {/* Vertical accent lines */}
          <div
            className="absolute right-40 top-0 w-px h-full opacity-20"
            style={{
              background: `linear-gradient(to bottom, transparent, ${EXECUTIVE.gold[400]}, transparent)`,
            }}
          />
          <div
            className="absolute right-44 top-0 w-px h-full opacity-10"
            style={{
              background: `linear-gradient(to bottom, transparent, ${EXECUTIVE.gold[400]}, transparent)`,
            }}
          />

          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-32 h-32">
            <div
              className="absolute top-6 left-6 w-16 h-px"
              style={{ background: EXECUTIVE.gold[400] }}
            />
            <div
              className="absolute top-6 left-6 w-px h-16"
              style={{ background: EXECUTIVE.gold[400] }}
            />
          </div>
          <div className="absolute bottom-0 right-0 w-32 h-32">
            <div
              className="absolute bottom-6 right-6 w-16 h-px"
              style={{ background: EXECUTIVE.gold[400] }}
            />
            <div
              className="absolute bottom-6 right-6 w-px h-16"
              style={{ background: EXECUTIVE.gold[400] }}
            />
          </div>

          <div className="relative z-10 p-12 flex flex-col lg:flex-row gap-12 items-start">
            <div className="flex-1">
              {/* Premium Badge */}
              <div className="flex items-center gap-3 mb-8">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `${EXECUTIVE.gold[400]}20`,
                    border: `1px solid ${EXECUTIVE.gold[400]}40`,
                  }}
                >
                  <Shield
                    className="w-5 h-5"
                    style={{ color: EXECUTIVE.gold[400] }}
                  />
                </div>
                <div className="flex flex-col">
                  <span
                    className="text-[10px] font-black uppercase tracking-[0.3em]"
                    style={{ color: EXECUTIVE.gold[400] }}
                  >
                    CRAM Consulting
                  </span>
                  <span
                    className="text-[9px] font-semibold uppercase tracking-[0.15em]"
                    style={{ color: EXECUTIVE.cream[500] }}
                  >
                    Executive Governance Assessment
                  </span>
                </div>
                <div
                  className="ml-4 px-3 py-1 rounded-full"
                  style={{
                    background: `${EXECUTIVE.gold[400]}15`,
                    border: `1px solid ${EXECUTIVE.gold[400]}30`,
                  }}
                >
                  <span
                    className="text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: EXECUTIVE.gold[400] }}
                  >
                    Confidential
                  </span>
                </div>
              </div>

              <h1
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                className="text-6xl font-bold leading-none mb-2"
              >
                <span style={{ color: EXECUTIVE.cream[100] }}>Governance</span>
              </h1>
              <h1
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  color: EXECUTIVE.gold[400],
                }}
                className="text-6xl font-bold leading-none mb-8"
              >
                Assessment Report
              </h1>

              {/* Client info */}
              <div className="flex items-center gap-4 mb-2">
                <div
                  className="w-px h-14 opacity-60"
                  style={{ background: EXECUTIVE.gold[400] }}
                />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Briefcase
                      className="w-4 h-4"
                      style={{ color: EXECUTIVE.cream[500] }}
                    />
                    <p
                      className="text-xl font-bold"
                      style={{ color: EXECUTIVE.cream[100] }}
                    >
                      {user.name}
                    </p>
                  </div>
                  {user.organization && (
                    <div className="flex items-center gap-2">
                      <Building2
                        className="w-3.5 h-3.5"
                        style={{ color: EXECUTIVE.cream[500] }}
                      />
                      <p
                        className="text-sm"
                        style={{ color: EXECUTIVE.cream[400] }}
                      >
                        {user.organization}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div
                className="flex items-center gap-2 mt-4"
                style={{ color: EXECUTIVE.cream[500] }}
              >
                <Calendar className="w-3.5 h-3.5" />
                <p className="text-xs tracking-widest uppercase">
                  Submitted {fmt(a1.submittedAt)}
                </p>
              </div>

              {/* Premium KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
                {[
                  {
                    icon: Target,
                    l: "Total Score",
                    v: `${a1.totalScore}/${a1.maxScore}`,
                  },
                  { icon: FileText, l: "Questions", v: a1.answers.length },
                  { icon: Users, l: "Domains", v: catEntries.length },
                  { icon: Award, l: "Rating", v: ss.label },
                ].map((s, i) => (
                  <div
                    key={i}
                    className="text-center rounded-2xl py-4 px-3 transition-all hover:scale-[1.02]"
                    style={{
                      background: `${EXECUTIVE.cream[50]}08`,
                      border: `1px solid ${EXECUTIVE.cream[50]}10`,
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <s.icon
                      className="w-4 h-4 mx-auto mb-2"
                      style={{ color: EXECUTIVE.gold[400] }}
                    />
                    <div
                      className="text-2xl font-black"
                      style={{ color: EXECUTIVE.cream[100] }}
                    >
                      {s.v}
                    </div>
                    <div
                      className="text-[9px] uppercase tracking-[0.15em] mt-1 font-semibold"
                      style={{ color: EXECUTIVE.cream[500] }}
                    >
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Executive Donut */}
            <div className="shrink-0 flex flex-col items-center gap-6">
              <ExecutiveDonut pct={pct} />
              <div className="text-center">
                <p
                  className="text-[10px] uppercase tracking-[0.2em] font-semibold"
                  style={{ color: EXECUTIVE.cream[500] }}
                >
                  Overall Compliance Score
                </p>
                <p
                  className="text-sm mt-1"
                  style={{ color: EXECUTIVE.cream[400] }}
                >
                  {a1.totalScore} of {a1.maxScore} points achieved
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Row 1: Summary Cards */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Overall Performance */}
              <div
                className="rounded-2xl p-6 border"
                style={{
                  background: `${ss.color}10`,
                  borderColor: `${ss.color}30`,
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div
                      className="text-[10px] font-black uppercase tracking-widest mb-2"
                      style={{ color: ss.color }}
                    >
                      Performance Classification
                    </div>
                    <div
                      className="text-5xl font-black leading-none"
                      style={{
                        color: ss.color,
                        fontFamily: "'Playfair Display', serif",
                      }}
                    >
                      {ss.label}
                    </div>
                    <div className="text-sm mt-2" style={{ color: ss.color }}>
                      {pct}% · {a1.totalScore}/{a1.maxScore} pts
                    </div>
                  </div>
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background: `${ss.color}20` }}
                  >
                    <Sparkles className="w-7 h-7" style={{ color: ss.color }} />
                  </div>
                </div>
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{ background: `${ss.color}20` }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${pct}%`, background: ss.color }}
                  />
                </div>
              </div>

              {/* Strengths */}
              <div
                className="rounded-2xl p-6 border"
                style={{
                  background: `${EXECUTIVE.forest[500]}10`,
                  borderColor: `${EXECUTIVE.forest[500]}30`,
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp
                    className="w-4 h-4"
                    style={{ color: EXECUTIVE.forest[400] }}
                  />
                  <span
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: EXECUTIVE.forest[400] }}
                  >
                    Strengths
                  </span>
                  <span
                    className="ml-auto text-xs font-black px-2.5 py-1 rounded-full"
                    style={{
                      background: `${EXECUTIVE.forest[500]}20`,
                      color: EXECUTIVE.forest[400],
                    }}
                  >
                    {strengths.length}
                  </span>
                </div>
                {strengths.length === 0 ? (
                  <p
                    className="text-xs"
                    style={{ color: EXECUTIVE.cream[500] }}
                  >
                    No domains above 70% yet
                  </p>
                ) : (
                  strengths.slice(0, 4).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2 mb-2">
                      <CheckCircle2
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: EXECUTIVE.forest[400] }}
                      />
                      <span
                        className="text-xs capitalize flex-1"
                        style={{ color: EXECUTIVE.cream[300] }}
                      >
                        {k.replace(/_/g, " ")}
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: EXECUTIVE.forest[400] }}
                      >
                        {v.pct}%
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Priority Areas */}
              <div
                className="rounded-2xl p-6 border"
                style={{
                  background: `${EXECUTIVE.gold[500]}10`,
                  borderColor: `${EXECUTIVE.gold[500]}30`,
                }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle
                    className="w-4 h-4"
                    style={{ color: EXECUTIVE.gold[400] }}
                  />
                  <span
                    className="text-[10px] font-black uppercase tracking-widest"
                    style={{ color: EXECUTIVE.gold[400] }}
                  >
                    Priority Areas
                  </span>
                  <span
                    className="ml-auto text-xs font-black px-2.5 py-1 rounded-full"
                    style={{
                      background: `${EXECUTIVE.gold[500]}20`,
                      color: EXECUTIVE.gold[400],
                    }}
                  >
                    {weaknesses.length}
                  </span>
                </div>
                {weaknesses.length === 0 ? (
                  <p
                    className="text-xs"
                    style={{ color: EXECUTIVE.cream[500] }}
                  >
                    All domains above 50%
                  </p>
                ) : (
                  weaknesses.slice(0, 4).map(([k, v]) => (
                    <div key={k} className="flex items-center gap-2 mb-2">
                      <AlertTriangle
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: EXECUTIVE.gold[400] }}
                      />
                      <span
                        className="text-xs capitalize flex-1"
                        style={{ color: EXECUTIVE.cream[300] }}
                      >
                        {k.replace(/_/g, " ")}
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{ color: EXECUTIVE.gold[400] }}
                      >
                        {v.pct}%
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Row 2: Charts */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Radar Chart */}
              <div
                className="rounded-2xl border p-8"
                style={{
                  background: EXECUTIVE.forest[900],
                  borderColor: EXECUTIVE.forest[800],
                }}
              >
                <ExecutiveSection
                  icon={Target}
                  title="Competency Radar"
                  sub="Performance across all governance domains"
                />
                <ExecutiveRadar data={radarData} />
              </div>

              {/* Benchmark Bars */}
              <div
                className="rounded-2xl border p-8"
                style={{
                  background: EXECUTIVE.forest[900],
                  borderColor: EXECUTIVE.forest[800],
                }}
              >
                <ExecutiveSection
                  icon={BarChart3}
                  title="Domain Benchmark"
                  sub="70% = industry benchmark threshold"
                />
                {catEntries.map(([key, val], i) => (
                  <ExecutiveBenchmarkBar
                    key={key}
                    label={key}
                    pct={val.pct}
                    rank={i}
                  />
                ))}
              </div>
            </div>

            {/* Row 3: Pie + Mini Gauges */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Answer Distribution */}
              <div
                className="rounded-2xl border p-8"
                style={{
                  background: EXECUTIVE.forest[900],
                  borderColor: EXECUTIVE.forest[800],
                }}
              >
                <ExecutiveSection
                  icon={BarChart3}
                  title="Answer Distribution"
                />
                <PremiumPieChart
                  yes={yes}
                  partial={partial}
                  no={no}
                  total={total}
                />
              </div>

              {/* Domain Mini-Gauges */}
              <div
                className="lg:col-span-2 rounded-2xl border p-8"
                style={{
                  background: EXECUTIVE.forest[900],
                  borderColor: EXECUTIVE.forest[800],
                }}
              >
                <ExecutiveSection
                  icon={Eye}
                  title="Domain At-a-Glance"
                  sub="Quick view of all domain performance"
                />
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-6 justify-items-center">
                  {catEntries.map(([key, val]) => (
                    <ExecutiveMiniGauge
                      key={key}
                      pct={val.pct}
                      label={key.replace(/_/g, " ")}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Row 4: Strategic Recommendations */}
            <div
              className="rounded-2xl border p-8"
              style={{
                background: EXECUTIVE.forest[900],
                borderColor: EXECUTIVE.forest[800],
              }}
            >
              <ExecutiveSection
                icon={Award}
                title="Strategic Recommendations"
                sub="Priority action plan for governance improvement"
              />

              {catEntries.every(([, v]) => v.pct >= 70) ? (
                <div className="text-center py-12">
                  <CheckCircle2
                    className="w-14 h-14 mx-auto mb-4"
                    style={{ color: EXECUTIVE.forest[400] }}
                  />
                  <p
                    className="font-medium"
                    style={{ color: EXECUTIVE.cream[400] }}
                  >
                    All domains performing at or above the 70% benchmark
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {catEntries
                    .filter(([, v]) => v.pct < 70)
                    .slice(0, 6)
                    .map(([key, val], i) => {
                      const priority =
                        i === 0
                          ? "Critical"
                          : i === 1
                            ? "High"
                            : i === 2
                              ? "Medium"
                              : "Low";
                      const pColor =
                        i === 0
                          ? "#DC2626"
                          : i <= 2
                            ? EXECUTIVE.gold[500]
                            : EXECUTIVE.forest[500];
                      return (
                        <div
                          key={key}
                          className="flex gap-4 p-5 rounded-2xl border transition-all hover:border-opacity-60"
                          style={{
                            borderColor:
                              i === 0 ? "#DC262650" : EXECUTIVE.forest[700],
                            background:
                              i === 0 ? "#DC262610" : EXECUTIVE.forest[850],
                          }}
                        >
                          <div className="flex flex-col items-center gap-1.5 shrink-0">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
                              style={{
                                background:
                                  i === 0
                                    ? "#DC2626"
                                    : i <= 2
                                      ? EXECUTIVE.gold[500]
                                      : EXECUTIVE.forest[600],
                                color:
                                  i <= 2
                                    ? EXECUTIVE.forest[900]
                                    : EXECUTIVE.cream[100],
                              }}
                            >
                              {i + 1}
                            </div>
                            <span
                              className="text-[8px] font-black uppercase"
                              style={{ color: pColor }}
                            >
                              {priority}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="text-sm font-black mb-2 capitalize"
                              style={{ color: EXECUTIVE.cream[200] }}
                            >
                              {key.replace(/_/g, " ")}
                            </p>
                            <div className="flex items-center gap-3 mb-2">
                              <div
                                className="flex-1 h-2 rounded-full"
                                style={{ background: EXECUTIVE.forest[800] }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${val.pct}%`,
                                    background: catColor(val.pct),
                                  }}
                                />
                              </div>
                              <span
                                className="text-sm font-bold"
                                style={{ color: catColor(val.pct) }}
                              >
                                {val.pct}%
                              </span>
                            </div>
                            <p
                              className="text-xs leading-relaxed"
                              style={{ color: EXECUTIVE.cream[500] }}
                            >
                              {val.pct < 40
                                ? `Scored ${val.score}/${val.max}. Requires immediate structured intervention with a dedicated improvement roadmap.`
                                : `Scored ${val.score}/${val.max}. Targeted initiatives can bridge this domain to the 70%+ benchmark.`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── DETAILS TAB ── */}
        {activeTab === "details" && (
          <div>
            {/* Search */}
            <div className="mb-8 flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: EXECUTIVE.cream[500] }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search questions…"
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2"
                  style={
                    {
                      background: EXECUTIVE.forest[900],
                      border: `1px solid ${EXECUTIVE.forest[700]}`,
                      color: EXECUTIVE.cream[200],
                      "--tw-ring-color": EXECUTIVE.gold[400],
                    } as React.CSSProperties
                  }
                />
              </div>
              <span className="text-xs" style={{ color: EXECUTIVE.cream[500] }}>
                {a1.answers.length} total questions
              </span>
            </div>

            <div className="space-y-6">
              {sortedGrouped.map(([catKey, answers]) => {
                const bd = a1.catBreakdown[catKey];
                const cPct = bd?.pct ?? 0;
                const csl = scoreStyle(cPct);
                const catYes = answers.filter(
                  (a) => a.selectedLabel === "yes",
                ).length;
                const catNo = answers.filter(
                  (a: { selectedLabel: string }) => a.selectedLabel === "no",
                ).length;

                return (
                  <div
                    key={catKey}
                    className="rounded-2xl border overflow-hidden"
                    style={{
                      background: EXECUTIVE.forest[900],
                      borderColor: EXECUTIVE.forest[800],
                    }}
                  >
                    {/* Category header */}
                    <div
                      className="flex items-center justify-between px-6 py-5"
                      style={{
                        background: `linear-gradient(90deg, ${EXECUTIVE.forest[850]}, ${EXECUTIVE.forest[900]})`,
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
                          style={{
                            background: `linear-gradient(135deg, ${EXECUTIVE.forest[700]}, ${EXECUTIVE.gold[500]})`,
                            color: EXECUTIVE.cream[50],
                          }}
                        >
                          {answers[0]?.question.categoryOrder}
                        </div>
                        <div>
                          <span
                            className="text-sm font-black capitalize"
                            style={{ color: EXECUTIVE.cream[200] }}
                          >
                            {catKey.replace(/_/g, " ")}
                          </span>
                          <div className="flex items-center gap-4 mt-1">
                            <span
                              className="text-[10px] font-semibold"
                              style={{ color: EXECUTIVE.forest[400] }}
                            >
                              {catYes} compliant
                            </span>
                            <span className="text-[10px] font-semibold text-red-400">
                              {catNo} gaps
                            </span>
                          </div>
                        </div>
                      </div>
                      {bd && (
                        <div className="flex items-center gap-4">
                          <div
                            className="w-24 h-2 rounded-full hidden sm:block"
                            style={{ background: EXECUTIVE.forest[800] }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${cPct}%`,
                                background: csl.color,
                              }}
                            />
                          </div>
                          <span
                            className="text-xs"
                            style={{ color: EXECUTIVE.cream[500] }}
                          >
                            {bd.score}/{bd.max}
                          </span>
                          <span
                            className="text-xs font-black px-3 py-1.5 rounded-full border"
                            style={{
                              color: csl.color,
                              background: `${csl.color}15`,
                              borderColor: `${csl.color}40`,
                            }}
                          >
                            {cPct}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Questions */}
                    <div
                      className="divide-y"
                      style={{ borderColor: EXECUTIVE.forest[800] }}
                    >
                      {[...answers]
                        .sort(
                          (a, b) =>
                            a.question.questionOrder - b.question.questionOrder,
                        )
                        .map((ans) => (
                          <div
                            key={ans.id}
                            className="px-6 py-5 transition-colors"
                            style={{ background: "transparent" }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-sm leading-relaxed"
                                  style={{ color: EXECUTIVE.cream[300] }}
                                >
                                  {ans.question.questionEn}
                                </p>
                                <p
                                  className="text-[11px] mt-2 text-right"
                                  dir="rtl"
                                  style={{ color: EXECUTIVE.cream[500] }}
                                >
                                  {ans.question.questionAr}
                                </p>
                              </div>
                              <div className="shrink-0">
                                <ExecutiveAnswerBadge
                                  label={ans.selectedLabel}
                                  value={ans.selectedValue}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Premium Footer ── */}
        <div
          className="mt-16 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-6"
          style={{ borderColor: EXECUTIVE.forest[800] }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${EXECUTIVE.forest[700]}, ${EXECUTIVE.gold[500]})`,
              }}
            >
              <Shield
                className="w-6 h-6"
                style={{ color: EXECUTIVE.cream[50] }}
              />
            </div>
            <div>
              <p
                className="text-sm font-bold"
                style={{ color: EXECUTIVE.cream[200] }}
              >
                CRAM Consulting
              </p>
              <p className="text-xs" style={{ color: EXECUTIVE.cream[500] }}>
                gm@cram.sa · cram.sa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full"
              style={{
                background: `${EXECUTIVE.gold[400]}10`,
                border: `1px solid ${EXECUTIVE.gold[400]}25`,
              }}
            >
              <Lock
                className="w-3.5 h-3.5"
                style={{ color: EXECUTIVE.gold[400] }}
              />
              <span
                className="text-[10px] font-bold uppercase tracking-wider"
                style={{ color: EXECUTIVE.gold[400] }}
              >
                Strictly Confidential
              </span>
            </div>
            <p
              className="text-[10px] text-right leading-relaxed"
              style={{ color: EXECUTIVE.cream[500] }}
            >
              Generated{" "}
              {new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
              <br />
              For authorized recipients only
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
