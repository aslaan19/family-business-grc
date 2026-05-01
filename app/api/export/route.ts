// app/api/export/route.ts
import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import ExcelJS from "exceljs";

// ── Prisma result types ──────────────────────────────────────────────────────

type QuestionRow = {
  categoryKey: string | null;
  categoryOrder: number;
  questionOrder: number;
  questionEn: string | null;
  questionAr: string | null;
};

type AnswerRow = {
  selectedValue: number;
  selectedLabel: string | null;
  question: QuestionRow | null;
};

type UserDetail = {
  fullName: string;
  email: string;
  companyName: string | null;
  createdAt: Date;
};

type SubmissionRow = {
  id: string;
  userId: string;
  submissionType: string;
  totalScore: number;
  maxScore: number | null;
  submittedAt: Date;
  user: UserDetail | null;
  answers: AnswerRow[];
};

// ── Constants ────────────────────────────────────────────────────────────────

const GREEN  = "FF1a6b3c";
const LGREEN = "FFD1FAE5";
const AMBER  = "FFFEF9C3";
const RED    = "FFFEE2E2";

const HEADER_FONT: ExcelJS.Font = {
  bold: true,
  color: { argb: "FFFFFFFF" },
  name: "Arial",
  size: 0,
  family: 0,
  scheme: "none",
  charset: 0,
  italic: false,
  underline: false,
  vertAlign: "superscript",
  strike: false,
  outline: false
};

const DETAIL_COLUMNS: Partial<ExcelJS.Column>[] = [
  { header: "Name",          key: "name",       width: 26 },
  { header: "Email",         key: "email",      width: 30 },
  { header: "Organization",  key: "org",        width: 22 },
  { header: "Category",      key: "category",   width: 22 },
  { header: "Q#",            key: "qnum",       width: 6  },
  { header: "Question (EN)", key: "questionEn", width: 52 },
  { header: "Question (AR)", key: "questionAr", width: 52 },
  { header: "Answer",        key: "label",      width: 12 },
  { header: "Score",         key: "value",      width: 10 },
];

const LABEL_COLORS: Record<string, string> = {
  yes:     LGREEN,
  partial: AMBER,
  no:      RED,
};

const LABEL_TEXT_COLORS: Record<string, string> = {
  yes:     "FF1a6b3c",
  partial: "FFb45309",
  no:      "FFdc2626",
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function headerFill(argb: string): ExcelJS.Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb } };
}

function styleHeaderRow(row: ExcelJS.Row, color = GREEN): void {
  row.height = 28;
  row.eachCell((cell) => {
    cell.font      = HEADER_FONT;
    cell.fill      = headerFill(color);
    cell.alignment = { horizontal: "center", vertical: "middle" };
    cell.border    = { bottom: { style: "medium", color: { argb: "FF0f4a29" } } };
  });
}

function applyAlternateRowFill(row: ExcelJS.Row, idx: number): void {
  if (idx % 2 === 0) {
    row.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAF9" } };
    });
  }
}

function addAnswerRows(sheet: ExcelJS.Worksheet, submissions: SubmissionRow[]): void {
  for (const sub of submissions) {
    sub.answers.forEach((ans: AnswerRow, idx: number) => {
      const row = sheet.addRow({
        name:       sub.user?.fullName             ?? "—",
        email:      sub.user?.email                ?? "—",
        org:        sub.user?.companyName          ?? "—",
        category:   ans.question?.categoryKey?.replace(/_/g, " ") ?? "—",
        qnum:       ans.question?.questionOrder    ?? "—",
        questionEn: ans.question?.questionEn       ?? "—",
        questionAr: ans.question?.questionAr       ?? "—",
        label:      ans.selectedLabel              ?? "—",
        value:      ans.selectedValue,
      });

      row.height = 20;
      row.eachCell((cell) => {
        cell.font      = { name: "Arial", size: 10 };
        cell.alignment = { wrapText: false, vertical: "middle" };
      });

      applyAlternateRowFill(row, idx);

      const label     = ans.selectedLabel ?? "";
      const labelCell = row.getCell("label");
      labelCell.fill  = {
        type: "pattern", pattern: "solid",
        fgColor: { argb: LABEL_COLORS[label] ?? "FFFFFFFF" },
      };
      labelCell.font = {
        name: "Arial", size: 10, bold: true,
        color: { argb: LABEL_TEXT_COLORS[label] ?? "FF000000" },
      };
    });
  }
}

