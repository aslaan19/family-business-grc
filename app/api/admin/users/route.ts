// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        submissions: {
          include: {
            answers: {
              include: { question: true },
              orderBy: [
                { question: { categoryOrder: "asc" } },
                { question: { questionOrder: "asc" } },
              ],
            },
          },
          orderBy: { submittedAt: "asc" },
        },
      },
    });

    const formatted = users.map((u) => {
      const sub1 = u.submissions.find((s) => s.submissionType === "assessment1") ?? null;
      const sub2 = u.submissions.find((s) => s.submissionType === "assessment2") ?? null;

      return {
        id:           u.id,
        name:         u.fullName,
        email:        u.email,
        phone:        u.phone        ?? null,
        organization: u.companyName  ?? null,
        createdAt:    u.createdAt,
        submission:   sub1,   // kept for backward compat with admin page
        submission2:  sub2,
      };
    });

    return NextResponse.json({ users: formatted });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}