// app/api/questions/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

/**
 * GET /api/questions?lang=ar|en
 *
 * Returns all questions ordered properly:
 * categoryOrder → questionOrder
 *
 * Also supports language selection
 */
export async function GET(req: NextRequest) {
  try {
    const lang = req.nextUrl.searchParams.get("lang") || "ar";

    const questions = await prisma.assessmentQuestion.findMany({
      orderBy: [
        { categoryOrder: "asc" },
        { questionOrder: "asc" },
      ],
    });

    // 🔥 Transform for frontend (VERY IMPORTANT)
    const formatted = questions.map((q) => ({
      id: q.id,
      categoryKey: q.categoryKey,
      categoryOrder: q.categoryOrder,
      questionOrder: q.questionOrder,

      title: lang === "ar" ? q.titleAr : q.titleEn,
      question: lang === "ar" ? q.questionAr : q.questionEn,
      description: lang === "ar" ? q.descriptionAr : q.descriptionEn,
    }));

    return NextResponse.json({ questions: formatted });
  } catch (err) {
    console.error("[GET /api/questions]", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}