async function fetchSubmissions(type: string): Promise<SubmissionRow[]> {
  const rows = await prisma.assessmentSubmission.findMany({
    where:   { submissionType: type },
    orderBy: { submittedAt: "desc" },
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
  });
  return rows as unknown as SubmissionRow[];
}

// ── Route handler ────────────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  try {
    const [subs1, subs2] = await Promise.all([
      fetchSubmissions("assessment1"),
      fetchSubmissions("assessment2"),
    ]);

    const wb    = new ExcelJS.Workbook();
    wb.creator  = "KARAM Admin";
    wb.created  = new Date();

    // ── Sheet 1: Summary ───────────────────────────────────────────────────

    const summary = wb.addWorksheet("Summary");
    summary.columns = [
      { header: "Name",         key: "name",      width: 28 },
      { header: "Email",        key: "email",     width: 32 },
      { header: "Organization", key: "org",       width: 26 },
      { header: "Assessment 1", key: "score1",    width: 14 },
      { header: "A1 %",         key: "pct1",      width: 10 },
      { header: "Assessment 2", key: "score2",    width: 14 },
      { header: "A2 %",         key: "pct2",      width: 10 },
      { header: "Registered",   key: "createdAt", width: 20 },
    ];
    styleHeaderRow(summary.getRow(1));

    type UserMapEntry = {
      name:      string;
      email:     string;
      org:       string;
      createdAt: string;
      sub1:      SubmissionRow | null;
      sub2:      SubmissionRow | null;
    };

    const userMap = new Map<string, UserMapEntry>();

    function upsertUser(s: SubmissionRow, key: "sub1" | "sub2"): void {
      if (!s.user) return;
      const existing = userMap.get(s.userId) ?? {
        name:      s.user.fullName,
        email:     s.user.email,
        org:       s.user.companyName ?? "—",
        createdAt: s.user.createdAt.toLocaleString("en-GB"),
        sub1:      null,
        sub2:      null,
      };
      existing[key] = s;
      userMap.set(s.userId, existing);
    }

    for (const s of subs1) upsertUser(s, "sub1");
    for (const s of subs2) upsertUser(s, "sub2");

    Array.from(userMap.values()).forEach((u: UserMapEntry, idx: number) => {
      const pct1 = u.sub1?.maxScore
        ? Math.round((u.sub1.totalScore / u.sub1.maxScore) * 100) : null;
      const pct2 = u.sub2?.maxScore
        ? Math.round((u.sub2.totalScore / u.sub2.maxScore) * 100) : null;

      const row = summary.addRow({
        name:      u.name,
        email:     u.email,
        org:       u.org,
        score1:    u.sub1 ? `${u.sub1.totalScore}/${u.sub1.maxScore ?? "?"}` : "Pending",
        pct1:      pct1 !== null ? `${pct1}%` : "—",
        score2:    u.sub2 ? `${u.sub2.totalScore}/${u.sub2.maxScore ?? "?"}` : "Pending",
        pct2:      pct2 !== null ? `${pct2}%` : "—",
        createdAt: u.createdAt,
      });

      row.height = 22;
      row.eachCell((cell) => { cell.font = { name: "Arial", size: 10 }; });
      applyAlternateRowFill(row, idx);

      for (const [key, pct] of [["pct1", pct1], ["pct2", pct2]] as [string, number | null][]) {
        if (pct === null) continue;
        row.getCell(key).font = {
          name: "Arial", size: 10, bold: true,
          color: { argb: pct >= 75 ? "FF1a6b3c" : pct >= 50 ? "FFb45309" : "FFdc2626" },
        };
      }
    });

    // ── Sheet 2: Assessment 1 Answers ──────────────────────────────────────

    const detail1 = wb.addWorksheet("Assessment 1 — Answers");
    detail1.columns = DETAIL_COLUMNS;
    styleHeaderRow(detail1.getRow(1));
    addAnswerRows(detail1, subs1);

    // ── Sheet 3: Assessment 2 Answers ──────────────────────────────────────

    const detail2 = wb.addWorksheet("Assessment 2 — Answers");
    detail2.columns = DETAIL_COLUMNS;
    styleHeaderRow(detail2.getRow(1), "FF0f4a29");
    addAnswerRows(detail2, subs2);

    // ── Sheet 4: Category Scores ───────────────────────────────────────────

    const catSheet = wb.addWorksheet("Category Scores");

    const allCats1 = Array.from(new Set(
      subs1.flatMap((s) => s.answers.map((a) => a.question?.categoryKey ?? "")).filter(Boolean),
    )).sort();

    const allCats2 = Array.from(new Set(
      subs2.flatMap((s) => s.answers.map((a) => a.question?.categoryKey ?? "")).filter(Boolean),
    )).sort();

    catSheet.columns = [
      { header: "Name",  key: "name",  width: 26 },
      { header: "Email", key: "email", width: 30 },
      ...allCats1.map((c) => ({ header: `A1: ${c.replace(/_/g, " ")}`, key: `a1_${c}`, width: 20 })),
      { header: "A1 Total %", key: "total1", width: 12 },
      ...allCats2.map((c) => ({ header: `A2: ${c.replace(/_/g, " ")}`, key: `a2_${c}`, width: 20 })),
      { header: "A2 Total %", key: "total2", width: 12 },
    ];
    styleHeaderRow(catSheet.getRow(1));

    function calcCatScores(
      sub: SubmissionRow | null,
      cats: string[],
      prefix: string,
    ): Record<string, string> {
      const result: Record<string, string> = {};
      for (const cat of cats) {
        const catAnswers = sub?.answers.filter(
          (a: AnswerRow) => a.question?.categoryKey === cat
        ) ?? [];
        if (catAnswers.length === 0) {
          result[`${prefix}_${cat}`] = "—";
          continue;
        }
        const score = catAnswers.reduce((sum: number, a: AnswerRow) => sum + a.selectedValue, 0);
        const max   = catAnswers.length * 10;
        result[`${prefix}_${cat}`] = `${score}/${max} (${Math.round((score / max) * 100)}%)`;
      }
      return result;
    }

    for (const u of Array.from(userMap.values())) {
      const catScores1 = calcCatScores(u.sub1, allCats1, "a1");
      const catScores2 = calcCatScores(u.sub2, allCats2, "a2");

      const pct1 = u.sub1?.maxScore
        ? `${Math.round((u.sub1.totalScore / u.sub1.maxScore) * 100)}%` : "—";
      const pct2 = u.sub2?.maxScore
        ? `${Math.round((u.sub2.totalScore / u.sub2.maxScore) * 100)}%` : "—";

      const row = catSheet.addRow({
        name: u.name, email: u.email,
        ...catScores1, total1: pct1,
        ...catScores2, total2: pct2,
      });
      row.height = 22;
      row.eachCell((cell) => { cell.font = { name: "Arial", size: 10 }; });
    }

    // ── Stream response ────────────────────────────────────────────────────

    const buffer = await wb.xlsx.writeBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="karam-submissions-${Date.now()}.xlsx"`,
      },
    });
  } catch (err) {
    console.error("[GET /api/export]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}