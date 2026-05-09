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
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface ScoreStyle {
  label: string;
  labelAr: string;
  color: string;
  bg: string;
  border: string;
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const G = {
  900: "#0a2e1a",
  800: "#0f3d22",
  700: "#14522e",
  600: "#1a6b3c",
  500: "#22874d",
  400: "#2ea360",
  100: "#d4edd9",
  50: "#f3f8ed",
} as const;

const GOLD = {
  500: "#c9a227",
  400: "#d4b347",
} as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreLabel(pct: number): ScoreStyle {
  if (pct >= 80)
    return {
      label: "Excellent",
      labelAr: "ممتاز",
      color: "#059669",
      bg: "#d1fae5",
      border: "#6ee7b7",
    };
  if (pct >= 60)
    return {
      label: "Good",
      labelAr: "جيد",
      color: "#0284c7",
      bg: "#e0f2fe",
      border: "#7dd3fc",
    };
  if (pct >= 40)
    return {
      label: "Average",
      labelAr: "متوسط",
      color: "#d97706",
      bg: "#fef3c7",
      border: "#fcd34d",
    };
  return {
    label: "Needs Work",
    labelAr: "يحتاج تحسين",
    color: "#dc2626",
    bg: "#fee2e2",
    border: "#fca5a5",
  };
}

function categoryColor(pct: number): string {
  if (pct >= 70) return "#059669";
  if (pct >= 50) return "#d97706";
  return "#dc2626";
}

function fmt(date: string): string {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function groupAnswers(answers: Answer[]): Record<string, Answer[]> {
  return answers.reduce<Record<string, Answer[]>>((acc, ans) => {
    const key = ans.question.categoryKey;
    (acc[key] ??= []).push(ans);
    return acc;
  }, {});
}

function filterGrouped(
  grouped: Record<string, Answer[]>,
  query: string,
): Record<string, Answer[]> {
  const q = query.toLowerCase();
  return Object.entries(grouped).reduce<Record<string, Answer[]>>(
    (acc, [key, answers]) => {
      const filtered = answers.filter(
        (a) =>
          a.question.questionEn.toLowerCase().includes(q) ||
          a.question.questionAr.includes(query),
      );
      if (filtered.length > 0) acc[key] = filtered;
      return acc;
    },
    {},
  );
}

// ─── Radar Chart ──────────────────────────────────────────────────────────────

function RadarChart({ data }: { data: { label: string; pct: number }[] }) {
  const size = 300;
  const cx = 150;
  const cy = 150;
  const R = 100;
  const n = data.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  const polar = (r: number, i: number) => ({
    x: cx + r * Math.cos(startAngle + i * angleStep),
    y: cy + r * Math.sin(startAngle + i * angleStep),
  });

  const rings = [20, 40, 60, 80, 100];
  const dataPoints = data.map((d, i) => polar((d.pct / 100) * R, i));
  const polyPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") +
    " Z";

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[280px]">
        {/* Grid rings */}
        {rings.map((r) => (
          <polygon
            key={r}
            points={data
              .map((_, i) => {
                const p = polar((r / 100) * R, i);
                return `${p.x},${p.y}`;
              })
              .join(" ")}
            fill={r === 100 ? G[50] : "none"}
            stroke={r === 100 ? G[100] : "#e5e7eb"}
            strokeWidth={r === 100 ? 1.5 : 0.8}
          />
        ))}

        {/* Ring % labels */}
        {[40, 80].map((r) => {
          const p = polar((r / 100) * R, 0);
          return (
            <text key={r} x={p.x + 4} y={p.y} fontSize="8" fill="#d1d5db">
              {r}%
            </text>
          );
        })}

        {/* Axes */}
        {data.map((_, i) => {
          const p = polar(R, i);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="#e5e7eb"
              strokeWidth="0.8"
              strokeDasharray="3 3"
            />
          );
        })}

        {/* Data polygon */}
        <path
          d={polyPath}
          fill={`${G[600]}22`}
          stroke={G[600]}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Data dots */}
        {dataPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="5"
            fill={G[600]}
            stroke="white"
            strokeWidth="2"
          />
        ))}

        {/* Center label */}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="800"
          fill={G[700]}
        >
          Overall
        </text>
        <text
          x={cx}
          y={cy + 10}
          textAnchor="middle"
          fontSize="14"
          fontWeight="900"
          fill={G[600]}
        >
          {Math.round(data.reduce((s, d) => s + d.pct, 0) / data.length)}%
        </text>
      </svg>

      {/* External legend — no collision risk */}
      <div className="w-full grid grid-cols-2 gap-x-4 gap-y-2">
        {data.map((d, i) => {
          const sl = scoreLabel(d.pct);
          return (
            <div key={i} className="flex items-center gap-2">
              <div
                className="shrink-0 w-2 h-2 rounded-full"
                style={{ background: G[600] }}
              />
              <span className="text-[10px] text-gray-600 truncate capitalize flex-1">
                {d.label}
              </span>
              <span
                className="text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                style={{ color: sl.color, background: sl.bg }}
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

// ─── Donut Gauge ──────────────────────────────────────────────────────────────

function DonutGauge({ pct }: { pct: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const sl = scoreLabel(pct);
  const dash = (pct / 100) * circ;

  return (
    <div className="relative w-44 h-44 mx-auto">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="10"
        />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={sl.color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-black" style={{ color: sl.color }}>
          {pct}%
        </span>
        <span
          className="text-xs font-bold uppercase tracking-wider mt-0.5"
          style={{ color: sl.color }}
        >
          {sl.label}
        </span>
      </div>
    </div>
  );
}

// ─── Answer Badge ─────────────────────────────────────────────────────────────

function AnswerBadge({ label, value }: { label: string; value: number }) {
  if (label === "yes")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3" /> Yes · +{value}
      </span>
    );
  if (label === "partial")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
        <MinusCircle className="w-3 h-3" /> Partial · +{value}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
      <XCircle className="w-3 h-3" /> No · +{value}
    </span>
  );
}

// ─── Section Title ────────────────────────────────────────────────────────────

function SectionTitle({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center"
        style={{ background: G[50], border: `1px solid ${G[100]}` }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: G[600] }} />
      </div>
      <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
        {title}
      </h2>
      <div className="flex-1 h-px bg-gray-100 ml-2" />
    </div>
  );
}

// ─── Loading / Error States ───────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center gap-3 text-gray-400">
      <div
        className="w-5 h-5 border-2 border-gray-200 rounded-full animate-spin"
        style={{ borderTopColor: G[500] }}
      />
      <span className="text-sm">Loading report…</span>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-3">
      <p className="text-gray-500 font-medium">Report not found</p>
      <Link
        href="/admin/reports"
        className="text-sm hover:underline"
        style={{ color: G[600] }}
      >
        ← Back to Reports
      </Link>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Assessment1ReportPage() {
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        const found =
          (d.users ?? ([] as User[])).find((u: User) => u.id === id) ?? null;
        setUser(found);
      })
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
      const data = (await res.json()) as { error?: string };
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
      a.download = `CRAM-A1-${user.name.replace(/\s+/g, "-")}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <LoadingState />;
  if (!user || !user.assessment1) return <NotFoundState />;

  // ── Derived data ────────────────────────────────────────────────────────────

  const a1 = user.assessment1;
  const pct = a1.pct ?? 0;
  const sl = scoreLabel(pct);

  const catEntries = Object.entries(a1.catBreakdown).sort(
    ([, a], [, b]) => b.pct - a.pct,
  );

  const radarData = catEntries.map(([key, val]) => ({
    label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    pct: val.pct,
  }));

  const grouped = groupAnswers(a1.answers);
  const displayGrouped: Record<string, Answer[]> = search
    ? filterGrouped(grouped, search)
    : grouped;

  const sortedGrouped = Object.entries(displayGrouped).sort(([ka], [kb]) => {
    const oa =
      a1.answers.find((a) => a.question.categoryKey === ka)?.question
        .categoryOrder ?? 0;
    const ob =
      a1.answers.find((a) => a.question.categoryKey === kb)?.question
        .categoryOrder ?? 0;
    return oa - ob;
  });

  const strengths = catEntries.filter(([, v]) => v.pct >= 70).map(([k]) => k);
  const weaknesses = catEntries.filter(([, v]) => v.pct < 50).map(([k]) => k);

  const yes = a1.answers.filter((a) => a.selectedLabel === "yes").length;
  const partial = a1.answers.filter(
    (a) => a.selectedLabel === "partial",
  ).length;
  const no = a1.answers.filter((a) => a.selectedLabel === "no").length;
  const total = a1.answers.length;

  const distSegs = [
    { label: `Yes (${yes})`, width: (yes / total) * 100, color: "#059669" },
    {
      label: `Partial (${partial})`,
      width: (partial / total) * 100,
      color: "#d97706",
    },
    { label: `No (${no})`, width: (no / total) * 100, color: "#dc2626" },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap'); * { font-family: 'Outfit', sans-serif; }`}</style>

      {/* ── Sticky Toolbar ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/admin/reports"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Reports</span>
            </Link>
            <span className="text-gray-300">/</span>
            <div className="flex items-center gap-2 min-w-0">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${G[600]}, ${G[400]})`,
                }}
              >
                {user.name.charAt(0)}
              </div>
              <span className="text-sm font-bold text-gray-900 truncate">
                {user.name}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded font-bold shrink-0"
                style={{ background: sl.bg, color: sl.color }}
              >
                A1 · {pct}%
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {sendError && (
              <p className="text-xs text-red-500 hidden sm:block">
                {sendError}
              </p>
            )}
            <button
              onClick={handleSendEmail}
              disabled={sending || sent}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-all"
              style={{
                background: sent ? "#d1fae5" : "white",
                color: sent ? "#059669" : "#374151",
                borderColor: sent ? "#6ee7b7" : "#e5e7eb",
              }}
            >
              {sending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : sent ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Mail className="w-3.5 h-3.5" />
              )}
              {sent ? "Sent!" : sending ? "Sending…" : "Email"}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all"
              style={{
                background: `linear-gradient(135deg, ${G[600]}, ${G[800]})`,
              }}
            >
              {downloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              PDF
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          {/* ── Cover ── */}
          <div
            className="relative px-8 py-10 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${G[900]} 0%, ${G[800]} 70%, #1a3a2a 100%)`,
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none opacity-20"
              style={{
                backgroundImage: `repeating-linear-gradient(45deg, ${GOLD[500]}30 0, ${GOLD[500]}30 1px, transparent 1px, transparent 16px)`,
              }}
            />
            <div
              className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full pointer-events-none"
              style={{ background: `${GOLD[500]}06` }}
            />

            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-5">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${GOLD[500]}25`,
                      border: `1px solid ${GOLD[500]}40`,
                    }}
                  >
                    <Shield className="w-4 h-4" style={{ color: GOLD[400] }} />
                  </div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: GOLD[400] }}
                  >
                    CRAM Consulting · Assessment 1 Report
                  </span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
                  Governance
                  <br />
                  <span style={{ color: GOLD[400] }}>Assessment Report</span>
                </h1>
                <p className="text-white/60 text-sm mb-1">
                  <span className="text-white/80 font-semibold">
                    {user.name}
                  </span>
                  {user.organization && <> · {user.organization}</>}
                </p>
                <p className="text-white/40 text-xs">{fmt(a1.submittedAt)}</p>

                {/* Stat pills */}
                <div className="grid grid-cols-4 gap-3 mt-7">
                  {[
                    { l: "Score", v: `${a1.totalScore}/${a1.maxScore}` },
                    { l: "Questions", v: a1.answers.length },
                    { l: "Domains", v: catEntries.length },
                    { l: "Rating", v: sl.label },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className="rounded-xl px-3 py-2.5 text-center"
                      style={{
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="text-lg font-black text-white">{s.v}</div>
                      <div className="text-[9px] uppercase tracking-wider text-white/40 mt-0.5 font-semibold">
                        {s.l}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="shrink-0">
                <DonutGauge pct={pct} />
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div className="p-6 sm:p-8 space-y-10">
            {/* Executive Summary */}
            <section>
              <SectionTitle icon={FileText} title="Executive Summary" />
              <div className="grid md:grid-cols-3 gap-4">
                {/* Rating card */}
                <div
                  className="rounded-xl p-5 text-center border"
                  style={{ background: sl.bg, borderColor: sl.border }}
                >
                  <div
                    className="text-5xl font-black mb-1"
                    style={{ color: sl.color }}
                  >
                    {pct}%
                  </div>
                  <div
                    className="text-sm font-bold mb-2"
                    style={{ color: sl.color }}
                  >
                    {sl.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {a1.totalScore} / {a1.maxScore} pts
                  </div>
                  <div className="mt-3 h-2 rounded-full overflow-hidden bg-white/60">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: sl.color }}
                    />
                  </div>
                </div>

                {/* Strengths & weaknesses */}
                <div className="md:col-span-2 grid grid-cols-1 gap-3">
                  <div
                    className="rounded-xl p-4 border"
                    style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                        Strengths
                      </span>
                    </div>
                    {strengths.length === 0 ? (
                      <p className="text-xs text-gray-400">
                        No strong areas (≥70%) identified yet
                      </p>
                    ) : (
                      strengths.map((k) => (
                        <div key={k} className="flex items-center gap-2 mb-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="text-xs text-gray-700 capitalize">
                            {k.replace(/_/g, " ")} · {a1.catBreakdown[k]?.pct}%
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  <div
                    className="rounded-xl p-4 border"
                    style={{ background: "#fff7ed", borderColor: "#fed7aa" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-700">
                        Priority Areas
                      </span>
                    </div>
                    {weaknesses.length === 0 ? (
                      <p className="text-xs text-gray-400">
                        All domains above 50%
                      </p>
                    ) : (
                      weaknesses.map((k) => (
                        <div key={k} className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-3 h-3 text-orange-400 shrink-0" />
                          <span className="text-xs text-gray-700 capitalize">
                            {k.replace(/_/g, " ")} · {a1.catBreakdown[k]?.pct}%
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Charts */}
            <section>
              <SectionTitle icon={BarChart3} title="Performance by Domain" />
              <div className="grid md:grid-cols-2 gap-6">
                {/* Radar */}
                <div className="rounded-xl border border-gray-100 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                    Spider / Radar Chart
                  </p>
                  <RadarChart data={radarData} />
                </div>

                {/* Horizontal bars */}
                <div className="rounded-xl border border-gray-100 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
                    Domain Scores
                  </p>
                  {catEntries.map(([key, val]) => {
                    const c = categoryColor(val.pct);
                    return (
                      <div key={key} className="mb-3.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold text-gray-700 capitalize truncate mr-2">
                            {key.replace(/_/g, " ")}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[10px] text-gray-400">
                              {val.score}/{val.max}
                            </span>
                            <span
                              className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ color: c, background: `${c}15` }}
                            >
                              {val.pct}%
                            </span>
                          </div>
                        </div>
                        <div className="h-2.5 rounded-full overflow-hidden bg-gray-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${val.pct}%`,
                              background: `linear-gradient(90deg, ${G[600]}, ${GOLD[500]})`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Answer distribution */}
              <div className="mt-4 rounded-xl border border-gray-100 p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                  Answer Distribution
                </p>
                <div className="h-8 rounded-lg overflow-hidden flex gap-px">
                  {distSegs.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-center text-white text-xs font-bold"
                      style={{ width: `${s.width}%`, background: s.color }}
                    >
                      {s.width > 12 && s.label}
                    </div>
                  ))}
                </div>
                <div className="flex gap-5 mt-3">
                  {[
                    { l: "Yes", c: "#059669", v: yes },
                    { l: "Partial", c: "#d97706", v: partial },
                    { l: "No", c: "#dc2626", v: no },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-sm"
                        style={{ background: s.c }}
                      />
                      <span className="text-xs text-gray-600">
                        {s.l}: <strong>{s.v}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Detailed Responses */}
            <section>
              <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: G[50], border: `1px solid ${G[100]}` }}
                  >
                    <Target className="w-3.5 h-3.5" style={{ color: G[600] }} />
                  </div>
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">
                    Detailed Responses
                  </h2>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search questions…"
                    className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 bg-gray-50"
                    style={{ "--tw-ring-color": G[600] } as React.CSSProperties}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {sortedGrouped.map(([catKey, answers]) => {
                  const bd = a1.catBreakdown[catKey];
                  const cPct = bd?.pct ?? 0;
                  const csl = scoreLabel(cPct);

                  return (
                    <div
                      key={catKey}
                      className="rounded-xl border border-gray-100 overflow-hidden"
                    >
                      {/* Category header */}
                      <div
                        className="flex items-center justify-between px-5 py-3"
                        style={{ background: `${G[900]}08` }}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
                            style={{ background: G[600] }}
                          >
                            {answers[0]?.question.categoryOrder}
                          </div>
                          <span className="text-sm font-bold text-gray-900 capitalize">
                            {catKey.replace(/_/g, " ")}
                          </span>
                        </div>
                        {bd && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400">
                              {bd.score}/{bd.max}
                            </span>
                            <span
                              className="text-xs font-bold px-2.5 py-0.5 rounded-full border"
                              style={{
                                color: csl.color,
                                background: csl.bg,
                                borderColor: csl.border,
                              }}
                            >
                              {cPct}%
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Questions */}
                      <div className="divide-y divide-gray-50">
                        {[...answers]
                          .sort(
                            (a, b) =>
                              a.question.questionOrder -
                              b.question.questionOrder,
                          )
                          .map((ans: Answer) => (
                            <div
                              key={ans.id}
                              className="px-5 py-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-800 leading-relaxed">
                                    {ans.question.questionEn}
                                  </p>
                                  <p
                                    className="text-[11px] text-gray-400 mt-1 text-right"
                                    dir="rtl"
                                  >
                                    {ans.question.questionAr}
                                  </p>
                                </div>
                                <div className="shrink-0">
                                  <AnswerBadge
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
            </section>

            {/* Recommendations */}
            <section>
              <SectionTitle icon={Award} title="Recommendations" />
              {catEntries.every(([, v]) => v.pct >= 70) ? (
                <div className="text-center py-8 rounded-xl border border-gray-100">
                  <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400" />
                  <p className="text-sm font-medium text-gray-500">
                    All domains performing at or above benchmark
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {catEntries
                    .filter(([, v]) => v.pct < 70)
                    .slice(0, 5)
                    .map(([key, val], i) => (
                      <div
                        key={key}
                        className="flex gap-4 p-4 rounded-xl border"
                        style={{
                          borderColor: "#f0f0f0",
                          background: i === 0 ? G[50] : "#fafafa",
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                          style={{
                            background: i === 0 ? G[600] : "#f3f4f6",
                            color: i === 0 ? "#fff" : G[600],
                          }}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900 mb-0.5 capitalize">
                            {key.replace(/_/g, " ")} — {val.pct}%
                          </p>
                          <p className="text-xs text-gray-500 leading-relaxed">
                            {val.pct < 40
                              ? `Scored ${val.score}/${val.max}. This domain requires immediate structured intervention with a clear improvement roadmap.`
                              : `Scored ${val.score}/${val.max}. Targeted initiatives can bring this domain to the 70%+ benchmark.`}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </section>

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                CRAM Consulting · gm@cram.sa · cram.sa · Generated{" "}
                {new Date().toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · Confidential
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
