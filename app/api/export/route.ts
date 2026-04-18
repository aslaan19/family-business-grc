// app/api/export/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import ExcelJS from "exceljs";

const GREEN  = "FF1a6b3c";
const LGREEN = "FFD1FAE5";
const AMBER  = "FFFEF9C3";
const RED    = "FFFEE2E2";
const HEADER_FONT = { bold: true, color: { argb: "FFFFFFFF" }, name: "Sora" } as const;
const CENTER = { horizontal: "center" as const };

function headerFill(argb: string): ExcelJS.Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb } };
}

export async function GET() {
  try {
    const submissions = await prisma.assessmentSubmission.findMany({
      include: {
        user: true,
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

    const wb = new ExcelJS.Workbook();
    wb.creator  = "KARAM Admin";
    wb.created  = new Date();

    // ── Sheet 1: Summary ────────────────────────────────────────────────────
    const summary = wb.addWorksheet("Summary");

    summary.columns = [
      { header: "Name",          key: "name",        width: 28 },
      { header: "Email",         key: "email",       width: 32 },
      { header: "Organization",  key: "org",         width: 26 },
      { header: "Total Score",   key: "score",       width: 14 },
      { header: "Max Score",     key: "maxScore",    width: 12 },
      { header: "Percentage",    key: "pct",         width: 13 },
      { header: "Submitted At",  key: "submittedAt", width: 22 },
    ];

    summary.getRow(1).eachCell((cell) => {
      cell.font      = HEADER_FONT;
      cell.fill      = headerFill(GREEN);
      cell.alignment = CENTER;
      cell.border    = {
        bottom: { style: "medium", color: { argb: "FF0f4a29" } },
      };
    });
    summary.getRow(1).height = 28;

    submissions.forEach((sub, idx) => {
      const pct = sub.maxScore
        ? Math.round((sub.totalScore / sub.maxScore) * 100)
        : 0;

      const row = summary.addRow({
        name:        sub.user?.fullName        ?? "—",
        email:       sub.user?.email       ?? "—",
        org:         sub.user?.companyName ?? "—",
        score:       sub.totalScore,
        maxScore:    sub.maxScore ?? 0,
        pct:         `${pct}%`,
        submittedAt: new Date(sub.submittedAt).toLocaleString("en-GB"),
      });

      row.height = 22;
      row.eachCell((cell) => {
        cell.font = { name: "Sora", size: 10 };
      });

      // Zebra stripe
      if (idx % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAF9" } };
        });
      }

      // Colour the percentage cell
      const pctCell = row.getCell("pct");
      pctCell.font = {
        name: "Sora", size: 10, bold: true,
        color: {
          argb: pct >= 75 ? "FF1a6b3c" : pct >= 50 ? "FFb45309" : "FFdc2626",
        },
      };
    });

    // ── Sheet 2: Answers Detail ─────────────────────────────────────────────
    const detail = wb.addWorksheet("Answers Detail");

    detail.columns = [
      { header: "Name",           key: "name",        width: 26 },
      { header: "Email",          key: "email",       width: 30 },
      { header: "Category",       key: "category",    width: 22 },
      { header: "Q#",             key: "qnum",        width: 6  },
      { header: "Question (EN)",  key: "questionEn",  width: 52 },
      { header: "Question (AR)",  key: "questionAr",  width: 52 },
      { header: "Answer",         key: "label",       width: 12 },
      { header: "Score",          key: "value",       width: 10 },
    ];

    detail.getRow(1).eachCell((cell) => {
      cell.font      = HEADER_FONT;
      cell.fill      = headerFill(GREEN);
      cell.alignment = CENTER;
      cell.border    = {
        bottom: { style: "medium", color: { argb: "FF0f4a29" } },
      };
    });
    detail.getRow(1).height = 28;

    submissions.forEach((sub) => {
      sub.answers.forEach((ans, idx) => {
        const row = detail.addRow({
          name:       sub.user?.fullName        ?? "—",
          email:      sub.user?.email       ?? "—",
          category:   ans.question?.categoryKey?.replace(/_/g, " ") ?? "—",
          qnum:       ans.question?.questionOrder ?? "—",
          questionEn: ans.question?.questionEn   ?? "—",
          questionAr: ans.question?.questionAr   ?? "—",
          label:      ans.selectedLabel          ?? "—",
          value:      ans.selectedValue,
        });

        row.height = 20;
        row.eachCell((cell) => {
          cell.font = { name: "Sora", size: 10 };
          cell.alignment = { wrapText: false };
        });

        // Zebra stripe
        if (idx % 2 === 0) {
          row.eachCell((cell) => {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAF9" } };
          });
        }

        // Colour answer cell
        const answerCell = row.getCell("label");
        const labelColors: Record<string, string> = {
          yes:     LGREEN,
          partial: AMBER,
          no:      RED,
        };
        answerCell.fill = {
          type: "pattern", pattern: "solid",
          fgColor: { argb: labelColors[ans.selectedLabel ?? ""] ?? "FFFFFFFF" },
        };
        answerCell.font = {
          name: "Sora", size: 10, bold: true,
          color: {
            argb: ans.selectedLabel === "yes"
              ? "FF1a6b3c"
              : ans.selectedLabel === "partial"
                ? "FFb45309"
                : "FFdc2626",
          },
        };
      });
    });

    // ── Sheet 3: Category Scores ────────────────────────────────────────────
    const catSheet = wb.addWorksheet("Category Scores");

    // Collect unique category keys
    const allCats = Array.from(
      new Set(
        submissions.flatMap((s) =>
          s.answers.map((a) => a.question?.categoryKey ?? ""),
        ).filter(Boolean),
      ),
    ).sort();

    catSheet.columns = [
      { header: "Name",  key: "name",  width: 26 },
      { header: "Email", key: "email", width: 30 },
      ...allCats.map((c) => ({
        header: c.replace(/_/g, " "),
        key:    c,
        width:  20,
      })),
      { header: "Total %", key: "total", width: 12 },
    ];

    catSheet.getRow(1).eachCell((cell) => {
      cell.font      = HEADER_FONT;
      cell.fill      = headerFill(GREEN);
      cell.alignment = CENTER;
    });
    catSheet.getRow(1).height = 28;

    submissions.forEach((sub) => {
      const catScores: Record<string, string> = {};
      allCats.forEach((cat) => {
        const catAnswers = sub.answers.filter((a) => a.question?.categoryKey === cat);
        if (catAnswers.length === 0) { catScores[cat] = "—"; return; }
        const score = catAnswers.reduce((s, a) => s + a.selectedValue, 0);
        const max   = catAnswers.length * 10;
        catScores[cat] = `${score}/${max} (${Math.round((score / max) * 100)}%)`;
      });

      const totalPct = sub.maxScore
        ? Math.round((sub.totalScore / sub.maxScore) * 100)
        : 0;

      const row = catSheet.addRow({
        name:  sub.user?.fullName  ?? "—",
        email: sub.user?.email ?? "—",
        ...catScores,
        total: `${totalPct}%`,
      });

      row.height = 22;
      row.eachCell((cell) => { cell.font = { name: "Sora", size: 10 }; });
    });

    // ── Stream response ─────────────────────────────────────────────────────
    const buffer = await wb.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="karam-submissions-${Date.now()}.xlsx"`,
      },
    });
  } catch (err) {
    console.error("[GET /api/export]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}