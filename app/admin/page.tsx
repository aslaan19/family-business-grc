"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  FileSpreadsheet,
  Clock,
  Search,
  Eye,
  X,
  BarChart3,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Bell,
  RefreshCw,
  ClipboardList,
  FileCheck,
  Phone,
  Mail,
  Building2,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Shield,
  Activity,
} from "lucide-react";

// Types
interface Answer {
  id: string;
  selectedLabel: string;
  selectedValue: number;
  question: {
    categoryKey: string;
    categoryOrder: number;
    questionOrder: number;
    questionEn: string;
    questionAr: string;
  };
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
  stage: "registered" | "assessment1_done" | "proposal_ready";
  assessment1: AssessmentData | null;
  assessment2: AssessmentData | null;
}

interface Stats {
  totalUsers: number;
  a1Done: number;
  a2Done: number;
  proposalReady: number;
  registered: number;
  avgScore1: number;
  avgScore2: number;
}

interface Charts {
  monthLabels: string[];
  monthCounts: number[];
  scoreBuckets: Record<string, number>;
  categoryAverages: { key: string; avg: number }[];
}

// Helpers
function pctColor(pct: number) {
  if (pct >= 75)
    return {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      bar: "bg-emerald-500",
      border: "border-emerald-200",
    };
  if (pct >= 50)
    return {
      text: "text-amber-700",
      bg: "bg-amber-50",
      bar: "bg-amber-500",
      border: "border-amber-200",
    };
  return {
    text: "text-red-700",
    bg: "bg-red-50",
    bar: "bg-red-500",
    border: "border-red-200",
  };
}

function stageMeta(stage: User["stage"]) {
  if (stage === "registered")
    return {
      label: "Registered",
      color: "bg-gray-100 text-gray-700 border-gray-200",
      dot: "bg-gray-400",
    };
  if (stage === "assessment1_done")
    return {
      label: "A1 Complete",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
    };
  return {
    label: "Ready",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  };
}

