// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

/**
 * GET /api/admin/users
 * Returns all users with their submission + answers (including question text).
 */
export async function GET() {
  try {
const users = await prisma.user.findMany({
  orderBy: { createdAt: "desc" },
  include: {
    submissions: {          // was: submission
      include: {
        answers: {
          include: { question: true },
          orderBy: [
            { question: { categoryOrder: "asc" } },
            { question: { questionOrder: "asc" } },
          ],
        },
      },
    },
  },
});

const formatted = users.map((u) => ({
  id:           u.id,
  name:         u.fullName,
  email:        u.email,
  phone:        u.phone ?? null,
  organization: u.companyName ?? null,
  createdAt:    u.createdAt,
  submission:   u.submissions[0] ?? null,  // grab latest, already sorted desc
}));

    return NextResponse.json({ users: formatted });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}