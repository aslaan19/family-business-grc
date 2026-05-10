/* eslint-disable react-hooks/immutability */
"use client";
import { useRouter } from "next/navigation";
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
  RefreshCw,
  ClipboardList,
  FileCheck,
  Phone,
  Mail,
  Building2,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Shield,
  Activity,
  ArrowRight,
  Sparkles,
  TableProperties,
  Menu,
  ChevronRight,
  Filter,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  rawPayload?: Record<string, unknown>;
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

// ─── A2 Schema metadata ───────────────────────────────────────────────────────

const A2_SECTIONS: {
  id: string;
  titleEn: string;
  icon: string;
  keys: string[];
}[] = [
  {
    id: "basic_info",
    titleEn: "Basic Company Information",
    icon: "🏢",
    keys: [
      "legalName",
      "yearEstablished",
      "numEmployees",
      "numBranches",
      "citiesOperation",
      "industrySector",
      "mainProducts",
      "annualRevenue",
      "approxCapital",
      "projectsPerYear",
      "avgProjectSize",
      "keyClients",
    ],
  },
  {
    id: "organization",
    titleEn: "Organizational Structure",
    icon: "🏗️",
    keys: ["departments"],
  },
  {
    id: "board_governance",
    titleEn: "Board & Governance",
    icon: "⚖️",
    keys: [
      "boardExists",
      "advisoryBoard",
      "auditCommittee",
      "riskCommittee",
      "nominationCommittee",
      "numBoardMembers",
      "independentDirectors",
    ],
  },
  {
    id: "strategy",
    titleEn: "Strategy & Planning",
    icon: "🎯",
    keys: [
      "vision",
      "mission",
      "strategicObjectives",
      "writtenStrategy",
      "annualOperatingPlan",
      "strategicKPIs",
    ],
  },
  {
    id: "financial",
    titleEn: "Financial Overview",
    icon: "💰",
    keys: [
      "revenueRange",
      "capital",
      "profitabilityPct",
      "majorRevenueStreams",
      "top5Clients",
      "keyCostDrivers",
    ],
  },
  {
    id: "operations",
    titleEn: "Core Operations",
    icon: "⚙️",
    keys: ["coreProcesses"],
  },
  {
    id: "governance_docs",
    titleEn: "Governance Documentation",
    icon: "📋",
    keys: [
      "govCharter",
      "boardCharter",
      "committeeCharters",
      "conflictPolicy",
      "delegationAuth",
      "policiesRepo",
    ],
  },
  {
    id: "risks",
    titleEn: "Risk Management",
    icon: "🛡️",
    keys: [
      "riskFramework",
      "riskRegister",
      "annualRiskAssess",
      "riskCommitteeExists",
      "top5Risks",
    ],
  },
];

