// app/api/submissions2/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { invalidFields } from "../../lib/assessment-validation";
import { SECTIONS } from "../../lib/institutional-content";

// ── Types ────────────────────────────────────────────────────────────────────

type Submission2Body = {
  userId: string;
  formData?: Record<string, unknown>;
  rawPayload?: Record<string, unknown>;
};

// ── POST /api/submissions2 ───────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as Partial<Submission2Body>;
    const { userId, formData, rawPayload } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    const payload = formData ?? rawPayload;
    if (!payload || typeof payload !== "object" || Array.isArray(payload))
      return NextResponse.json(
        { error: "Assessment data is required" },
        { status: 400 },
      );
    const invalid = invalidFields(payload);
    if (invalid.length)
      return NextResponse.json(
        {
          error: "Please complete all required fields with valid values",
          fields: invalid,
        },
        { status: 400 },
      );
    const allowedKeys = new Set(
      SECTIONS.flatMap((s) => s.fields.map((f) => f.key)),
    );
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter(([key]) => allowedKeys.has(key)),
    );

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const sub1 = await prisma.assessmentSubmission.findFirst({
      where: { userId, submissionType: "assessment1" },
    });
    if (!sub1) {
      return NextResponse.json(
        { error: "Assessment 1 must be completed first" },
        { status: 403 },
      );
    }

    const existing = await prisma.assessmentSubmission.findFirst({
      where: { userId, submissionType: "assessment2" },
    });
    if (existing) {
      return NextResponse.json(
        {
          error: "User has already submitted assessment 2",
          submissionId: existing.id,
        },
        { status: 409 },
      );
    }

    const submission = await prisma.assessmentSubmission.create({
      data: {
        userId,
        submissionType: "assessment2",
        totalScore: 0,
        maxScore: 0,
        rawPayload: cleanPayload as object,
      },
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/submissions2]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
