// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const [users, submissions] = await Promise.all([
      prisma.user.findMany({
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
      }),
      prisma.assessmentSubmission.findMany({
        orderBy: { submittedAt: "asc" },
        select: { submittedAt: true, submissionType: true, totalScore: true, maxScore: true },
      }),
    ]);

    // ── Per-user enrichment ────────────────────────────────────────────────
    const enriched = users.map((u) => {
      const sub1 = u.submissions.find((s) => s.submissionType === "assessment1") ?? null;
      const sub2 = u.submissions.find((s) => s.submissionType === "assessment2") ?? null;

      const pct1 = sub1?.maxScore ? Math.round((sub1.totalScore / sub1.maxScore) * 100) : null;
      const pct2 = sub2?.maxScore ? Math.round((sub2.totalScore / sub2.maxScore) * 100) : null;

      // Category breakdown for sub1
      const catBreakdown1: Record<string, { score: number; max: number; pct: number }> = {};
      if (sub1) {
        sub1.answers.forEach((a) => {
          const k = a.question?.categoryKey ?? "unknown";
          if (!catBreakdown1[k]) catBreakdown1[k] = { score: 0, max: 0, pct: 0 };
          catBreakdown1[k].score += a.selectedValue;
          catBreakdown1[k].max  += 10;
        });
        Object.keys(catBreakdown1).forEach((k) => {
          catBreakdown1[k].pct = Math.round((catBreakdown1[k].score / catBreakdown1[k].max) * 100);
        });
      }

      // Category breakdown for sub2
      const catBreakdown2: Record<string, { score: number; max: number; pct: number }> = {};
      if (sub2) {
        sub2.answers.forEach((a) => {
          const k = a.question?.categoryKey ?? "unknown";
          if (!catBreakdown2[k]) catBreakdown2[k] = { score: 0, max: 0, pct: 0 };
          catBreakdown2[k].score += a.selectedValue;
          catBreakdown2[k].max  += 10;
        });
        Object.keys(catBreakdown2).forEach((k) => {
          catBreakdown2[k].pct = Math.round((catBreakdown2[k].score / catBreakdown2[k].max) * 100);
        });
      }

      // Stage: both done = ready for proposal
      const stage = !sub1 ? "registered"
        : !sub2 ? "assessment1_done"
        : "proposal_ready";

      return {
        id:           u.id,
        name:         u.fullName,
        email:        u.email,
        phone:        u.phone        ?? null,
        organization: u.companyName  ?? null,
        createdAt:    u.createdAt,
        stage,
        assessment1: sub1 ? {
          id:           sub1.id,
          totalScore:   sub1.totalScore,
          maxScore:     sub1.maxScore ?? 0,
          pct:          pct1,
          submittedAt:  sub1.submittedAt,
          answers:      sub1.answers,
          catBreakdown: catBreakdown1,
        } : null,
        assessment2: sub2 ? {
          id:           sub2.id,
          totalScore:   sub2.totalScore,
          maxScore:     sub2.maxScore ?? 0,
          pct:          pct2,
          submittedAt:  sub2.submittedAt,
          answers:      sub2.answers,
          catBreakdown: catBreakdown2,
        } : null,
      };
    });

    // ── Aggregate stats ────────────────────────────────────────────────────
    const totalUsers      = enriched.length;
    const a1Done          = enriched.filter((u) => u.assessment1).length;
    const a2Done          = enriched.filter((u) => u.assessment2).length;
    const proposalReady   = enriched.filter((u) => u.stage === "proposal_ready").length;
    const registered      = enriched.filter((u) => u.stage === "registered").length;

    const avgScore1 = a1Done
      ? Math.round(enriched.filter((u) => u.assessment1).reduce((s, u) => s + (u.assessment1!.pct ?? 0), 0) / a1Done)
      : 0;
    const avgScore2 = a2Done
      ? Math.round(enriched.filter((u) => u.assessment2).reduce((s, u) => s + (u.assessment2!.pct ?? 0), 0) / a2Done)
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
    const buckets = { "0-25": 0, "26-50": 0, "51-75": 0, "76-100": 0 };
    enriched.forEach((u) => {
      const pct = u.assessment1?.pct;
      if (pct == null) return;
      if (pct <= 25) buckets["0-25"]++;
      else if (pct <= 50) buckets["26-50"]++;
      else if (pct <= 75) buckets["51-75"]++;
      else buckets["76-100"]++;
    });

    // ── Category averages across all A1 submissions ────────────────────────
    const catTotals: Record<string, { sum: number; count: number }> = {};
    enriched.forEach((u) => {
      if (!u.assessment1) return;
      Object.entries(u.assessment1.catBreakdown).forEach(([k, v]) => {
        if (!catTotals[k]) catTotals[k] = { sum: 0, count: 0 };
        catTotals[k].sum   += v.pct;
        catTotals[k].count += 1;
      });
    });
    const categoryAverages = Object.entries(catTotals).map(([key, v]) => ({
      key,
      avg: Math.round(v.sum / v.count),
    })).sort((a, b) => b.avg - a.avg);

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
        scoreBuckets: buckets,
        categoryAverages,
      },
    });
  } catch (err) {
    console.error("[GET /api/admin/stats]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}