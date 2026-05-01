// app/api/submissions2/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

/**
 * POST /api/submissions2
 *
 * Assessment 2 is a rich data-collection form (not scored MCQ).
 * The entire form is stored as rawPayload JSON.
 * answers array will be empty — scoring is not applicable here.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, formData, rawPayload } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
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

    // Store the entire form as rawPayload — no individual answers needed
    const submission = await prisma.assessmentSubmission.create({
      data: {
        userId,
        submissionType: "assessment2",
        totalScore: 0,
        maxScore:   0,
        rawPayload: formData ?? rawPayload ?? {},
      },
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/submissions2]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}