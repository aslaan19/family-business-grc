// app/api/questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

// ── Types ────────────────────────────────────────────────────────────────────

type QuestionRow = {
  id:            string;
  categoryKey:   string;
  categoryOrder: number;
  questionOrder: number;
  titleAr:       string | null;
  titleEn:       string | null;
  questionAr:    string | null;
  questionEn:    string | null;
  descriptionAr: string | null;
  descriptionEn: string | null;
};

// ── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const lang = req.nextUrl.searchParams.get("lang") ?? "ar";
    const isAr = lang === "ar";

    const rawQuestions = await prisma.assessmentQuestion.findMany({
      orderBy: [
        { categoryOrder: "asc" },
        { questionOrder: "asc" },
      ],
    });

    const questions = rawQuestions as unknown as QuestionRow[];

    const formatted = questions.map((q: QuestionRow) => ({
      id:            q.id,
      categoryKey:   q.categoryKey,
      categoryOrder: q.categoryOrder,
      questionOrder: q.questionOrder,
      title:         isAr ? q.titleAr       : q.titleEn,
      question:      isAr ? q.questionAr    : q.questionEn,
      description:   isAr ? q.descriptionAr : q.descriptionEn,
    }));

    return NextResponse.json({ questions: formatted });
  } catch (err) {
    console.error("[GET /api/questions]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}