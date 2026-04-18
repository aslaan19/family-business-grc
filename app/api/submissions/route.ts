// app/api/submissions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

/**
 * POST /api/submissions
 *
 * Body:
 * {
 *   userId: string          // UUID of the user
 *   totalScore: number
 *   maxScore: number
 *   rawPayload: object      // the full answers map { "0-0": 10, "0-1": 5, … }
 *   answers: Array<{
 *     questionId: string    // UUID from assessment_questions table
 *     selectedLabel: string // "yes" | "partial" | "no"
 *     selectedValue: number // 10 | 5 | 0
 *     note?: string
 *   }>
 * }
 */
export async function POST(req: NextRequest) {
  try {
    console.log("[POST /api/submissions] started");

    const body = await req.json();
    console.log("[POST /api/submissions] body:", body);

    const { userId, totalScore, maxScore, rawPayload, answers } = body;

    if (!userId || totalScore === undefined || !Array.isArray(answers)) {
      console.log("[POST /api/submissions] validation failed");
      return NextResponse.json(
        { error: "userId, totalScore, and answers are required" },
        { status: 400 },
      );
    }

    console.log("[POST /api/submissions] checking existing submission");

    const existing = await prisma.assessmentSubmission.findFirst({
      where: { userId },
    });

    console.log("[POST /api/submissions] existing:", existing);

    if (existing) {
      return NextResponse.json(
        { error: "User has already submitted an assessment", submissionId: existing.id },
        { status: 409 },
      );
    }

    console.log("[POST /api/submissions] creating submission transaction");

    const submission = await prisma.$transaction(async (tx) => {
      const sub = await tx.assessmentSubmission.create({
        data: {
          userId,
          totalScore,
          maxScore: maxScore ?? null,
          rawPayload: rawPayload ?? undefined,
        },
      });

      console.log("[POST /api/submissions] submission created:", sub.id);

      if (answers.length > 0) {
        await tx.assessmentAnswer.createMany({
          data: answers.map(
            (a: {
              questionId: string;
              selectedLabel?: string;
              selectedValue: number;
              note?: string;
            }) => ({
              submissionId: sub.id,
              questionId: a.questionId,
              selectedLabel: a.selectedLabel ?? null,
              selectedValue: a.selectedValue,
              note: a.note ?? null,
            }),
          ),
        });

        console.log("[POST /api/submissions] answers created:", answers.length);
      }

      return sub;
    });

    console.log("[POST /api/submissions] success");

    return NextResponse.json({ submission }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/submissions] ERROR:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * GET /api/submissions?userId=...
 * Returns the user's submission (if any).
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const submission = await prisma.assessmentSubmission.findFirst({
      where: { userId },
      include: { answers: true },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({ submission: submission ?? null });
  } catch (err) {
    console.error("[GET /api/submissions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}