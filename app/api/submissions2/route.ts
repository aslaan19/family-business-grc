// app/api/submissions2/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

/**
 * POST /api/submissions2
 *
 * Same shape as /api/submissions but sets submissionType = "assessment2"
 * and checks the user hasn't already submitted assessment2.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, totalScore, maxScore, rawPayload, answers } = body;

    if (!userId || totalScore === undefined || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: "userId, totalScore, and answers are required" },
        { status: 400 },
      );
    }

    // Check user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check assessment1 is done first
    const sub1 = await prisma.assessmentSubmission.findFirst({
      where: { userId, submissionType: "assessment1" },
    });
    if (!sub1) {
      return NextResponse.json(
        { error: "Assessment 1 must be completed first" },
        { status: 403 },
      );
    }

    // Check not already submitted assessment2
    const existing = await prisma.assessmentSubmission.findFirst({
      where: { userId, submissionType: "assessment2" },
    });
    if (existing) {
      return NextResponse.json(
        { error: "User has already submitted assessment 2", submissionId: existing.id },
        { status: 409 },
      );
    }

    const submission = await prisma.$transaction(async (tx) => {
      const sub = await tx.assessmentSubmission.create({
        data: {
          userId,
          submissionType: "assessment2",
          totalScore,
          maxScore: maxScore ?? null,
          rawPayload: rawPayload ?? undefined,
        },
      });

      if (answers.length > 0) {
        await tx.assessmentAnswer.createMany({
          data: answers.map((a: {
            questionId: string;
            selectedLabel?: string;
            selectedValue: number;
            note?: string;
          }) => ({
            submissionId: sub.id,
            questionId:   a.questionId,
            selectedLabel: a.selectedLabel ?? null,
            selectedValue: a.selectedValue,
            note:          a.note ?? null,
          })),
        });
      }

      return sub;
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/submissions2]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}