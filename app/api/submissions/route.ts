// app/api/submissions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

// ── Types ────────────────────────────────────────────────────────────────────

type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

type AnswerInput = {
  questionId:     string;
  selectedLabel?: string;
  selectedValue:  number;
  note?:          string;
};

type SubmissionBody = {
  userId:      string;
  totalScore:  number;
  maxScore?:   number;
  rawPayload?: Record<string, unknown>;
  answers:     AnswerInput[];
};

// ── POST /api/submissions ────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as Partial<SubmissionBody>;
    const { userId, totalScore, maxScore, rawPayload, answers } = body;

    if (!userId || totalScore === undefined || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "userId, totalScore, and answers are required" },
        { status: 400 },
      );
    }

    const existing = await prisma.assessmentSubmission.findFirst({
      where: { userId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User has already submitted an assessment", submissionId: existing.id },
        { status: 409 },
      );
    }

    const submission = await prisma.$transaction(async (tx: TransactionClient) => {
      const sub = await tx.assessmentSubmission.create({
        data: {
          userId,
          totalScore,
          maxScore:   maxScore ?? null,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          rawPayload: (rawPayload ?? null) as any,
        },
      });

      if (answers.length > 0) {
        await tx.assessmentAnswer.createMany({
          data: answers.map((a: AnswerInput) => ({
            submissionId:  sub.id,
            questionId:    a.questionId,
            selectedLabel: a.selectedLabel ?? null,
            selectedValue: a.selectedValue,
            note:          a.note          ?? null,
          })),
        });
      }

      return sub;
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/submissions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── GET /api/submissions?userId=... ─────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const submission = await prisma.assessmentSubmission.findFirst({
      where:   { userId },
      include: { answers: true },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ submission: submission ?? null });
  } catch (err) {
    console.error("[GET /api/submissions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}