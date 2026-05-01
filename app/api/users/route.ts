// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

// ── Types ────────────────────────────────────────────────────────────────────

type CreateUserBody = {
  fullName:     string;
  jobTitle?:    string;
  email:        string;
  phone?:       string;
  companyName?: string;
  companySize?: string;
};

type SubmissionTypeRow = {
  submissionType: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function hasA1(submissions: SubmissionTypeRow[]): boolean {
  return submissions.some((s: SubmissionTypeRow) => s.submissionType === "assessment1");
}

function hasA2(submissions: SubmissionTypeRow[]): boolean {
  return submissions.some((s: SubmissionTypeRow) => s.submissionType === "assessment2");
}

// ── POST /api/users ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = (await req.json()) as Partial<CreateUserBody>;
    const { fullName, email, phone, companyName } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "fullName and email are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone?.trim() ?? null;

    // Check if phone is taken by a different user
    if (normalizedPhone) {
      const existingByPhone = await prisma.user.findFirst({
        where: {
          phone: normalizedPhone,
          NOT:   { email: normalizedEmail },
        },
      });
      if (existingByPhone) {
        return NextResponse.json({ error: "phone_taken" }, { status: 409 });
      }
    }

    const existingByEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    const user = existingByEmail
      ? await prisma.user.update({
          where: { email: normalizedEmail },
          data:  { fullName, phone: normalizedPhone, companyName: companyName ?? null },
        })
      : await prisma.user.create({
          data: {
            fullName,
            email:       normalizedEmail,
            phone:       normalizedPhone,
            companyName: companyName ?? null,
          },
        });

    const submissions = await prisma.assessmentSubmission.findMany({
      where:  { userId: user.id },
      select: { submissionType: true },
    }) as SubmissionTypeRow[];

    return NextResponse.json({
      user,
      hasSubmission:  hasA1(submissions),
      hasSubmission2: hasA2(submissions),
      isReturning:    !!existingByEmail,
    });
  } catch (err) {
    console.error("[POST /api/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ── GET /api/users?email=... ─────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ exists: false });
    }

    const submissions = await prisma.assessmentSubmission.findMany({
      where:  { userId: user.id },
      select: { submissionType: true },
    }) as SubmissionTypeRow[];

    return NextResponse.json({
      exists:         true,
      user,
      hasSubmission:  hasA1(submissions),
      hasSubmission2: hasA2(submissions),
    });
  } catch (err) {
    console.error("[GET /api/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}