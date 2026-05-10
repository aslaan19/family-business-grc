"use client";
import Image from "next/image";
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

// ─── Design Tokens ─────────────────────────────────────────────────────────────

const EXECUTIVE = {
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
  cream: {
    50: "#FEFCF8",
    100: "#FBF8F1",
    200: "#F7F2E7",
    300: "#F0E9D8",
    400: "#E8DDC6",
    500: "#D9CAA8",
  },
  gold: {
    600: "#8B6914",
    500: "#B8891C",
    400: "#D4A024",
    300: "#E8B93D",
    200: "#F5D67A",
    100: "#FBF0C9",
  },
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

// ─── Helpers ───────────────────────────────────────────────────────────────────

function scoreStyle(pct: number) {
  if (pct >= 80)
    return {
      label: "Excellent",
      color: EXECUTIVE.forest[400],
      bg: EXECUTIVE.forest[50],
      ring: EXECUTIVE.forest[200],
    };
  if (pct >= 60)
    return {
      label: "Good",
      color: EXECUTIVE.forest[300],
      bg: EXECUTIVE.cream[200],
      ring: EXECUTIVE.forest[300],
    };
  if (pct >= 40)
    return {
      label: "Average",
      color: EXECUTIVE.gold[400],
      bg: EXECUTIVE.gold[100],
      ring: EXECUTIVE.gold[300],
    };
  return {
    label: "Needs Work",
    color: "#F87171",
    bg: "#FEF2F2",
    ring: "#FECACA",
  };
}

function catColor(pct: number): string {
  if (pct >= 70) return EXECUTIVE.forest[400];
  if (pct >= 50) return EXECUTIVE.gold[400];
  return "#F87171";
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

function abbr(label: string) {
  return label
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

// ─── Loading / Error ───────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div
      className="min-h-screen flex items-center justify-center gap-3"
      style={{ background: EXECUTIVE.forest[950] }}
    >
      <div
        className="w-5 h-5 border-2 rounded-full animate-spin"
        style={{
          borderColor: EXECUTIVE.forest[700],
          borderTopColor: EXECUTIVE.gold[400],
        }}
      />
      <span
        className="text-sm font-medium"
        style={{ color: EXECUTIVE.gold[300] }}
      >
        Preparing Report…
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
      <Image
        src="/images/logo.png"
        alt="CRAM Logo"
        height={32}
        width={120}
        className="object-contain"
      />
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

// ─── Donut ─────────────────────────────────────────────────────────────────────

function ExecutiveDonut({ pct }: { pct: number }) {
  const r = 72;
  const stroke = 12;
  const circ = 2 * Math.PI * r;
  const ss = scoreStyle(pct);
  const dash = (pct / 100) * circ;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 180, height: 180 }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{ background: EXECUTIVE.forest[900], padding: 3 }}
      >
        <div
          className="w-full h-full rounded-full"
          style={{ background: EXECUTIVE.forest[900] }}
        />
      </div>

      <svg
        viewBox="0 0 180 180"
        className="absolute inset-0 w-full h-full"
        style={{ transform: "rotate(-90deg)" }}
      >
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={EXECUTIVE.gold[400]} />
            <stop offset="50%" stopColor={EXECUTIVE.cream[200]} />
            <stop offset="100%" stopColor={EXECUTIVE.gold[400]} />
          </linearGradient>
        </defs>
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke={EXECUTIVE.forest[800]}
          strokeWidth={stroke}
        />
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: "stroke-dasharray 1.5s ease-out" }}
        />
        {[0, 25, 50, 75].map((t) => {
          const angle = (t / 100) * 2 * Math.PI - Math.PI / 2;
          return (
            <line
              key={t}
              x1={90 + (r - 8) * Math.cos(angle)}
              y1={90 + (r - 8) * Math.sin(angle)}
              x2={90 + (r + 2) * Math.cos(angle)}
              y2={90 + (r + 2) * Math.sin(angle)}
              stroke={EXECUTIVE.gold[400]}
              strokeWidth="1.5"
              opacity={0.4}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-black tracking-tight"
          style={{
            color: EXECUTIVE.cream[100],
            fontFamily: "'Playfair Display', Georgia, serif",
          }}
        >
          {pct}
          <span className="text-2xl" style={{ color: EXECUTIVE.gold[400] }}>
            %
          </span>
        </span>
        <div
          className="flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full"
          style={{ background: `${EXECUTIVE.gold[400]}20` }}
        >
          <Crown
            className="w-2.5 h-2.5"
            style={{ color: EXECUTIVE.gold[400] }}
          />
          <span
            className="text-[9px] font-bold uppercase tracking-widest"
            style={{ color: EXECUTIVE.gold[400] }}
          >
            {ss.label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Radar ─────────────────────────────────────────────────────────────────────

function ExecutiveRadar({ data }: { data: { label: string; pct: number }[] }) {
  const size = 260;
  const cx = 130,
    cy = 130,
    R = 90;
  const n = data.length;
  const step = (2 * Math.PI) / n;
  const start = -Math.PI / 2;

  const polar = (r: number, i: number) => ({
    x: cx + r * Math.cos(start + i * step),
    y: cy + r * Math.sin(start + i * step),
  });

  const pts = data.map((d, i) => polar((d.pct / 100) * R, i));
  const poly =
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  return (
    <div className="flex flex-col gap-5">
      {/* Chart centered */}
      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          style={{ width: 240, height: 240 }}
        >
          <defs>
            <radialGradient id="rfill">
              <stop
                offset="0%"
                stopColor={EXECUTIVE.gold[400]}
                stopOpacity="0.4"
              />
              <stop
                offset="100%"
                stopColor={EXECUTIVE.forest[500]}
                stopOpacity="0.08"
              />
            </radialGradient>
          </defs>

          {[25, 50, 75, 100].map((rv) => (
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
              strokeWidth={rv === 100 ? 1.5 : 0.8}
              strokeDasharray={rv !== 100 ? "3 5" : undefined}
              opacity={rv === 100 ? 0.6 : 0.3}
            />
          ))}

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
                strokeWidth="0.8"
                strokeDasharray="2 4"
                opacity={0.5}
              />
            );
          })}

          <path
            d={poly}
            fill="url(#rfill)"
            stroke={EXECUTIVE.gold[400]}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {pts.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r="15"
                fill={EXECUTIVE.forest[800]}
                stroke={EXECUTIVE.gold[400]}
                strokeWidth="1.5"
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize="8"
                fontWeight="800"
                fill={EXECUTIVE.cream[200]}
                fontFamily="Inter,sans-serif"
              >
                {abbr(data[i].label)}
              </text>
            </g>
          ))}

          <circle
            cx={cx}
            cy={cy}
            r="6"
            fill={EXECUTIVE.forest[700]}
            stroke={EXECUTIVE.gold[400]}
            strokeWidth="1.5"
          />
          <circle cx={cx} cy={cy} r="2.5" fill={EXECUTIVE.gold[400]} />
        </svg>
      </div>

      {/* Legend grid — 2 columns on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {[...data]
          .sort((a, b) => b.pct - a.pct)
          .map((d, i) => {
            const cc = catColor(d.pct);
            return (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                style={{ background: EXECUTIVE.forest[850] }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-[8px] font-black"
                  style={{
                    background: EXECUTIVE.forest[800],
                    border: `1.5px solid ${EXECUTIVE.gold[400]}`,
                    color: EXECUTIVE.gold[400],
                  }}
                >
                  {abbr(d.label)}
                </div>
                <span
                  className="flex-1 text-xs font-semibold truncate"
                  style={{ color: EXECUTIVE.cream[300] }}
                >
                  {d.label}
                </span>
                <span
                  className="text-xs font-black px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    background: `${cc}20`,
                    color: cc,
                    border: `1px solid ${cc}40`,
                  }}
                >
                  {d.pct}%
                </span>
              </div>
            );
          })}
      </div>
    </div>
  );
}

// ─── Pie Chart ─────────────────────────────────────────────────────────────────

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
      color: EXECUTIVE.forest[400],
      label: "Compliant",
      pct: Math.round((yes / total) * 100),
    },
    {
      value: partial,
      color: EXECUTIVE.gold[400],
      label: "Partial",
      pct: Math.round((partial / total) * 100),
    },
    {
      value: no,
      color: "#F87171",
      label: "Gap",
      pct: Math.round((no / total) * 100),
    },
  ];

  const cx = 90,
    cy = 90,
    r = 72,
    innerR = 44;
  let cum = 0;

  const slices = segments.map((seg) => {
    const s = cum;
    const slice = (seg.value / total) * 360;
    cum += slice;
    const toRad = (d: number) => ((d - 90) * Math.PI) / 180;
    const sR = toRad(s),
      eR = toRad(s + slice);
    const large = slice > 180 ? 1 : 0;
    const d = `M ${cx + innerR * Math.cos(sR)} ${cy + innerR * Math.sin(sR)}
               L ${cx + r * Math.cos(sR)} ${cy + r * Math.sin(sR)}
               A ${r} ${r} 0 ${large} 1 ${cx + r * Math.cos(eR)} ${cy + r * Math.sin(eR)}
               L ${cx + innerR * Math.cos(eR)} ${cy + innerR * Math.sin(eR)}
               A ${innerR} ${innerR} 0 ${large} 0 ${cx + innerR * Math.cos(sR)} ${cy + innerR * Math.sin(sR)} Z`;
    return { ...seg, d };
  });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="shrink-0">
        <svg viewBox="0 0 180 180" width={180} height={180}>
          {slices.map((s, i) => (
            <path
              key={i}
              d={s.d}
              fill={s.color}
              className="transition-opacity hover:opacity-80"
            />
          ))}
          <circle cx={cx} cy={cy} r={innerR - 2} fill={EXECUTIVE.forest[900]} />
          <text
            x={cx}
            y={cy - 5}
            textAnchor="middle"
            fontSize="16"
            fontWeight="900"
            fill={EXECUTIVE.cream[100]}
          >
            {total}
          </text>
          <text
            x={cx}
            y={cy + 10}
            textAnchor="middle"
            fontSize="8"
            fontWeight="700"
            fill={EXECUTIVE.cream[500]}
            letterSpacing="0.1em"
          >
            TOTAL
          </text>
        </svg>
      </div>

      <div className="flex flex-col gap-4 w-full">
        {slices.map((s, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: s.color }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: EXECUTIVE.cream[300] }}
                >
                  {s.label}
                </span>
              </div>
              <span className="text-sm font-black" style={{ color: s.color }}>
                {s.value}
                <span
                  className="text-xs font-normal ml-1"
                  style={{ color: EXECUTIVE.cream[500] }}
                >
                  ({s.pct}%)
                </span>
              </span>
            </div>
            <div
              className="h-2 rounded-full overflow-hidden"
              style={{ background: EXECUTIVE.forest[800] }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${s.pct}%`, background: s.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Benchmark Bar ─────────────────────────────────────────────────────────────

function BenchmarkBar({
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

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0"
            style={{
              background:
                rank === 0
                  ? `linear-gradient(135deg, ${EXECUTIVE.gold[500]}, ${EXECUTIVE.gold[400]})`
                  : EXECUTIVE.forest[800],
              color: rank === 0 ? EXECUTIVE.forest[900] : EXECUTIVE.cream[300],
            }}
          >
            {rank + 1}
          </div>
          <span
            className="text-xs font-bold capitalize truncate"
            style={{ color: EXECUTIVE.cream[200] }}
          >
            {label.replace(/_/g, " ")}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-[9px] font-bold px-2 py-0.5 rounded-full hidden sm:inline"
            style={{
              color: cc,
              background: `${cc}20`,
              border: `1px solid ${cc}40`,
            }}
          >
            {ss.label}
          </span>
          <span className="text-sm font-black" style={{ color: cc }}>
            {pct}%
          </span>
        </div>
      </div>
      <div
        className="relative h-2.5 rounded-full overflow-hidden"
        style={{ background: EXECUTIVE.forest[800] }}
      >
        <div
          className="absolute top-0 bottom-0 w-px z-10"
          style={{ left: "70%", background: EXECUTIVE.gold[400] }}
        />
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${EXECUTIVE.forest[700]}, ${cc})`,
          }}
        />
      </div>
      <div className="flex justify-end mt-0.5">
        <span className="text-[9px]" style={{ color: EXECUTIVE.gold[500] }}>
          ▲ 70% benchmark
        </span>
      </div>
    </div>
  );
}

// ─── Mini Gauge ────────────────────────────────────────────────────────────────

function MiniGauge({ pct, label }: { pct: number; label: string }) {
  const r = 28,
    sw = 7,
    circ = Math.PI * r;
  const cc = catColor(pct);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: 76, height: 44 }}>
        <svg viewBox="0 0 76 44" width={76} height={44}>
          <path
            d={`M 8 40 A ${r} ${r} 0 0 1 68 40`}
            fill="none"
            stroke={EXECUTIVE.forest[800]}
            strokeWidth={sw}
            strokeLinecap="round"
          />
          <path
            d={`M 8 40 A ${r} ${r} 0 0 1 68 40`}
            fill="none"
            stroke={cc}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          />
        </svg>
        <div className="absolute bottom-0 inset-x-0 text-center">
          <span className="text-sm font-black" style={{ color: cc }}>
            {pct}%
          </span>
        </div>
      </div>
      <span
        className="text-[9px] font-bold uppercase tracking-wide text-center leading-tight max-w-[72px]"
        style={{ color: EXECUTIVE.cream[500] }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Section Header ────────────────────────────────────────────────────────────

function SectionHeader({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ElementType;
  title: string;
  sub?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{
          background: `linear-gradient(135deg, ${EXECUTIVE.forest[700]}, ${EXECUTIVE.forest[600]})`,
        }}
      >
        <Icon className="w-4 h-4" style={{ color: EXECUTIVE.gold[400] }} />
      </div>
      <div className="flex-1 min-w-0">
        <h2
          className="text-xs font-black uppercase tracking-[0.18em]"
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
        className="w-16 sm:flex-1 h-px"
        style={{
          background: `linear-gradient(90deg, ${EXECUTIVE.gold[400]}40, transparent)`,
        }}
      />
    </div>
  );
}

// ─── Answer Badge ──────────────────────────────────────────────────────────────

function AnswerBadge({ label, value }: { label: string; value: number }) {
  if (label === "yes")
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
        style={{
          background: `${EXECUTIVE.forest[400]}20`,
          color: EXECUTIVE.forest[300],
          border: `1px solid ${EXECUTIVE.forest[400]}40`,
        }}
      >
        <CheckCircle2 className="w-3 h-3" /> Yes · +{value}
      </span>
    );
  if (label === "partial")
    return (
      <span
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold"
        style={{
          background: `${EXECUTIVE.gold[400]}20`,
          color: EXECUTIVE.gold[300],
          border: `1px solid ${EXECUTIVE.gold[400]}40`,
        }}
      >
        <MinusCircle className="w-3 h-3" /> Partial · +{value}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40">
      <XCircle className="w-3 h-3" /> Gap · +{value}
    </span>
  );
}

// ─── Card wrapper ──────────────────────────────────────────────────────────────

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 ${className}`}
      style={{
        background: EXECUTIVE.forest[900],
        borderColor: EXECUTIVE.forest[800],
      }}
    >
      {children}
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
      a.download = `CRAM-Report-${user.name.replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <LoadingState />;
  if (!user || !user.assessment1) return <NotFoundState />;

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

  return (
    <div
      className="min-h-screen"
      style={{
        background: EXECUTIVE.forest[950],
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .tab-active { border-bottom: 2px solid ${EXECUTIVE.gold[400]}; color: ${EXECUTIVE.gold[400]}; }
      `}</style>

      {/* ── Sticky Header ── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl border-b"
        style={{
          background: `${EXECUTIVE.forest[900]}F0`,
          borderColor: EXECUTIVE.forest[800],
        }}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          {/* Left */}
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/admin/reports"
              className="flex items-center gap-1 text-sm font-medium shrink-0"
              style={{ color: EXECUTIVE.cream[400] }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Reports</span>
            </Link>

            <ChevronRight
              className="w-3 h-3 shrink-0"
              style={{ color: EXECUTIVE.forest[600] }}
            />

            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${EXECUTIVE.forest[700]}, ${EXECUTIVE.gold[500]})`,
                  color: EXECUTIVE.cream[50],
                }}
              >
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className="font-bold text-sm truncate"
                    style={{ color: EXECUTIVE.cream[100] }}
                  >
                    {user.name}
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0"
                    style={{
                      background: `${ss.color}25`,
                      color: ss.color,
                      border: `1px solid ${ss.color}50`,
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                {user.organization && (
                  <p
                    className="text-[10px] truncate hidden sm:block"
                    style={{ color: EXECUTIVE.cream[500] }}
                  >
                    {user.organization}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSendEmail}
              disabled={sending || sent}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{
                background: sent
                  ? EXECUTIVE.forest[700]
                  : EXECUTIVE.forest[800],
                color: sent ? EXECUTIVE.forest[300] : EXECUTIVE.cream[300],
                border: `1px solid ${sent ? EXECUTIVE.forest[600] : EXECUTIVE.forest[700]}`,
              }}
            >
              {sending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : sent ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Mail className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">
                {sent ? "Sent!" : "Email"}
              </span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
              style={{
                background: `linear-gradient(135deg, ${EXECUTIVE.gold[500]}, ${EXECUTIVE.gold[400]})`,
                color: EXECUTIVE.forest[900],
              }}
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex gap-6 px-4 border-t overflow-x-auto"
          style={{ borderColor: EXECUTIVE.forest[800] }}
        >
          {(["overview", "details"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-[11px] font-bold uppercase tracking-[0.15em] py-3 whitespace-nowrap transition-all ${
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
              {tab === "overview" ? "Overview" : "Detailed Analysis"}
            </button>
          ))}
        </div>
      </header>

      <main className="px-4 py-6 space-y-5 max-w-4xl mx-auto">
        {/* ── Hero Card ── */}
        <div
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: `linear-gradient(145deg, ${EXECUTIVE.forest[900]}, ${EXECUTIVE.forest[850]}, ${EXECUTIVE.forest[800]})`,
          }}
        >
          {/* grid bg */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(${EXECUTIVE.gold[400]}30 1px, transparent 1px), linear-gradient(90deg, ${EXECUTIVE.gold[400]}30 1px, transparent 1px)`,
              backgroundSize: "48px 48px",
            }}
          />
          {/* corner accent */}
          <div className="absolute top-0 left-0">
            <div
              className="absolute top-5 left-5 w-12 h-px"
              style={{ background: EXECUTIVE.gold[400] }}
            />
            <div
              className="absolute top-5 left-5 w-px h-12"
              style={{ background: EXECUTIVE.gold[400] }}
            />
          </div>
          <div className="absolute bottom-0 right-0">
            <div
              className="absolute bottom-5 right-5 w-12 h-px"
              style={{ background: EXECUTIVE.gold[400] }}
            />
            <div
              className="absolute bottom-5 right-5 w-px h-12"
              style={{ background: EXECUTIVE.gold[400] }}
            />
          </div>

          <div className="relative z-10 p-5 sm:p-8">
            {/* brand */}
            <div className="flex items-center gap-2 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{
                  background: `${EXECUTIVE.gold[400]}20`,
                  border: `1px solid ${EXECUTIVE.gold[400]}40`,
                }}
              >
                <Shield
                  className="w-4 h-4"
                  style={{ color: EXECUTIVE.gold[400] }}
                />
              </div>
              <div>
                <p
                  className="text-[10px] font-black uppercase tracking-[0.25em]"
                  style={{ color: EXECUTIVE.gold[400] }}
                >
                  CRAM Consulting
                </p>
                <p
                  className="text-[9px] uppercase tracking-[0.1em]"
                  style={{ color: EXECUTIVE.cream[500] }}
                >
                  Executive Governance Assessment
                </p>
              </div>
              <div
                className="ml-auto px-2.5 py-1 rounded-full"
                style={{
                  background: `${EXECUTIVE.gold[400]}15`,
                  border: `1px solid ${EXECUTIVE.gold[400]}25`,
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

            {/* title */}
            <h1
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-3xl sm:text-5xl font-bold leading-tight mb-1"
            >
              <span style={{ color: EXECUTIVE.cream[100] }}>Governance</span>
            </h1>
            <h1
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                color: EXECUTIVE.gold[400],
              }}
              className="text-3xl sm:text-5xl font-bold leading-tight mb-5"
            >
              Assessment Report
            </h1>

            {/* client + donut: stack on mobile */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <div
                    className="w-px h-10 opacity-60"
                    style={{ background: EXECUTIVE.gold[400] }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <Briefcase
                        className="w-3.5 h-3.5"
                        style={{ color: EXECUTIVE.cream[500] }}
                      />
                      <p
                        className="font-bold text-base"
                        style={{ color: EXECUTIVE.cream[100] }}
                      >
                        {user.name}
                      </p>
                    </div>
                    {user.organization && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <Building2
                          className="w-3 h-3"
                          style={{ color: EXECUTIVE.cream[500] }}
                        />
                        <p
                          className="text-xs"
                          style={{ color: EXECUTIVE.cream[400] }}
                        >
                          {user.organization}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className="flex items-center gap-1.5 ml-4 mt-2"
                  style={{ color: EXECUTIVE.cream[500] }}
                >
                  <Calendar className="w-3 h-3" />
                  <p className="text-[10px] uppercase tracking-widest">
                    Submitted {fmt(a1.submittedAt)}
                  </p>
                </div>

                {/* KPI strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-5">
                  {[
                    {
                      icon: Target,
                      l: "Score",
                      v: `${a1.totalScore}/${a1.maxScore}`,
                    },
                    { icon: FileText, l: "Questions", v: a1.answers.length },
                    { icon: Users, l: "Domains", v: catEntries.length },
                    { icon: Award, l: "Rating", v: ss.label },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="text-center rounded-xl py-3 px-2"
                      style={{
                        background: `${EXECUTIVE.cream[50]}08`,
                        border: `1px solid ${EXECUTIVE.cream[50]}10`,
                      }}
                    >
                      <s.icon
                        className="w-3.5 h-3.5 mx-auto mb-1.5"
                        style={{ color: EXECUTIVE.gold[400] }}
                      />
                      <div
                        className="text-base font-black"
                        style={{ color: EXECUTIVE.cream[100] }}
                      >
                        {s.v}
                      </div>
                      <div
                        className="text-[9px] uppercase tracking-wider mt-0.5 font-semibold"
                        style={{ color: EXECUTIVE.cream[500] }}
                      >
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Donut */}
              <div className="flex flex-col items-center gap-2 self-center sm:self-auto">
                <ExecutiveDonut pct={pct} />
                <p
                  className="text-[10px] uppercase tracking-widest font-semibold text-center"
                  style={{ color: EXECUTIVE.cream[500] }}
                >
                  Overall Score
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── OVERVIEW TAB ── */}
        {activeTab === "overview" && (
          <div className="space-y-5">
            {/* Performance classification */}
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p
                    className="text-[10px] font-black uppercase tracking-widest mb-1"
                    style={{ color: ss.color }}
                  >
                    Performance Classification
                  </p>
                  <p
                    className="text-3xl font-black"
                    style={{
                      color: ss.color,
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    {ss.label}
                  </p>
                  <p className="text-sm mt-1" style={{ color: ss.color }}>
                    {pct}% · {a1.totalScore}/{a1.maxScore} pts
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${ss.color}20` }}
                >
                  <Sparkles className="w-6 h-6" style={{ color: ss.color }} />
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
            </Card>

            {/* Strengths + Weaknesses: side by side on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <div className="flex items-center gap-2 mb-3">
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
                    className="ml-auto text-xs font-black px-2 py-0.5 rounded-full"
                    style={{
                      background: `${EXECUTIVE.forest[400]}20`,
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
                        className="text-xs capitalize flex-1 truncate"
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
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
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
                    className="ml-auto text-xs font-black px-2 py-0.5 rounded-full"
                    style={{
                      background: `${EXECUTIVE.gold[400]}20`,
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
                        className="text-xs capitalize flex-1 truncate"
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
              </Card>
            </div>

            {/* Radar */}
            <Card>
              <SectionHeader
                icon={Target}
                title="Competency Radar"
                sub="Performance across all governance domains"
              />
              <ExecutiveRadar data={radarData} />
            </Card>

            {/* Benchmark Bars */}
            <Card>
              <SectionHeader
                icon={BarChart3}
                title="Domain Benchmark"
                sub="70% = industry benchmark threshold"
              />
              {catEntries.map(([key, val], i) => (
                <BenchmarkBar key={key} label={key} pct={val.pct} rank={i} />
              ))}
            </Card>

            {/* Answer Distribution */}
            <Card>
              <SectionHeader icon={BarChart3} title="Answer Distribution" />
              <PremiumPieChart
                yes={yes}
                partial={partial}
                no={no}
                total={total}
              />
            </Card>

            {/* Mini Gauges */}
            <Card>
              <SectionHeader
                icon={Eye}
                title="Domain At-a-Glance"
                sub="Quick view of all domain scores"
              />
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 justify-items-center">
                {catEntries.map(([key, val]) => (
                  <MiniGauge
                    key={key}
                    pct={val.pct}
                    label={key.replace(/_/g, " ")}
                  />
                ))}
              </div>
            </Card>

            {/* Recommendations */}
            <Card>
              <SectionHeader
                icon={Award}
                title="Strategic Recommendations"
                sub="Priority action plan"
              />
              {catEntries.every(([, v]) => v.pct >= 70) ? (
                <div className="text-center py-10">
                  <CheckCircle2
                    className="w-12 h-12 mx-auto mb-3"
                    style={{ color: EXECUTIVE.forest[400] }}
                  />
                  <p
                    className="text-sm"
                    style={{ color: EXECUTIVE.cream[400] }}
                  >
                    All domains at or above the 70% benchmark
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
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
                          ? "#F87171"
                          : i <= 2
                            ? EXECUTIVE.gold[400]
                            : EXECUTIVE.forest[400];
                      return (
                        <div
                          key={key}
                          className="flex gap-3 p-4 rounded-xl border"
                          style={{
                            borderColor:
                              i === 0 ? "#F8717150" : EXECUTIVE.forest[700],
                            background:
                              i === 0 ? "#F8717110" : EXECUTIVE.forest[850],
                          }}
                        >
                          <div className="flex flex-col items-center gap-1 shrink-0">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black"
                              style={{
                                background:
                                  i === 0
                                    ? "#F87171"
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
                              className="text-sm font-black mb-1.5 capitalize"
                              style={{ color: EXECUTIVE.cream[200] }}
                            >
                              {key.replace(/_/g, " ")}
                            </p>
                            <div className="flex items-center gap-2 mb-1.5">
                              <div
                                className="flex-1 h-1.5 rounded-full"
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
                                className="text-xs font-bold shrink-0"
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
                                ? `Scored ${val.score}/${val.max}. Requires immediate intervention.`
                                : `Scored ${val.score}/${val.max}. Targeted initiatives can reach the 70%+ benchmark.`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ── DETAILS TAB ── */}
        {activeTab === "details" && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                style={{ color: EXECUTIVE.cream[500] }}
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions…"
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm focus:outline-none"
                style={{
                  background: EXECUTIVE.forest[900],
                  border: `1px solid ${EXECUTIVE.forest[700]}`,
                  color: EXECUTIVE.cream[200],
                }}
              />
            </div>
            <p className="text-xs" style={{ color: EXECUTIVE.cream[500] }}>
              {a1.answers.length} total questions
            </p>

            {sortedGrouped.map(([catKey, answers]) => {
              const bd = a1.catBreakdown[catKey];
              const cPct = bd?.pct ?? 0;
              const csl = scoreStyle(cPct);
              const catYes = answers.filter(
                (a) => a.selectedLabel === "yes",
              ).length;
              const catNo = answers.filter(
                (a) => a.selectedLabel === "no",
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
                    className="flex items-center justify-between px-4 py-4 gap-3"
                    style={{ background: EXECUTIVE.forest[850] }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${EXECUTIVE.forest[700]}, ${EXECUTIVE.gold[500]})`,
                          color: EXECUTIVE.cream[50],
                        }}
                      >
                        {answers[0]?.question.categoryOrder}
                      </div>
                      <div className="min-w-0">
                        <span
                          className="text-sm font-black capitalize block truncate"
                          style={{ color: EXECUTIVE.cream[200] }}
                        >
                          {catKey.replace(/_/g, " ")}
                        </span>
                        <div className="flex items-center gap-3 mt-0.5">
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
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className="text-xs"
                          style={{ color: EXECUTIVE.cream[500] }}
                        >
                          {bd.score}/{bd.max}
                        </span>
                        <span
                          className="text-xs font-black px-2.5 py-1 rounded-full border"
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
                        <div key={ans.id} className="px-4 py-4">
                          <p
                            className="text-sm leading-relaxed mb-2"
                            style={{ color: EXECUTIVE.cream[300] }}
                          >
                            {ans.question.questionEn}
                          </p>
                          <p
                            className="text-[11px] mb-3 text-right"
                            dir="rtl"
                            style={{ color: EXECUTIVE.cream[500] }}
                          >
                            {ans.question.questionAr}
                          </p>
                          <AnswerBadge
                            label={ans.selectedLabel}
                            value={ans.selectedValue}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Footer ── */}
        <div
          className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderColor: EXECUTIVE.forest[800] }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${EXECUTIVE.forest[700]}, ${EXECUTIVE.gold[500]})`,
              }}
            >
              <Image
                src="/images/logo.png"
                alt="CRAM Logo"
                height={40}
                width={150}
                className="object-contain"
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
                gm@cram.sa · +966 54 958 4775 · cram.sa
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              background: `${EXECUTIVE.gold[400]}10`,
              border: `1px solid ${EXECUTIVE.gold[400]}25`,
            }}
          >
            <Lock className="w-3 h-3" style={{ color: EXECUTIVE.gold[400] }} />
            <span
              className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: EXECUTIVE.gold[400] }}
            >
              Strictly Confidential
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
