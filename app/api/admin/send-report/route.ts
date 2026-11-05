import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { reportHtml, type ReportSource } from "../../../lib/report-html";
export async function POST(req: NextRequest) {
  try {
    const { userId, assessmentType } = await req.json();
    if (!userId || !["assessment1", "assessment2"].includes(assessmentType))
      return NextResponse.json(
        { error: "Valid userId and assessmentType required" },
        { status: 400 },
      );
    if (!process.env.RESEND_API_KEY)
      return NextResponse.json(
        { error: "Email delivery is not configured" },
        { status: 503 },
      );
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const submission = await prisma.assessmentSubmission.findFirst({
      where: { userId, submissionType: assessmentType },
      include: {
        answers: {
          include: { question: true },
          orderBy: [
            { question: { categoryOrder: "asc" } },
            { question: { questionOrder: "asc" } },
          ],
        },
      },
      orderBy: { submittedAt: "desc" },
    });
    if (!user || !submission)
      return NextResponse.json(
        { error: "Submitted report not found" },
        { status: 404 },
      );
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          process.env.REPORT_FROM_EMAIL || "CRAM Consulting <reports@cram.sa>",
        to: [user.email],
        subject: `Your CRAM ${assessmentType === "assessment1" ? "Governance Assessment" : "Institutional Profile"} Report`,
        html: reportHtml({
          user,
          submission,
          type: assessmentType,
        } as ReportSource),
      }),
    });
    if (!res.ok)
      return NextResponse.json(
        { error: "Email provider rejected delivery" },
        { status: 502 },
      );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-report]", err);
    return NextResponse.json(
      { error: "Unable to send report" },
      { status: 500 },
    );
  }
}
