// app/api/submissions2/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";

// ── Types ────────────────────────────────────────────────────────────────────

type Submission2Body = {
  userId:      string;
  formData?:   Record<string, unknown>;
  rawPayload?: Record<string, unknown>;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function toJsonValue(val: Record<string, unknown> | undefined): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  return val ? (val as Prisma.InputJsonValue) : Prisma.JsonNull;
}

// ── POST /api/submissions2 ───────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as Partial<Submission2Body>;
    const { userId, formData, rawPayload } = body;

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

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
        { error: "User has already submitted assessment 2", submissionId: existing.id },
        { status: 409 },
      );
    }

    const submission = await prisma.assessmentSubmission.create({
      data: {
        userId,
        submissionType: "assessment2",
        totalScore:     0,
        maxScore:       0,
        rawPayload:     toJsonValue(formData ?? rawPayload),
      },
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/submissions2]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}