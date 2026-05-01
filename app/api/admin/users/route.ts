// app/api/admin/users/route.ts
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
  selectedLabel: string | null;
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

    const users = rawUsers as unknown as UserRow[];

    const formatted = users.map((u: UserRow) => {
      const sub1 = u.submissions.find(
        (s: SubmissionRow) => s.submissionType === "assessment1"
      ) ?? null;

      const sub2 = u.submissions.find(
        (s: SubmissionRow) => s.submissionType === "assessment2"
      ) ?? null;

      return {
        id:           u.id,
        name:         u.fullName,
        email:        u.email,
        phone:        u.phone       ?? null,
        organization: u.companyName ?? null,
        createdAt:    u.createdAt,
        submission:   sub1,
        submission2:  sub2,
      };
    });

    return NextResponse.json({ users: formatted });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}