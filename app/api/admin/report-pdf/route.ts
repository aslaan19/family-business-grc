import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { reportHtml, type ReportSource } from "../../../lib/report-html";
import { renderPdf } from "../../../lib/pdf";

export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    const type = req.nextUrl.searchParams.get("type") ?? "assessment1";
    if (!userId || !["assessment1", "assessment2"].includes(type))
      return NextResponse.json(
        { error: "A valid userId and assessment type are required" },
        { status: 400 },
      );
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const submission = await prisma.assessmentSubmission.findFirst({
      where: { userId, submissionType: type },
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
    const pdf = await renderPdf(
      reportHtml({ user, submission, type } as ReportSource),
    );
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="CRAM-${type}-${userId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[report-pdf]", err);
    return NextResponse.json(
      { error: "Unable to generate PDF" },
      { status: 500 },
    );
  }
}
