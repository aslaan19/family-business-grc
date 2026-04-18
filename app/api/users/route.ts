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

    // Upsert: create if new, update if returning
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        fullName,
        phone: phone || null,
        companyName: companyName || null,
      },
      create: {
        fullName,
        email,
        phone: phone || null,
        companyName: companyName || null,
      },
    });

    // Check if this user already has a submission
    const existingSubmission = await prisma.assessmentSubmission.findFirst({
      where: { userId: user.id },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({
      user,
      hasSubmission: !!existingSubmission,
      submissionId: existingSubmission?.id ?? null,
    });
  } catch (err) {
    console.error("[POST /api/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/users?email=... — check if a user exists and has a submission
export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ exists: false, hasSubmission: false });
    }

    const existingSubmission = await prisma.assessmentSubmission.findFirst({
      where: { userId: user.id },
      orderBy: { submittedAt: "desc" },
    });

    return NextResponse.json({
      exists: true,
      hasSubmission: !!existingSubmission,
      user,
      submissionId: existingSubmission?.id ?? null,
    });
  } catch (err) {
    console.error("[GET /api/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}