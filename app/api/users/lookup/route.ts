// app/api/users/lookup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const submissions = await prisma.assessmentSubmission.findMany({
      where:  { userId: user.id },
      select: { submissionType: true },
    });

    return NextResponse.json({
      user: {
        id:          user.id,
        fullName:    user.fullName,
        email:       user.email,
        phone:       user.phone,
        companyName: user.companyName,
      },
      hasAssessment1: submissions.some((s) => s.submissionType === "assessment1"),
      hasAssessment2: submissions.some((s) => s.submissionType === "assessment2"),
    });
  } catch (err) {
    console.error("[POST /api/users/lookup]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}