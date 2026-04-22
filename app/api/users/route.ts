// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, jobTitle, email, phone, companyName, companySize } = body;

    if (!fullName || !email) {
      return NextResponse.json(
        { error: "fullName and email are required" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existingByEmail = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Check if phone already exists (on a DIFFERENT user)
    if (phone) {
      const existingByPhone = await prisma.user.findFirst({
        where: {
          phone: phone.trim(),
          NOT: { email: email.toLowerCase().trim() },
        },
      });
      if (existingByPhone) {
        return NextResponse.json(
          { error: "phone_taken" },
          { status: 409 },
        );
      }
    }

    let user;

    if (existingByEmail) {
      // Returning user — update their info
      user = await prisma.user.update({
        where: { email: email.toLowerCase().trim() },
        data: {
          fullName,
          phone:       phone       || null,
          companyName: companyName || null,
        },
      });
    } else {
      // New user — create
      user = await prisma.user.create({
        data: {
          fullName,
          email:       email.toLowerCase().trim(),
          phone:       phone       || null,
          companyName: companyName || null,
        },
      });
    }

    // Check both submission types
    const submissions = await prisma.assessmentSubmission.findMany({
      where:  { userId: user.id },
      select: { submissionType: true },
    });

    const hasAssessment1 = submissions.some((s) => s.submissionType === "assessment1");
    const hasAssessment2 = submissions.some((s) => s.submissionType === "assessment2");

    return NextResponse.json({
      user,
      hasSubmission:  hasAssessment1,
      hasSubmission2: hasAssessment2,
      isReturning:    !!existingByEmail,
    });
  } catch (err) {
    console.error("[POST /api/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/users?email=...
export async function GET(req: NextRequest) {
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
    });

    return NextResponse.json({
      exists:         true,
      user,
      hasSubmission:  submissions.some((s) => s.submissionType === "assessment1"),
      hasSubmission2: submissions.some((s) => s.submissionType === "assessment2"),
    });
  } catch (err) {
    console.error("[GET /api/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}