const A2_LABELS: Record<string, string> = {
  legalName: "Legal Company Name",
  yearEstablished: "Year Established",
  numEmployees: "No. of Employees",
  numBranches: "No. of Branches",
  citiesOperation: "Cities / Countries",
  industrySector: "Industry Sector",
  mainProducts: "Main Products / Services",
  annualRevenue: "Annual Revenue Range",
  approxCapital: "Approximate Capital",
  projectsPerYear: "Projects / Year",
  avgProjectSize: "Avg Project Size",
  keyClients: "Key Clients",
  departments: "Departments Table",
  vision: "Company Vision",
  mission: "Company Mission",
  strategicObjectives: "Strategic Objectives",
  writtenStrategy: "Written Strategy Document",
  annualOperatingPlan: "Annual Operating Plan",
  strategicKPIs: "Strategic KPIs",
  boardExists: "Board of Directors",
  advisoryBoard: "Advisory Board",
  auditCommittee: "Audit Committee",
  riskCommittee: "Risk Committee",
  nominationCommittee: "Nomination / Remuneration Committee",
  numBoardMembers: "No. of Board Members",
  independentDirectors: "Independent Directors",
  revenueRange: "Revenue Range",
  capital: "Capital",
  profitabilityPct: "Profitability %",
  majorRevenueStreams: "Major Revenue Streams",
  top5Clients: "Top 5 Clients",
  keyCostDrivers: "Key Cost Drivers",
  coreProcesses: "Core Processes Table",
  govCharter: "Governance Charter",
  boardCharter: "Board Charter",
  committeeCharters: "Committee Charters",
  conflictPolicy: "Conflict of Interest Policy",
  delegationAuth: "Delegation of Authority",
  policiesRepo: "Corporate Policies Repository",
  riskFramework: "Risk Management Framework",
  riskRegister: "Risk Register",
  annualRiskAssess: "Annual Risk Assessment",
  riskCommitteeExists: "Risk Committee",
  top5Risks: "Top 5 Business Risks",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pctColor(pct: number) {
  if (pct >= 75)
    return {
      text: "text-emerald-700",
      bg: "bg-emerald-50",
      bar: "bg-emerald-500",
      border: "border-emerald-200",
      light: "bg-emerald-100",
    };
  if (pct >= 50)
    return {
      text: "text-amber-700",
      bg: "bg-amber-50",
      bar: "bg-amber-500",
      border: "border-amber-200",
      light: "bg-amber-100",
    };
  return {
    text: "text-red-700",
    bg: "bg-red-50",
    bar: "bg-red-500",
    border: "border-red-200",
    light: "bg-red-100",
  };
}

function stageMeta(stage: User["stage"]) {
  if (stage === "registered")
    return {
      label: "Registered",
      color: "bg-gray-100 text-gray-600 border-gray-200",
      dot: "bg-gray-400",
    };
  if (stage === "assessment1_done")
    return {
      label: "A1 Complete",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
    };
  return {
    label: "Proposal Ready",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
  };
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function labelColor(label: string) {
  if (label === "yes")
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (label === "partial") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-700 border-red-200";
}

// ─── Charts ───────────────────────────────────────────────────────────────────

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
    <div className="flex items-end gap-1.5 h-20 pt-2">
      {values.map((v, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-[10px] font-bold text-gray-900">{v}</span>
          <div
            className="w-full rounded-sm"
            style={{
              height: `${Math.max((v / max) * 48, 4)}px`,
              backgroundColor: color,
            }}
          />
          <span className="text-[9px] text-gray-400 font-medium">
            {labels[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, v) => s + v.value, 0) || 1;
  let cumulative = 0;
  const r = 36;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-4">
      <svg width={100} height={100} className="-rotate-90">
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
      <div className="space-y-1.5 flex-1">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-xs text-gray-600 flex-1">{seg.label}</span>
            <span className="text-xs font-bold text-gray-900">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryBars({ data }: { data: { key: string; avg: number }[] }) {
  return (
    <div className="space-y-3">
      {data.slice(0, 6).map((d) => {
        const c = pctColor(d.avg);
        return (
          <div key={d.key}>
            <div className="flex items-center justify-between mb-1">
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

function ScoreBuckets({ buckets }: { buckets: Record<string, number> }) {
  const entries = Object.entries(buckets);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  const colors = ["#ef4444", "#f59e0b", "#3b82f6", "#059669"];
  return (
    <div className="flex items-end gap-3 h-20 pt-2">
      {entries.map(([label, val], i) => (
        <div key={label} className="flex flex-col items-center gap-1 flex-1">
          <span className="text-xs font-bold text-gray-900">{val}</span>
          <div
            className="w-full rounded-sm"
            style={{
              height: `${Math.max((val / max) * 44, 4)}px`,
              backgroundColor: colors[i],
            }}
          />
          <span className="text-[10px] text-gray-400 font-medium">
            {label}%
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── A2 Value Renderer ────────────────────────────────────────────────────────

function A2Value({ val }: { fieldKey: string; val: unknown }) {
  if (val === undefined || val === null || val === "")
    return <span className="text-gray-300 italic text-xs">Not provided</span>;
  if (Array.isArray(val)) {
    if (val.length === 0)
      return (
        <span className="text-gray-300 italic text-xs">No entries added</span>
      );
    const cols = Object.keys(val[0] as object);
    return (
      <div className="overflow-x-auto rounded-lg border border-gray-200 mt-1">
        <table className="w-full min-w-[320px] text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {cols.map((c) => (
                <th
                  key={c}
                  className="px-3 py-2 text-left text-[10px] font-bold text-gray-500 uppercase tracking-wide"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(val as Record<string, string>[]).map((row, ri) => (
              <tr key={ri} className="hover:bg-gray-50">
                {cols.map((c) => (
                  <td key={c} className="px-3 py-2 text-gray-700">
                    {row[c] || <span className="text-gray-300">—</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  if (val === "Yes" || val === "No") {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${val === "Yes" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}
      >
        {val === "Yes" ? "✓ Yes" : "✗ No"}
      </span>
    );
  }
  if (typeof val === "string" && val.length > 80) {
    return (
      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
        {val}
      </p>
    );
  }
  return (
    <span className="text-sm font-semibold text-gray-900">{String(val)}</span>
  );
}

function A2Completeness({ payload }: { payload: Record<string, unknown> }) {
  const allKeys = A2_SECTIONS.flatMap((s) => s.keys);
  const filled = allKeys.filter((k) => {
    const v = payload[k];
    if (!v) return false;
    if (Array.isArray(v)) return v.length > 0;
    return String(v).trim() !== "";
  }).length;
  const pct = Math.round((filled / allKeys.length) * 100);
  const c = pctColor(pct);
  return (
    <div className="flex items-center gap-3 mb-4 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
      <div className={`text-2xl font-black ${c.text}`}>{pct}%</div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-gray-700 mb-1">
          Form Completeness — {filled} / {allKeys.length} fields
        </p>
        <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${c.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── User Drawer ──────────────────────────────────────────────────────────────

function UserDrawer({ user, onClose }: { user: User; onClose: () => void }) {
  const [tab, setTab] = useState<"a1" | "a2">(user.assessment1 ? "a1" : "a2");
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(["basic_info"]),
  );
  const sm = stageMeta(user.stage);

  function toggleSection(id: string) {
    setOpenSections((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const a1 = user.assessment1;
  const a2 = user.assessment2;
  const payload = a2?.rawPayload ?? {};

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop — tap to close */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Sheet slides up from bottom on mobile, from right on desktop */}
      <div
        className="relative mt-auto sm:mt-0 sm:ml-auto w-full sm:w-[600px] sm:max-w-full h-[92dvh] sm:h-full bg-white rounded-t-3xl sm:rounded-none sm:rounded-l-2xl flex flex-col shadow-2xl overflow-hidden"
        style={{ animation: "drawerUp 0.3s cubic-bezier(.32,.72,0,1)" }}
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        <div className="px-5 pt-3 pb-4 border-b border-gray-100 bg-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-xl font-black shadow-lg shadow-emerald-200 shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 leading-tight">
                  {user.name}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border mt-1 ${sm.color}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${sm.dot}`} />
                  {sm.label}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Contact info — 2×2 grid on mobile */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: Mail, val: user.email, truncate: true },
              { icon: Phone, val: user.phone ?? "—", truncate: false },
              {
                icon: Building2,
                val: user.organization ?? "—",
                truncate: true,
              },
              { icon: Clock, val: fmt(user.createdAt), truncate: false },
            ].map(({ icon: Icon, val, truncate }, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2"
              >
                <Icon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span
                  className={`text-xs text-gray-600 ${truncate ? "truncate" : ""}`}
                >
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-5 pt-4 pb-0 bg-white">
          <div className="flex gap-1 p-1 bg-gray-100 rounded-2xl">
            {(["a1", "a2"] as const).map((t) => {
              const hasData = t === "a1" ? !!a1 : !!a2;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  disabled={!hasData}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1.5 ${tab === t ? "bg-white text-gray-900 shadow-sm" : hasData ? "text-gray-500" : "text-gray-300 cursor-not-allowed"}`}
                >
                  {t === "a1" ? (
                    <>
                      <BarChart3 className="w-3.5 h-3.5" />{" "}
                      <span>Assessment 1</span>
                    </>
                  ) : (
                    <>
                      <FileCheck className="w-3.5 h-3.5" /> <span>Profile</span>
                    </>
                  )}
                  {!hasData && (
                    <span className="text-[9px] opacity-60">(pending)</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* ── Assessment 1 ── */}
          {tab === "a1" && (
            <div className="px-5 py-4 space-y-4">
              {a1 ? (
                <>
                  {/* Score hero */}
                  <div
                    className={`rounded-2xl p-5 border ${pctColor(a1.pct ?? 0).border} ${pctColor(a1.pct ?? 0).bg}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Overall Score
                        </p>
                        <p
                          className={`text-5xl font-black mt-0.5 ${pctColor(a1.pct ?? 0).text}`}
                        >
                          {a1.pct}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900">
                          {a1.totalScore}
                        </p>
                        <p className="text-xs text-gray-500">
                          of {a1.maxScore} pts
                        </p>
                      </div>
                    </div>
                    <div className="h-2.5 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${pctColor(a1.pct ?? 0).bar}`}
                        style={{ width: `${a1.pct ?? 0}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Submitted {fmt(a1.submittedAt)}
                    </p>
                  </div>

                  {/* Category breakdown */}
                  <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-gray-400" /> Category
                      Breakdown
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(a1.catBreakdown)
                        .sort(([, a], [, b]) => b.pct - a.pct)
                        .map(([cat, data]) => {
                          const c = pctColor(data.pct);
                          return (
                            <div key={cat}>
                              <div className="flex justify-between mb-1">
                                <span className="text-xs text-gray-600 capitalize">
                                  {cat.replace(/_/g, " ")}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-gray-400">
                                    {data.score}/{data.max}
                                  </span>
                                  <span
                                    className={`text-xs font-bold ${c.text}`}
                                  >
                                    {data.pct}%
                                  </span>
                                </div>
                              </div>
                              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${c.bar}`}
                                  style={{ width: `${data.pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Grouped answers */}
                  {Object.entries(
                    a1.answers
                      .sort(
                        (a, b) =>
                          a.question.categoryOrder - b.question.categoryOrder ||
                          a.question.questionOrder - b.question.questionOrder,
                      )
                      .reduce<Record<string, Answer[]>>((acc, ans) => {
                        const k = ans.question.categoryKey;
                        if (!acc[k]) acc[k] = [];
                        acc[k].push(ans);
                        return acc;
                      }, {}),
                  ).map(([cat, answers]) => {
                    const catScore = answers.reduce(
                      (s, a) => s + a.selectedValue,
                      0,
                    );
                    const catMax = answers.length * 10;
                    const catPct = Math.round((catScore / catMax) * 100);
                    const c = pctColor(catPct);
                    return (
                      <div key={cat}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide capitalize">
                            {cat.replace(/_/g, " ")}
                          </h4>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text} border ${c.border}`}
                          >
                            {catScore}/{catMax}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {answers.map((ans) => (
                            <div
                              key={ans.id}
                              className="bg-white rounded-xl border border-gray-100 p-3.5"
                            >
                              <div className="flex items-start gap-3">
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
                                <div className="flex flex-col items-end gap-1 shrink-0 mt-0.5">
                                  <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${labelColor(ans.selectedLabel)}`}
                                  >
                                    {ans.selectedLabel === "yes"
                                      ? "✓ Yes"
                                      : ans.selectedLabel === "partial"
                                        ? "~ Part"
                                        : "✗ No"}
                                  </span>
                                  <span
                                    className={`text-[11px] font-bold ${ans.selectedValue === 10 ? "text-emerald-600" : ans.selectedValue === 5 ? "text-amber-600" : "text-red-500"}`}
                                  >
                                    +{ans.selectedValue}pt
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 text-gray-400 py-16">
                  <ClipboardList className="w-12 h-12" />
                  <p className="text-sm font-medium">
                    Assessment 1 not submitted yet
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Assessment 2 ── */}
          {tab === "a2" && (
            <div className="px-5 py-4">
              {a2 ? (
                <div className="space-y-3">
                  <A2Completeness payload={payload} />
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 mb-3">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />{" "}
                    Submitted {fmt(a2.submittedAt)}
                  </p>
                  {A2_SECTIONS.map((section) => {
                    const isOpen = openSections.has(section.id);
                    const filled = section.keys.filter((k) => {
                      const v = payload[k];
                      if (!v) return false;
                      if (Array.isArray(v)) return (v as unknown[]).length > 0;
                      return String(v).trim() !== "";
                    }).length;
                    return (
                      <div
                        key={section.id}
                        className="border border-gray-200 rounded-2xl overflow-hidden"
                      >
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center justify-between px-4 py-4 bg-gray-50 text-left active:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{section.icon}</span>
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {section.titleEn}
                              </p>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                {filled} / {section.keys.length} fields
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <div className="flex gap-0.5">
                              {section.keys.map((k) => {
                                const v = payload[k];
                                const ok =
                                  v &&
                                  (Array.isArray(v)
                                    ? (v as unknown[]).length > 0
                                    : String(v).trim() !== "");
                                return (
                                  <div
                                    key={k}
                                    className={`w-1.5 h-3 rounded-sm ${ok ? "bg-emerald-500" : "bg-gray-200"}`}
                                  />
                                );
                              })}
                            </div>
                            {isOpen ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </button>
                        {isOpen && (
                          <div className="px-4 py-4 space-y-4 bg-white">
                            {section.keys.map((k) => {
                              const val = payload[k];
                              const isEmpty =
                                !val ||
                                (Array.isArray(val)
                                  ? (val as unknown[]).length === 0
                                  : String(val).trim() === "");
                              return (
                                <div
                                  key={k}
                                  className={isEmpty ? "opacity-50" : ""}
                                >
                                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                    {A2_LABELS[k] ?? k}
                                    {isEmpty && (
                                      <span className="ml-2 normal-case text-gray-400 font-normal">
                                        — not provided
                                      </span>
                                    )}
                                  </p>
                                  <A2Value fieldKey={k} val={val} />
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 text-gray-400 py-16">
                  <FileCheck className="w-12 h-12" />
                  <p className="text-sm font-medium">
                    Assessment 2 not submitted yet
                  </p>
                  <p className="text-xs text-center max-w-xs">
                    Complete Assessment 1 first, then fill out the institutional
                    profile.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── User List Item (mobile-first card) ──────────────────────────────────────

function UserListItem({ user, onClick }: { user: User; onClick: () => void }) {
  const p1 = user.assessment1?.pct;
  const sm = stageMeta(user.stage);
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white active:bg-gray-50 border-b border-gray-100 px-4 py-4 transition-colors flex items-center gap-3 group"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
        {user.name.charAt(0)}
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {user.name}
          </p>
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium border shrink-0 ${sm.color}`}
          >
            <span className={`w-1 h-1 rounded-full ${sm.dot}`} />
            {sm.label}
          </span>
        </div>
        <p className="text-xs text-gray-500 truncate">
          {user.organization ?? user.email}
        </p>
        {p1 !== null && p1 !== undefined && (
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden max-w-[80px]">
              <div
                className={`h-full rounded-full ${pctColor(p1).bar}`}
                style={{ width: `${p1}%` }}
              />
            </div>
            <span className={`text-[11px] font-bold ${pctColor(p1).text}`}>
              {p1}%
            </span>
          </div>
        )}
      </div>
      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-emerald-500 transition-colors shrink-0" />
    </button>
  );
}

// ─── Pipeline Card ─────────────────────────────────────────────────────────────

function PipelineCard({ user, onClick }: { user: User; onClick: () => void }) {
  const pct = user.assessment1?.pct;
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white active:bg-gray-50 border border-gray-200 rounded-xl p-4 transition-all group shadow-sm"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
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
        <ArrowRight className="w-4 h-4 text-gray-300 group-active:text-emerald-500 shrink-0" />
      </div>
      {pct !== null && pct !== undefined && (
        <>
          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${pctColor(pct).bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
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

// ─── Main ─────────────────────────────────────────────────────────────────────

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
  const [view, setView] = useState<"list" | "pipeline">("list");
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showCharts, setShowCharts] = useState(false);
  const router = useRouter();

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

  const kpis = [
    {
      icon: Users,
      label: "Total",
      value: stats?.totalUsers ?? "—",
      color: "bg-gray-100 text-gray-600",
    },
    {
      icon: ClipboardList,
      label: "A1 Done",
      value: stats?.a1Done ?? "—",
      color: "bg-blue-50 text-blue-600",
    },
    {
      icon: FileCheck,
      label: "A2 Done",
      value: stats?.a2Done ?? "—",
      color: "bg-violet-50 text-violet-600",
    },
    {
      icon: Sparkles,
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
  ];

  return (
    <>
      <style>{`
        @keyframes drawerUp { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slideIn  { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @media (min-width: 640px) {
          [data-drawer] { animation: slideIn 0.25s ease-out !important; margin-top: 0 !important; height: 100% !important; border-radius: 0 !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 pb-24 sm:pb-8">
        {/* ── Top Header ── */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200 shrink-0">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                  CRAM Admin
                </h1>
                <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">
                  Governance Assessment Dashboard
                </p>
              </div>
            </div>

            {/* Desktop actions */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                onClick={() => router.push("/admin/reports")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 text-xs font-semibold"
              >
                <TableProperties className="w-4 h-4" /> Reports
              </button>
              <button
                onClick={load}
                disabled={refreshing}
                className="w-9 h-9 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-400"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={handleExport}
                disabled={exporting || !stats?.a1Done}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold disabled:opacity-40"
              >
                <FileSpreadsheet className="w-4 h-4" />
                {exporting ? "Exporting…" : "Export Excel"}
              </button>
            </div>

            {/* Mobile: refresh + menu */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={load}
                disabled={refreshing}
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-400"
              >
                <RefreshCw
                  className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={() => router.push("/admin/reports")}
                className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500"
              >
                <TableProperties className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto">
          {/* ── KPI Strip (horizontal scroll on mobile) ── */}
          <div className="px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-4">
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide sm:grid sm:grid-cols-6">
              {kpis.map((k, i) => (
                <div
                  key={i}
                  className="bg-white border border-gray-200 rounded-2xl p-4 flex-shrink-0 w-[120px] sm:w-auto hover:shadow-sm transition-shadow"
                >
                  <div
                    className={`w-8 h-8 rounded-lg ${k.color} flex items-center justify-center mb-2`}
                  >
                    <k.icon className="w-4 h-4" />
                  </div>
                  <p className="text-xl font-black text-gray-900">{k.value}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                    {k.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Charts (collapsible on mobile) ── */}
          {charts && (
            <div className="px-4 sm:px-6 mb-4">
              {/* Mobile toggle */}
              <button
                onClick={() => setShowCharts((v) => !v)}
                className="sm:hidden w-full flex items-center justify-between bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-3"
              >
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-bold text-gray-900">
                    Analytics
                  </span>
                </div>
                {showCharts ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              <div className={`${showCharts ? "block" : "hidden"} sm:block`}>
                {/* Mobile: vertical stack; Desktop: 4 columns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {[
                    {
                      title: "Registrations",
                      sub: "Last 6 months",
                      icon: <Activity className="w-4 h-4 text-emerald-500" />,
                      content: (
                        <MiniBarChart
                          labels={charts.monthLabels}
                          values={charts.monthCounts}
                        />
                      ),
                    },
                    {
                      title: "Pipeline",
                      sub: "User stages",
                      icon: <Briefcase className="w-4 h-4 text-gray-400" />,
                      content: (
                        <DonutChart
                          segments={[
                            {
                              label: "Registered",
                              value: stats?.registered ?? 0,
                              color: "#9ca3af",
                            },
                            {
                              label: "A1 Done",
                              value:
                                (stats?.a1Done ?? 0) - (stats?.a2Done ?? 0),
                              color: "#3b82f6",
                            },
                            {
                              label: "A2 Done",
                              value: stats?.proposalReady ?? 0,
                              color: "#059669",
                            },
                          ]}
                        />
                      ),
                    },
                    {
                      title: "Score Distribution",
                      sub: "Assessment 1",
                      icon: <BarChart3 className="w-4 h-4 text-gray-400" />,
                      content: <ScoreBuckets buckets={charts.scoreBuckets} />,
                    },
                    {
                      title: "Categories",
                      sub: "Avg A1 scores",
                      icon: <AlertCircle className="w-4 h-4 text-gray-400" />,
                      content: <CategoryBars data={charts.categoryAverages} />,
                    },
                  ].map((card, i) => (
                    <div
                      key={i}
                      className="bg-white border border-gray-200 rounded-2xl p-5"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">
                            {card.title}
                          </h3>
                          <p className="text-xs text-gray-500">{card.sub}</p>
                        </div>
                        {card.icon}
                      </div>
                      {card.content}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Toolbar ── */}
          <div className="px-4 sm:px-6 mb-3 space-y-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users, email, org…"
                className="w-full pl-10 pr-10 py-3 rounded-2xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-gray-200"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              )}
            </div>

            {/* Filter row */}
            <div className="flex items-center gap-2">
              {/* Stage filters — scroll horizontally */}
              <div className="flex gap-1.5 overflow-x-auto flex-1 scrollbar-hide">
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
                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${stageFilter === val ? "bg-emerald-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1 shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="text-xs border border-gray-200 rounded-xl px-2 py-2 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                >
                  <option value="date">Date</option>
                  <option value="score">Score</option>
                  <option value="name">Name</option>
                </select>
                <button
                  onClick={() => setSortAsc((v) => !v)}
                  className="w-9 h-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center"
                >
                  {sortAsc ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>

              {/* View toggle */}
              <div className="flex items-center gap-0.5 p-1 bg-white border border-gray-200 rounded-xl shrink-0">
                {(["list", "pipeline"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all capitalize ${view === v ? "bg-gray-900 text-white" : "text-gray-500"}`}
                  >
                    {v === "list" ? (
                      <Menu className="w-3.5 h-3.5" />
                    ) : (
                      <BarChart3 className="w-3.5 h-3.5" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Result count */}
            {!loading && (
              <p className="text-xs text-gray-500 px-1">
                <span className="font-bold text-gray-900">
                  {filtered.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-gray-900">{users.length}</span>{" "}
                users
                {stageFilter !== "all" && (
                  <span className="ml-1 text-emerald-600 font-medium">
                    · filtered
                  </span>
                )}
              </p>
            )}
          </div>

          {/* ── List View ── */}
          {view === "list" && (
            <div className="sm:px-6">
              {loading ? (
                <div className="flex items-center justify-center py-24 gap-3 text-gray-400">
                  <div className="w-5 h-5 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
                  <span className="text-sm">Loading…</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-24">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm font-medium">
                    No users found
                  </p>
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="mt-2 text-xs text-emerald-600 font-semibold"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                /* Mobile: card list; Desktop: white card table */
                <div className="bg-white sm:border sm:border-gray-200 sm:rounded-2xl sm:overflow-hidden sm:shadow-sm">
                  {/* Desktop table header */}
                  <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50">
                    {[
                      "User",
                      "Organization",
                      "Stage",
                      "A1 Score",
                      "A2 Status",
                      "",
                    ].map((h, i) => (
                      <span
                        key={i}
                        className="text-xs font-bold text-gray-500 uppercase tracking-wide"
                      >
                        {h}
                      </span>
                    ))}
                  </div>

                  {filtered.map((user) => {
                    const sm2 = stageMeta(user.stage);
                    const p1 = user.assessment1?.pct;
                    return (
                      <div key={user.id}>
                        {/* Mobile card */}
                        <div className="sm:hidden">
                          <UserListItem
                            user={user}
                            onClick={() => setSelectedUser(user)}
                          />
                        </div>

                        {/* Desktop row */}
                        <div className="hidden sm:grid grid-cols-[1fr_1fr_auto_auto_auto_auto] gap-4 items-center px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                              {user.name.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {user.name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm text-gray-600 truncate">
                            {user.organization ?? (
                              <span className="text-gray-300">—</span>
                            )}
                          </span>
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${sm2.color}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${sm2.dot}`}
                            />
                            {sm2.label}
                          </span>
                          <div>
                            {p1 !== undefined && p1 !== null ? (
                              <div className="flex items-center gap-2">
                                <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
                          </div>
                          <div>
                            {user.assessment2 ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="w-3 h-3" /> Submitted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
                                <Clock className="w-3 h-3" /> Pending
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 transition-all"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Pipeline View ── */}
          {view === "pipeline" && (
            <div className="px-4 sm:px-6">
              {/* Mobile: vertical; Desktop: 3 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    sub: "Ready for profile",
                    color: "border-t-blue-500",
                    icon: ClipboardList,
                    users: pipeline.assessment1_done,
                  },
                  {
                    key: "proposal_ready",
                    title: "Proposal Ready",
                    sub: "Both complete 🏆",
                    color: "border-t-emerald-500",
                    icon: CheckCircle,
                    users: pipeline.proposal_ready,
                  },
                ].map((col) => (
                  <div
                    key={col.key}
                    className={`bg-white border border-gray-200 rounded-2xl overflow-hidden border-t-4 ${col.color}`}
                  >
                    <div className="px-4 py-4 border-b border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <col.icon className="w-5 h-5 text-gray-400" />
                        <div>
                          <h3 className="text-sm font-bold text-gray-900">
                            {col.title}
                          </h3>
                          <p className="text-xs text-gray-500">{col.sub}</p>
                        </div>
                      </div>
                      <span className="text-2xl font-black text-gray-900">
                        {col.users.length}
                      </span>
                    </div>
                    <div className="p-3 space-y-2 max-h-80 sm:max-h-[440px] overflow-y-auto">
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
            </div>
          )}
        </main>
      </div>

      {/* ── Mobile Bottom Action Bar ── */}
      <div className="fixed bottom-0 inset-x-0 sm:hidden z-20 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 safe-area-inset-bottom">
        <button
          onClick={handleExport}
          disabled={exporting || !stats?.a1Done}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-bold disabled:opacity-40 shadow-lg shadow-emerald-200"
        >
          <FileSpreadsheet className="w-4 h-4" />
          {exporting ? "Exporting…" : "Export Excel"}
        </button>
        <button
          onClick={() => router.push("/admin/reports")}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 bg-white text-gray-700 text-sm font-bold"
        >
          <TableProperties className="w-4 h-4" />
          <span>Reports</span>
        </button>
      </div>

      {/* ── User Drawer ── */}
      {selectedUser && (
        <UserDrawer user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </>
  );
}
