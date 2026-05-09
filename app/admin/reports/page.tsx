"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  FileText,
  Users,
  BarChart3,
  Award,
  ChevronRight,
  ArrowLeft,
  ClipboardList,
  FileCheck,
} from "lucide-react";

interface AssessmentData {
  id: string;
  totalScore: number;
  maxScore: number;
  pct: number | null;
  submittedAt: string;
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

const G = {
  900: "#0a2e1a",
  800: "#0f3d22",
  600: "#1a6b3c",
  100: "#d4edd9",
  50: "#f3f8ed",
};
const GOLD = { 500: "#c9a227", 400: "#d4b347" };

function scoreLabel(pct: number) {
  if (pct >= 80)
    return {
      label: "Excellent",
      color: "#059669",
      bg: "#d1fae5",
      border: "#6ee7b7",
    };
  if (pct >= 60)
    return {
      label: "Good",
      color: "#0284c7",
      bg: "#e0f2fe",
      border: "#7dd3fc",
    };
  if (pct >= 40)
    return {
      label: "Average",
      color: "#d97706",
      bg: "#fef3c7",
      border: "#fcd34d",
    };
  return {
    label: "Needs Work",
    color: "#dc2626",
    bg: "#fee2e2",
    border: "#fca5a5",
  };
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ReportsIndexPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"assessment1" | "assessment2">("assessment1");

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .finally(() => setLoading(false));
  }, []);

  const isA1Tab = tab === "assessment1";

  // Only show users who have the relevant assessment
  const relevant = users.filter((u) =>
    isA1Tab ? u.assessment1 !== null : u.assessment2 !== null,
  );

  const filtered = relevant.filter((u) =>
    [u.name, u.email, u.organization ?? ""]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  // Stats
  const withA1 = users.filter((u) => u.assessment1).length;
  const withA2 = users.filter((u) => u.assessment2).length;
  const avgA1 = withA1
    ? Math.round(
        users
          .filter((u) => u.assessment1)
          .reduce((s, u) => s + (u.assessment1!.pct ?? 0), 0) / withA1,
      )
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { font-family: 'Outfit', sans-serif; }`}
      </style>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${G[600]}, ${G[800]})`,
              }}
            >
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black text-gray-900">Reports</h1>
              <p className="text-xs text-gray-400">
                Governance Assessment Reports
              </p>
            </div>
          </div>
          <a
            href="/admin"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Admin Portal
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              icon: Users,
              label: "Total Users",
              value: users.length,
              color: "bg-slate-100 text-slate-600",
            },
            {
              icon: ClipboardList,
              label: "A1 Complete",
              value: withA1,
              color: "bg-blue-50 text-blue-600",
            },
            {
              icon: FileCheck,
              label: "A2 Complete",
              value: withA2,
              color: "bg-violet-50 text-violet-600",
            },
            {
              icon: BarChart3,
              label: "Avg A1 Score",
              value: `${avgA1}%`,
              color: "bg-emerald-50 text-emerald-600",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
            >
              <div
                className={`w-9 h-9 rounded-lg ${s.color} flex items-center justify-center mb-3`}
              >
                <s.icon
                  className="w-4.5 h-4.5"
                  style={{ width: 18, height: 18 }}
                />
              </div>
              <p className="text-2xl font-black text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab + Search bar */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-100">
            {(
              [
                {
                  key: "assessment1",
                  label: "Assessment 1",
                  icon: ClipboardList,
                  count: withA1,
                  desc: "Governance Scoring (MCQ)",
                },
                {
                  key: "assessment2",
                  label: "Assessment 2",
                  icon: FileCheck,
                  count: withA2,
                  desc: "Institutional Profile (Form)",
                },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="flex-1 flex items-center gap-3 px-6 py-4 transition-all text-left border-b-2"
                style={{
                  borderBottomColor: tab === t.key ? G[600] : "transparent",
                  background: tab === t.key ? `${G[50]}` : "transparent",
                }}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all`}
                  style={{
                    background: tab === t.key ? G[600] : "#f3f4f6",
                    color: tab === t.key ? "#fff" : "#9ca3af",
                  }}
                >
                  <t.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-bold"
                      style={{ color: tab === t.key ? G[600] : "#374151" }}
                    >
                      {t.label}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{
                        background: tab === t.key ? G[100] : "#f3f4f6",
                        color: tab === t.key ? G[600] : "#9ca3af",
                      }}
                    >
                      {t.count}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="px-6 py-3 border-b border-gray-50">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${tab === "assessment1" ? "A1" : "A2"} users…`}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50"
                style={{ "--tw-ring-color": G[600] } as React.CSSProperties}
              />
            </div>
          </div>

          {/* User list */}
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
              <div className="w-5 h-5 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
              <span className="text-sm">Loading users…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Users className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p className="text-sm font-medium text-gray-400">
                {relevant.length === 0
                  ? `No users have completed ${isA1Tab ? "Assessment 1" : "Assessment 2"} yet`
                  : "No users match your search"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filtered.map((user) => {
                const assessment = isA1Tab
                  ? user.assessment1!
                  : user.assessment2!;
                const pct = assessment.pct ?? 0;
                const sl = scoreLabel(pct);
                const href = `/admin/reports/${tab}/${user.id}`;

                return (
                  <Link
                    key={user.id}
                    href={href}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group"
                  >
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white shrink-0"
                      style={{
                        background: `linear-gradient(135deg, ${G[600]}, ${G[100]})`,
                      }}
                    >
                      {user.name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user.name}
                        </p>
                        {/* Show badge if both done */}
                        {user.assessment1 && user.assessment2 && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-50 text-violet-600 border border-violet-100 shrink-0">
                            A1 + A2
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                        {user.organization && ` · ${user.organization}`}
                      </p>
                    </div>

                    {/* Score */}
                    <div className="hidden sm:flex items-center gap-3 shrink-0">
                      {isA1Tab ? (
                        <>
                          <div>
                            <div className="w-28 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${pct}%`,
                                  background: sl.color,
                                }}
                              />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-0.5 text-right">
                              {assessment.totalScore}/{assessment.maxScore} pts
                            </p>
                          </div>
                          <span
                            className="text-sm font-bold px-2.5 py-1 rounded-lg border"
                            style={{
                              color: sl.color,
                              background: sl.bg,
                              borderColor: sl.border,
                            }}
                          >
                            {pct}%
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-violet-50 text-violet-700 border-violet-200">
                          Profile Submitted
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    <div className="hidden lg:block text-right text-xs text-gray-400 shrink-0 w-28">
                      {fmt(assessment.submittedAt)}
                    </div>

                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}

          {/* Count footer */}
          {!loading && filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-50 bg-gray-50">
              <p className="text-xs text-gray-400">
                Showing{" "}
                <span className="font-semibold text-gray-600">
                  {filtered.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-600">
                  {relevant.length}
                </span>{" "}
                users
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