function labelColor(label: string) {
  if (label === "yes")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (label === "partial") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Mini Bar Chart
function MiniBarChart({
  labels,
  values,
  color = "#059669",
}: {
  labels: string[];
  values: number[];
  color?: string;
}) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-2 h-24 pt-4">
      {values.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-2 flex-1">
          <span className="text-xs font-semibold text-gray-900">{v}</span>
          <div
            className="w-full rounded-sm transition-all duration-500"
            style={{
              height: `${Math.max((v / max) * 60, 4)}px`,
              backgroundColor: color,
            }}
          />
          <span className="text-[10px] text-gray-500 font-medium">
            {labels[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

// Donut Chart
function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, v) => s + v.value, 0) || 1;
  let cumulative = 0;
  const size = 100;
  const r = 36;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#f1f5f9"
          strokeWidth="10"
        />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const rotation = (cumulative / total) * 360;
          // eslint-disable-next-line react-hooks/immutability
          cumulative += seg.value;
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={`${circumference * pct} ${circumference * (1 - pct)}`}
              style={{
                transform: `rotate(${rotation}deg)`,
                transformOrigin: `${cx}px ${cy}px`,
              }}
            />
          );
        })}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-gray-900 font-bold"
          style={{
            transform: "rotate(90deg)",
            transformOrigin: `${cx}px ${cy}px`,
            fontSize: 16,
          }}
        >
          {total}
        </text>
      </svg>
      <div className="space-y-2">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-gray-600">{seg.label}</span>
            <span className="text-xs font-bold text-gray-900 ml-auto ps-3">
              {seg.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Category Bars
function CategoryBars({ data }: { data: { key: string; avg: number }[] }) {
  return (
    <div className="space-y-3">
      {data.slice(0, 6).map((d) => {
        const c = pctColor(d.avg);
        return (
          <div key={d.key}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-600 capitalize truncate max-w-[160px]">
                {d.key.replace(/_/g, " ")}
              </span>
              <span className={`text-xs font-bold ${c.text}`}>{d.avg}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${c.bar} transition-all duration-700`}
                style={{ width: `${d.avg}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Score Buckets
function ScoreBuckets({ buckets }: { buckets: Record<string, number> }) {
  const entries = Object.entries(buckets);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#059669"];
  return (
    <div className="flex items-end gap-4 h-24 pt-4">
      {entries.map(([label, val], i) => (
        <div key={label} className="flex flex-col items-center gap-2 flex-1">
          <span className="text-xs font-bold text-gray-900">{val}</span>
          <div
            className="w-full rounded-sm"
            style={{
              height: `${Math.max((val / max) * 50, 4)}px`,
              backgroundColor: colors[i],
            }}
          />
          <span className="text-[10px] text-gray-500 font-medium">
            {label}%
          </span>
        </div>
      ))}
    </div>
  );
}

// User Drawer
function UserDrawer({ user, onClose }: { user: User; onClose: () => void }) {
  const [tab, setTab] = useState<"a1" | "a2">("a1");
  const activeAssessment = tab === "a1" ? user.assessment1 : user.assessment2;
  const sm = stageMeta(user.stage);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      <div
        className="w-full max-w-xl bg-white border-l border-gray-200 h-full overflow-y-auto flex flex-col shadow-2xl"
        style={{ animation: "slideIn 0.25s ease-out" }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-lg font-bold shadow-lg shadow-emerald-200">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{user.name}</h2>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${sm.color}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                  {sm.label}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { icon: Mail, val: user.email },
              { icon: Phone, val: user.phone ?? "Not provided" },
              { icon: Building2, val: user.organization ?? "Not provided" },
              { icon: Clock, val: fmt(user.createdAt) },
            ].map(({ icon: Icon, val }, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <Icon className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="truncate">{val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-5">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
            {(["a1", "a2"] as const).map((t) => {
              const hasData =
                t === "a1" ? !!user.assessment1 : !!user.assessment2;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  disabled={!hasData}
                  className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all ${
                    tab === t
                      ? "bg-white text-gray-900 shadow-sm"
                      : hasData
                        ? "text-gray-500 hover:text-gray-700"
                        : "text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {t === "a1" ? "Assessment 1" : "Assessment 2"}
                  {!hasData && (
                    <span className="ml-1 text-[10px]">(pending)</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {activeAssessment ? (
          <div className="px-6 py-5 space-y-5 flex-1">
            {/* Score */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500 font-medium">
                  Overall Score
                </span>
                <span
                  className={`text-3xl font-bold ${pctColor(activeAssessment.pct ?? 0).text}`}
                >
                  {activeAssessment.pct}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full ${pctColor(activeAssessment.pct ?? 0).bar} transition-all`}
                  style={{ width: `${activeAssessment.pct ?? 0}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{fmt(activeAssessment.submittedAt)}</span>
                <span>
                  {activeAssessment.totalScore} / {activeAssessment.maxScore}{" "}
                  points
                </span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 mb-4">
                Category Breakdown
              </h4>
              <div className="space-y-3">
                {Object.entries(activeAssessment.catBreakdown).map(
                  ([cat, data]) => {
                    const c = pctColor(data.pct);
                    return (
                      <div key={cat}>
                        <div className="flex justify-between mb-1">
                          <span className="text-xs text-gray-600 capitalize">
                            {cat.replace(/_/g, " ")}
                          </span>
                          <span className={`text-xs font-bold ${c.text}`}>
                            {data.pct}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${c.bar}`}
                            style={{ width: `${data.pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* Answers */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">
                All Responses
              </h4>
              <div className="space-y-2">
                {activeAssessment.answers
                  .sort(
                    (a, b) =>
                      a.question.categoryOrder - b.question.categoryOrder ||
                      a.question.questionOrder - b.question.questionOrder,
                  )
                  .map((ans) => (
                    <div
                      key={ans.id}
                      className="bg-gray-50 rounded-lg border border-gray-100 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {ans.question.questionEn}
                          </p>
                          <p
                            className="text-xs text-gray-400 mt-1 text-right"
                            dir="rtl"
                          >
                            {ans.question.questionAr}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full border ${labelColor(ans.selectedLabel)}`}
                          >
                            {ans.selectedLabel === "yes"
                              ? "Yes"
                              : ans.selectedLabel === "partial"
                                ? "Partial"
                                : "No"}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            +{ans.selectedValue}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-3 text-gray-400">
            <ClipboardList className="w-10 h-10" />
            <p className="text-sm font-medium">Assessment not submitted yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Pipeline Card
function PipelineCard({ user, onClick }: { user: User; onClick: () => void }) {
  const pct = user.assessment1?.pct;
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white hover:bg-gray-50 border border-gray-200 hover:border-emerald-300 rounded-lg p-4 transition-all group shadow-sm hover:shadow"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
          {user.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {user.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.organization ?? user.email}
          </p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0" />
      </div>
      {pct !== null && pct !== undefined && (
        <>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${pctColor(pct).bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-gray-400">
              {fmt(user.createdAt)}
            </span>
            <span className={`text-xs font-bold ${pctColor(pct).text}`}>
              {pct}%
            </span>
          </div>
        </>
      )}
    </button>
  );
}

// Main
export default function AdminPage() {
  const [data, setData] = useState<{
    users: User[];
    stats: Stats;
    charts: Charts;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<"all" | User["stage"]>("all");
  const [sortBy, setSortBy] = useState<"date" | "score" | "name">("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [exporting, setExporting] = useState(false);
  const [view, setView] = useState<"table" | "pipeline">("table");
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    setRefreshing(true);
    const res = await fetch("/api/admin/stats");
    const json = await res.json();
    setData(json);
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    load();
  }, []);

  const users = data?.users ?? [];
  const stats = data?.stats;
  const charts = data?.charts;

  const filtered = useMemo(
    () =>
      users
        .filter((u) => stageFilter === "all" || u.stage === stageFilter)
        .filter((u) =>
          [u.name, u.email, u.organization ?? ""]
            .join(" ")
            .toLowerCase()
            .includes(search.toLowerCase()),
        )
        .sort((a, b) => {
          let cmp = 0;
          if (sortBy === "name") cmp = a.name.localeCompare(b.name);
          if (sortBy === "date")
            cmp =
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          if (sortBy === "score")
            cmp = (a.assessment1?.pct ?? -1) - (b.assessment1?.pct ?? -1);
          return sortAsc ? cmp : -cmp;
        }),
    [users, stageFilter, search, sortBy, sortAsc],
  );

  function SortBtn({ col, label }: { col: typeof sortBy; label: string }) {
    const active = sortBy === col;
    return (
      <button
        onClick={() => {
          if (active) setSortAsc((v) => !v);
          else {
            setSortBy(col);
            setSortAsc(false);
          }
        }}
        className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 uppercase tracking-wide transition-colors"
      >
        {label}
        {active ? (
          sortAsc ? (
            <ChevronUp className="w-3 h-3 text-emerald-600" />
          ) : (
            <ChevronDown className="w-3 h-3 text-emerald-600" />
          )
        ) : (
          <ChevronDown className="w-3 h-3 opacity-30" />
        )}
      </button>
    );
  }

  async function handleExport() {
    setExporting(true);
    try {
      const res = await fetch("/api/export");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cram-submissions-${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  const pipeline = {
    registered: users.filter((u) => u.stage === "registered"),
    assessment1_done: users.filter((u) => u.stage === "assessment1_done"),
    proposal_ready: users.filter((u) => u.stage === "proposal_ready"),
  };

  return (
    <>
      <style>{`
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-gray-900">
                  CRAM Admin Portal
                </h1>
                <p className="text-xs text-gray-500">
                  Governance Assessment Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={load}
                disabled={refreshing}
                className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={handleExport}
                disabled={exporting || !stats?.a1Done}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-lg shadow-emerald-200"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {exporting ? "Exporting..." : "Export"}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              {
                icon: Users,
                label: "Total Users",
                value: stats?.totalUsers ?? "—",
                color: "bg-gray-100 text-gray-600",
              },
              {
                icon: ClipboardList,
                label: "Assessment 1",
                value: stats?.a1Done ?? "—",
                color: "bg-blue-50 text-blue-600",
              },
              {
                icon: FileCheck,
                label: "Assessment 2",
                value: stats?.a2Done ?? "—",
                color: "bg-violet-50 text-violet-600",
              },
              {
                icon: CheckCircle,
                label: "Ready",
                value: stats?.proposalReady ?? "—",
                color: "bg-emerald-50 text-emerald-600",
              },
              {
                icon: Clock,
                label: "Pending",
                value: stats?.registered ?? "—",
                color: "bg-amber-50 text-amber-600",
              },
              {
                icon: BarChart3,
                label: "Avg A1",
                value: stats ? `${stats.avgScore1}%` : "—",
                color: "bg-cyan-50 text-cyan-600",
              },
              {
                icon: TrendingUp,
                label: "Avg A2",
                value: stats ? `${stats.avgScore2}%` : "—",
                color: "bg-pink-50 text-pink-600",
              },
            ].map((card, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
              >
                <div
                  className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center mb-3`}
                >
                  <card.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          {charts && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Registrations
                    </h3>
                    <p className="text-xs text-gray-500">Last 6 months</p>
                  </div>
                  <Activity className="w-4 h-4 text-emerald-500" />
                </div>
                <MiniBarChart
                  labels={charts.monthLabels}
                  values={charts.monthCounts}
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Pipeline
                    </h3>
                    <p className="text-xs text-gray-500">User stages</p>
                  </div>
                  <Briefcase className="w-4 h-4 text-gray-400" />
                </div>
                <DonutChart
                  segments={[
                    {
                      label: "Registered",
                      value: stats?.registered ?? 0,
                      color: "#9ca3af",
                    },
                    {
                      label: "A1 Done",
                      value: (stats?.a1Done ?? 0) - (stats?.a2Done ?? 0),
                      color: "#3b82f6",
                    },
                    {
                      label: "Ready",
                      value: stats?.proposalReady ?? 0,
                      color: "#059669",
                    },
                  ]}
                />
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Score Distribution
                    </h3>
                    <p className="text-xs text-gray-500">Assessment 1</p>
                  </div>
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                </div>
                <ScoreBuckets buckets={charts.scoreBuckets} />
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      Categories
                    </h3>
                    <p className="text-xs text-gray-500">Average scores</p>
                  </div>
                  <AlertCircle className="w-4 h-4 text-gray-400" />
                </div>
                <CategoryBars data={charts.categoryAverages} />
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-lg">
              {(
                [
                  ["all", "All"],
                  ["registered", "Registered"],
                  ["assessment1_done", "A1 Done"],
                  ["proposal_ready", "Ready"],
                ] as const
              ).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => setStageFilter(val)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${stageFilter === val ? "bg-emerald-600 text-white" : "text-gray-500 hover:text-gray-900"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-1 bg-white border border-gray-200 rounded-lg">
              <button
                onClick={() => setView("table")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === "table" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
              >
                Table
              </button>
              <button
                onClick={() => setView("pipeline")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${view === "pipeline" ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
              >
                Pipeline
              </button>
            </div>
          </div>

          {/* Table View */}
          {view === "table" && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              {loading ? (
                <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-24">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">
                    No users found
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="px-6 py-4 text-left">
                          <SortBtn col="name" label="User" />
                        </th>
                        <th className="px-6 py-4 text-left hidden md:table-cell">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Organization
                          </span>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            Status
                          </span>
                        </th>
                        <th className="px-6 py-4 text-left">
                          <SortBtn col="score" label="A1 Score" />
                        </th>
                        <th className="px-6 py-4 text-left hidden lg:table-cell">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            A2 Score
                          </span>
                        </th>
                        <th className="px-6 py-4 text-left hidden xl:table-cell">
                          <SortBtn col="date" label="Registered" />
                        </th>
                        <th className="px-6 py-4" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((user) => {
                        const sm = stageMeta(user.stage);
                        const p1 = user.assessment1?.pct;
                        const p2 = user.assessment2?.pct;
                        return (
                          <tr
                            key={user.id}
                            className="hover:bg-gray-50 transition-colors group"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {user.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {user.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                              <span className="text-sm text-gray-600">
                                {user.organization ?? (
                                  <span className="text-gray-300">—</span>
                                )}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sm.color}`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${sm.dot}`}
                                />
                                {sm.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {p1 !== undefined && p1 !== null ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${pctColor(p1).bar}`}
                                      style={{ width: `${p1}%` }}
                                    />
                                  </div>
                                  <span
                                    className={`text-sm font-bold ${pctColor(p1).text}`}
                                  >
                                    {p1}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-300 text-sm">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 hidden lg:table-cell">
                              {p2 !== undefined && p2 !== null ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${pctColor(p2).bar}`}
                                      style={{ width: `${p2}%` }}
                                    />
                                  </div>
                                  <span
                                    className={`text-sm font-bold ${pctColor(p2).text}`}
                                  >
                                    {p2}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-gray-300 text-sm">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 hidden xl:table-cell">
                              <span className="text-xs text-gray-500">
                                {fmt(user.createdAt)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-all border border-emerald-200"
                              >
                                <Eye className="w-3.5 h-3.5" /> View
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {!loading && filtered.length > 0 && (
                <div className="px-6 py-3 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-500">
                    Showing{" "}
                    <span className="text-gray-900 font-semibold">
                      {filtered.length}
                    </span>{" "}
                    of{" "}
                    <span className="text-gray-900 font-semibold">
                      {users.length}
                    </span>{" "}
                    users
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pipeline View */}
          {view === "pipeline" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  key: "registered",
                  title: "Registered",
                  sub: "Awaiting assessment",
                  color: "border-t-gray-400",
                  icon: Clock,
                  users: pipeline.registered,
                },
                {
                  key: "assessment1_done",
                  title: "A1 Complete",
                  sub: "Ready for A2",
                  color: "border-t-blue-500",
                  icon: ClipboardList,
                  users: pipeline.assessment1_done,
                },
                {
                  key: "proposal_ready",
                  title: "Proposal Ready",
                  sub: "Both complete",
                  color: "border-t-emerald-500",
                  icon: CheckCircle,
                  users: pipeline.proposal_ready,
                },
              ].map((col) => (
                <div
                  key={col.key}
                  className={`bg-white border border-gray-200 rounded-xl overflow-hidden border-t-4 ${col.color}`}
                >
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <col.icon className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="text-sm font-bold text-gray-900">
                          {col.title}
                        </h3>
                        <p className="text-xs text-gray-500">{col.sub}</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">
                      {col.users.length}
                    </span>
                  </div>
                  <div className="p-3 space-y-2 max-h-[480px] overflow-y-auto">
                    {col.users.length === 0 ? (
                      <p className="text-center text-gray-400 text-xs py-8">
                        No users in this stage
                      </p>
                    ) : (
                      col.users.map((u) => (
                        <PipelineCard
                          key={u.id}
                          user={u}
                          onClick={() => setSelectedUser(u)}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {selectedUser && (
        <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </>
  );
}
