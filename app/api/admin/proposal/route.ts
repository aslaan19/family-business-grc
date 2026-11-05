import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { validProposal } from "../../../lib/proposal-data";
export async function POST(req: NextRequest) {
  try {
    const { userId, proposal } = await req.json();
    if (typeof userId !== "string" || !validProposal(proposal))
      return NextResponse.json(
        {
          error:
            "Enter a title, scope, valid line items, tax rate, and valid-until date",
        },
        { status: 400 },
      );
    if (proposal.validUntil < new Date().toISOString().slice(0, 10))
      return NextResponse.json(
        { error: "The validity date must be today or later" },
        { status: 400 },
      );
    const submissions = (await prisma.assessmentSubmission.findMany({
      where: { userId },
    })) as { id: string; submissionType: string; rawPayload: unknown }[];
    const second = submissions.find((s) => s.submissionType === "assessment2");
    if (!second || !submissions.some((s) => s.submissionType === "assessment1"))
      return NextResponse.json(
        {
          error:
            "Both assessments must be submitted before a proposal can be published",
        },
        { status: 403 },
      );
    const payload = (second.rawPayload ?? {}) as Record<string, unknown>;
    const published = {
      title: proposal.title.trim(),
      scope: proposal.scope.trim(),
      items: proposal.items.map((i) => ({
        description: i.description.trim(),
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
      taxRate: proposal.taxRate,
      validUntil: proposal.validUntil,
      issuedAt: new Date().toISOString(),
      reference: `CRAM-${second.id.slice(0, 8).toUpperCase()}`,
    };
    await prisma.assessmentSubmission.update({
      where: { id: second.id },
      data: {
        rawPayload: JSON.parse(
          JSON.stringify({ ...payload, _financialProposal: published }),
        ),
      },
    });
    return NextResponse.json({ proposal: published });
  } catch {
    return NextResponse.json(
      { error: "Unable to publish financial proposal" },
      { status: 500 },
    );
  }
}
