"use client";

import { useEffect, useState } from "react";
import {
  Users,
  FileSpreadsheet,
  TrendingUp,
  CheckCircle2,
  Clock,
  Search,
  Download,
  ChevronDown,
  ChevronUp,
  Eye,
  X,
  BarChart3,
  Award,
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

interface Submission {
  id: string;
  totalScore: number;
  maxScore: number;
  submittedAt: string;
  answers: Answer[];
}

interface User {
  id: string;
  name: string;
  email: string;
  organization?: string;
  createdAt: string;
  submission: Submission | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(pct: number) {
  if (pct >= 75)
    return {
      text: "text-emerald-600",
      bg: "bg-emerald-100",
      bar: "bg-emerald-500",
    };
  if (pct >= 50)
    return { text: "text-amber-600", bg: "bg-amber-100", bar: "bg-amber-500" };
  return { text: "text-red-500", bg: "bg-red-100", bar: "bg-red-400" };
}

function labelBadge(label: string) {
  if (label === "yes") return "bg-emerald-100 text-emerald-700";
  if (label === "partial") return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-600";
}

function labelText(label: string) {
  if (label === "yes") return "Yes";
  if (label === "partial") return "Partial";
  return "No";
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`w-14 h-14 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-3xl font-bold text-slate-800 leading-tight">
          {value}
        </p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Answer Drawer ────────────────────────────────────────────────────────────

function AnswerDrawer({ user, onClose }: { user: User; onClose: () => void }) {
  const sub = user.submission!;
  const pct = Math.round((sub.totalScore / sub.maxScore) * 100);
  const colors = scoreColor(pct);

  // Group answers by category
  const grouped = sub.answers.reduce<Record<string, Answer[]>>((acc, ans) => {
    const key = ans.question.categoryKey;
    if (!acc[key]) acc[key] = [];
    acc[key].push(ans);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-6 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            {user.organization && (
              <p className="text-xs text-slate-400 mt-0.5">
                {user.organization}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        </div>

        {/* Score summary */}
        <div className="px-8 py-6 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-600">
              Overall Score
            </span>
            <span className={`text-2xl font-bold ${colors.text}`}>
              {sub.totalScore} / {sub.maxScore}
            </span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${colors.bar}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-slate-400">
              {new Date(sub.submittedAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className={`text-xs font-bold ${colors.text}`}>{pct}%</span>
          </div>
        </div>

        {/* Answers by category */}
        <div className="px-8 py-6 space-y-8 flex-1">
          {Object.entries(grouped).map(([catKey, answers]) => {
            const catScore = answers.reduce((s, a) => s + a.selectedValue, 0);
            const catMax = answers.length * 10;
            const catPct = Math.round((catScore / catMax) * 100);
            const catColors = scoreColor(catPct);

            return (
              <div key={catKey}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                    {catKey.replace(/_/g, " ")}
                  </h3>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${catColors.bg} ${catColors.text}`}
                  >
                    {catScore}/{catMax}
                  </span>
                </div>
                <div className="space-y-3">
                  {answers
                    .sort(
                      (a, b) =>
                        a.question.questionOrder - b.question.questionOrder,
                    )
                    .map((ans) => (
                      <div
                        key={ans.id}
                        className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-700 leading-snug">
                            {ans.question.questionEn}
                          </p>
                          <p
                            className="text-xs text-slate-400 mt-1 text-right"
                            dir="rtl"
                          >
                            {ans.question.questionAr}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full ${labelBadge(ans.selectedLabel)}`}
                          >
                            {labelText(ans.selectedLabel)}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            +{ans.selectedValue}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "submitted" | "pending">("all");
  const [sortBy, setSortBy] = useState<"date" | "score" | "name">("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .finally(() => setLoading(false));
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalUsers = users.length;
  const submitted = users.filter((u) => u.submission).length;
  const pending = totalUsers - submitted;
  const avgScore = submitted
    ? Math.round(
        users
          .filter((u) => u.submission)
          .reduce(
            (s, u) =>
              s + (u.submission!.totalScore / u.submission!.maxScore) * 100,
            0,
          ) / submitted,
      )
    : 0;

  // ── Filter + Sort ──────────────────────────────────────────────────────────
  const filtered = users
    .filter((u) => {
      if (filter === "submitted") return !!u.submission;
      if (filter === "pending") return !u.submission;
      return true;
    })
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
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "score") {
        const sa = a.submission
          ? a.submission.totalScore / a.submission.maxScore
          : -1;
        const sb = b.submission
          ? b.submission.totalScore / b.submission.maxScore
          : -1;
        cmp = sa - sb;
      }
      return sortAsc ? cmp : -cmp;
    });

  function toggleSort(col: typeof sortBy) {
    if (sortBy === col) setSortAsc((v) => !v);
    else {
      setSortBy(col);
      setSortAsc(false);
    }
  }

  function SortIcon({ col }: { col: typeof sortBy }) {
    if (sortBy !== col)
      return <ChevronDown className="w-3.5 h-3.5 text-slate-300" />;
    return sortAsc ? (
      <ChevronUp className="w-3.5 h-3.5 text-[#1a6b3c]" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-[#1a6b3c]" />
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
      a.download = `karam-submissions-${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');
        * { font-family: 'Sora', sans-serif; }
        @keyframes slide-in {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s cubic-bezier(0.23,1,0.32,1); }
      `}</style>

      <div className="min-h-screen bg-slate-50">
        {/* Top nav */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a6b3c] to-[#0f4a29] flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-800 leading-none">
                  Ceram Admin
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                  Governance Assessment Portal
                </p>
              </div>
            </div>
            <button
              onClick={handleExport}
              disabled={exporting || submitted === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a6b3c] hover:bg-[#155731] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {exporting ? "Exporting…" : "Export to Excel"}
            </button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-10 space-y-8">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Users}
              label="Total Users"
              value={totalUsers}
              color="bg-slate-700"
            />
            <StatCard
              icon={CheckCircle2}
              label="Submitted"
              value={submitted}
              color="bg-[#1a6b3c]"
              sub={`${totalUsers ? Math.round((submitted / totalUsers) * 100) : 0}% completion`}
            />
            <StatCard
              icon={Clock}
              label="Pending"
              value={pending}
              color="bg-amber-500"
            />
            <StatCard
              icon={BarChart3}
              label="Avg Score"
              value={`${avgScore}%`}
              color="bg-blue-600"
              sub="among submitted"
            />
          </div>

          {/* Filters + Search */}
          <div className="bg-white rounded-2xl border border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, or organization…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1a6b3c]/20 focus:border-[#1a6b3c]"
              />
            </div>
            <div className="flex items-center gap-2">
              {(["all", "submitted", "pending"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                    filter === f
                      ? "bg-[#1a6b3c] text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
                <div className="w-6 h-6 border-2 border-slate-300 border-t-[#1a6b3c] rounded-full animate-spin" />
                <span className="text-sm font-medium">Loading users…</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-24">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No users found</p>
                <p className="text-slate-400 text-sm mt-1">
                  Try adjusting your filters
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th
                        className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none"
                        onClick={() => toggleSort("name")}
                      >
                        <span className="flex items-center gap-1.5">
                          Name <SortIcon col="name" />
                        </span>
                      </th>
                      <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Organization
                      </th>
                      <th
                        className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none"
                        onClick={() => toggleSort("date")}
                      >
                        <span className="flex items-center gap-1.5">
                          Registered <SortIcon col="date" />
                        </span>
                      </th>
                      <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th
                        className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-700 select-none"
                        onClick={() => toggleSort("score")}
                      >
                        <span className="flex items-center gap-1.5">
                          Score <SortIcon col="score" />
                        </span>
                      </th>
                      <th className="px-6 py-3.5" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((user) => {
                      const sub = user.submission;
                      const pct = sub
                        ? Math.round((sub.totalScore / sub.maxScore) * 100)
                        : null;
                      const colors = pct !== null ? scoreColor(pct) : null;

                      return (
                        <tr
                          key={user.id}
                          className="hover:bg-slate-50 transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1a6b3c]/10 to-[#1a6b3c]/20 flex items-center justify-center text-[#1a6b3c] text-sm font-bold shrink-0">
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {user.name}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-600">
                              {user.organization ?? (
                                <span className="text-slate-300">—</span>
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-slate-500">
                              {new Date(user.createdAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {sub ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Submitted
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                <Clock className="w-3.5 h-3.5" />
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {sub && colors && pct !== null ? (
                              <div className="flex items-center gap-3">
                                <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full ${colors.bar}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span
                                  className={`text-sm font-bold ${colors.text}`}
                                >
                                  {sub.totalScore}/{sub.maxScore}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-300 text-sm">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {sub && (
                              <button
                                onClick={() => setSelectedUser(user)}
                                className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a6b3c]/8 hover:bg-[#1a6b3c]/15 text-[#1a6b3c] text-xs font-semibold transition-all"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                View
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            {/* Footer count */}
            {!loading && filtered.length > 0 && (
              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50">
                <p className="text-xs text-slate-400">
                  Showing{" "}
                  <span className="font-semibold text-slate-600">
                    {filtered.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-600">
                    {totalUsers}
                  </span>{" "}
                  users
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Answer drawer */}
      {selectedUser && (
        <AnswerDrawer
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </>
  );
}
