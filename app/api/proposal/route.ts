import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

async function findAssessments(userId: string) {
  const submissions = await prisma.assessmentSubmission.findMany({
    where: { userId },
  });
  const first = submissions.find(
    (s: { submissionType: string }) => s.submissionType === "assessment1",
  );
  const second = submissions.find(
    (s: { submissionType: string }) => s.submissionType === "assessment2",
  );
  return first && second ? second : null;
}
const validId = (id: unknown): id is string =>
  typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(id);

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!validId(userId))
    return NextResponse.json(
      { error: "Valid userId required" },
      { status: 400 },
    );
  try {
    const second = await findAssessments(userId);
    if (!second)
      return NextResponse.json(
        { error: "Complete both assessments first" },
        { status: 403 },
      );
    const payload = (second.rawPayload ?? {}) as Record<string, unknown>;
    return NextResponse.json({
      requestedAt: payload._proposalRequestedAt ?? null,
      proposal: payload._financialProposal ?? null,
    });
  } catch {
    return NextResponse.json(
      { error: "Unable to load proposal status" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (!validId(userId))
      return NextResponse.json(
        { error: "Valid userId required" },
        { status: 400 },
      );
    const second = await findAssessments(userId);
    if (!second)
      return NextResponse.json(
        { error: "Complete both assessments first" },
        { status: 403 },
      );
    const payload = (second.rawPayload ?? {}) as Record<string, unknown>;
    if (payload._proposalRequestedAt)
      return NextResponse.json({ requestedAt: payload._proposalRequestedAt });
    const requestedAt = new Date().toISOString();
    await prisma.assessmentSubmission.update({
      where: { id: second.id },
      data: {
        rawPayload: JSON.parse(
          JSON.stringify({ ...payload, _proposalRequestedAt: requestedAt }),
        ),
      },
    });
    return NextResponse.json({ requestedAt }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to save proposal request" },
      { status: 500 },
    );
  }
}
