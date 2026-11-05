import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { validProposal } from "../../../lib/proposal-data";
import { proposalHtml } from "../../../lib/proposal-html";
import { renderPdf } from "../../../lib/pdf";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId)
      return NextResponse.json({ error: "userId required" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const submissions = (await prisma.assessmentSubmission.findMany({
      where: { userId },
    })) as { submissionType: string; rawPayload: unknown }[];
    const second = submissions.find((s) => s.submissionType === "assessment2");
    if (
      !user ||
      !second ||
      !submissions.some((s) => s.submissionType === "assessment1")
    )
      return NextResponse.json(
        { error: "Complete both assessments first" },
        { status: 403 },
      );
    const proposal = ((second.rawPayload ?? {}) as Record<string, unknown>)
      ._financialProposal;
    if (!validProposal(proposal))
      return NextResponse.json(
        { error: "A proposal has not been published yet" },
        { status: 404 },
      );
    const pdf = await renderPdf(proposalHtml(user, proposal));
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="CRAM-Financial-Proposal-${userId}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to generate proposal PDF" },
      { status: 500 },
    );
  }
}
