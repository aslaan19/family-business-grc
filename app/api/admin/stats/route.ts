// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

// ── Prisma result types ──────────────────────────────────────────────────────

type QuestionRow = {
  categoryKey: string | null;
  categoryOrder: number;
  questionOrder: number;
};

type AnswerRow = {
  selectedValue: number;
  question: QuestionRow | null;
};

type SubmissionRow = {
  id: string;
  submissionType: string;
  totalScore: number;
  maxScore: number | null;
  submittedAt: Date;
  rawPayload: unknown;
  answers: AnswerRow[];
};

type UserRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  companyName: string | null;
  createdAt: Date;
  submissions: SubmissionRow[];
};

// ── Helpers ──────────────────────────────────────────────────────────────────

type CatBreakdown = Record<string, { score: number; max: number; pct: number }>;

function buildCatBreakdown(answers: AnswerRow[]): CatBreakdown {
  const breakdown: CatBreakdown = {};

  for (const answer of answers) {
    const key = answer.question?.categoryKey ?? "unknown";
    if (!breakdown[key]) {
      breakdown[key] = { score: 0, max: 0, pct: 0 };
    }
    breakdown[key].score += answer.selectedValue;
    breakdown[key].max += 10;
  }

  for (const key of Object.keys(breakdown)) {
    const entry = breakdown[key];
    entry.pct = entry.max > 0 ? Math.round((entry.score / entry.max) * 100) : 0;
  }

  return breakdown;
}

function toAssessmentPayload(sub: SubmissionRow) {
  return {
    id: sub.id,
    totalScore: sub.totalScore,
    maxScore: sub.maxScore ?? 0,
    pct: sub.maxScore ? Math.round((sub.totalScore / sub.maxScore) * 100) : null,
    submittedAt: sub.submittedAt,
    answers: sub.answers,
    rawPayload: (sub.rawPayload ?? {}) as Record<string, unknown>,
    catBreakdown: buildCatBreakdown(sub.answers),
  };
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  try {
    const rawUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        submissions: {
          include: {
            answers: {
              include: { question: true },
              orderBy: [
                { question: { categoryOrder: "asc" } },
                { question: { questionOrder: "asc" } },
              ],
            },
          },
          orderBy: { submittedAt: "asc" },
        },
      },
    });

    // Cast to our explicit type so TypeScript is fully satisfied
    const users = rawUsers as unknown as UserRow[];

    // ── Per-user enrichment ────────────────────────────────────────────────

    const enriched = users.map((u: UserRow) => {
      const sub1 = u.submissions.find(
        (s: SubmissionRow) => s.submissionType === "assessment1"
      ) ?? null;

      const sub2 = u.submissions.find(
        (s: SubmissionRow) => s.submissionType === "assessment2"
      ) ?? null;

      const stage: "registered" | "assessment1_done" | "proposal_ready" =
        sub2 ? "proposal_ready" : sub1 ? "assessment1_done" : "registered";

      return {
        id: u.id,
        name: u.fullName,
        email: u.email,
        phone: u.phone ?? null,
        organization: u.companyName ?? null,
        createdAt: u.createdAt,
        stage,
        assessment1: sub1 ? toAssessmentPayload(sub1) : null,
        assessment2: sub2 ? toAssessmentPayload(sub2) : null,
      };
    });

    // ── Aggregate stats ────────────────────────────────────────────────────

    const totalUsers = enriched.length;
    const a1Done = enriched.filter((u) => u.assessment1 !== null).length;
    const a2Done = enriched.filter((u) => u.assessment2 !== null).length;
    const proposalReady = enriched.filter((u) => u.stage === "proposal_ready").length;
    const registered = enriched.filter((u) => u.stage === "registered").length;

    const usersWithA1 = enriched.filter((u) => u.assessment1 !== null);
    const usersWithA2 = enriched.filter((u) => u.assessment2 !== null);

    const avgScore1 =
      usersWithA1.length > 0
        ? Math.round(
            usersWithA1.reduce((sum, u) => sum + (u.assessment1!.pct ?? 0), 0) /
              usersWithA1.length
          )
        : 0;

    const avgScore2 =
      usersWithA2.length > 0
        ? Math.round(
            usersWithA2.reduce((sum, u) => sum + (u.assessment2!.pct ?? 0), 0) /
              usersWithA2.length
          )
        : 0;

    // ── Monthly registration trend (last 6 months) ─────────────────────────

    const now = new Date();
    const monthLabels: string[] = [];
    const monthCounts: number[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString("en-US", { month: "short" });
      monthLabels.push(label);

      const count = enriched.filter((u) => {
        const c = new Date(u.createdAt);
        return c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth();
      }).length;

      monthCounts.push(count);
    }

    // ── Score distribution buckets ─────────────────────────────────────────

    const scoreBuckets: Record<string, number> = {
      "0-25": 0,
      "26-50": 0,
      "51-75": 0,
      "76-100": 0,
    };

    for (const u of enriched) {
      const pct = u.assessment1?.pct;
      if (pct == null) continue;
      if (pct <= 25) scoreBuckets["0-25"]++;
      else if (pct <= 50) scoreBuckets["26-50"]++;
      else if (pct <= 75) scoreBuckets["51-75"]++;
      else scoreBuckets["76-100"]++;
    }

    // ── Category averages across all A1 submissions ────────────────────────

    const catTotals: Record<string, { sum: number; count: number }> = {};

    for (const u of enriched) {
      if (!u.assessment1) continue;
      for (const [key, value] of Object.entries(u.assessment1.catBreakdown)) {
        if (!catTotals[key]) catTotals[key] = { sum: 0, count: 0 };
        catTotals[key].sum += value.pct;
        catTotals[key].count += 1;
      }
    }

    const categoryAverages = Object.entries(catTotals)
      .map(([key, v]) => ({
        key,
        avg: Math.round(v.sum / v.count),
      }))
      .sort((a, b) => b.avg - a.avg);

    // ── Response ───────────────────────────────────────────────────────────

    return NextResponse.json({
      users: enriched,
      stats: {
        totalUsers,
        a1Done,
        a2Done,
        proposalReady,
        registered,
        avgScore1,
        avgScore2,
      },
      charts: {
        monthLabels,
        monthCounts,
        scoreBuckets,
        categoryAverages,
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/stats]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}