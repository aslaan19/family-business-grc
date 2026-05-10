/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/admin/report-pdf/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import path from "path";
import fs from "fs";

export async function GET(req: NextRequest) {
  try {
    const userId         = req.nextUrl.searchParams.get("userId");
    const assessmentType = req.nextUrl.searchParams.get("type") ?? "assessment1";

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    // ── Fetch user ────────────────────────────────────────────────────────────
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // ── Fetch submission with answers ─────────────────────────────────────────
    const submission = await prisma.assessmentSubmission.findFirst({
      where:   { userId, submissionType: assessmentType },
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

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // ── Build category breakdown ──────────────────────────────────────────────
    const catBreakdown: Record<string, { score: number; max: number; pct: number; order: number }> = {};

    submission.answers.forEach((a: { question: { categoryKey: string; categoryOrder: any; }; selectedValue: number; }) => {
      const k = a.question?.categoryKey ?? "unknown";
      if (!catBreakdown[k]) catBreakdown[k] = { score: 0, max: 0, pct: 0, order: a.question?.categoryOrder ?? 99 };
      catBreakdown[k].score += a.selectedValue;
      catBreakdown[k].max   += 10;
    });

    Object.keys(catBreakdown).forEach((k) => {
      catBreakdown[k].pct = catBreakdown[k].max > 0
        ? Math.round((catBreakdown[k].score / catBreakdown[k].max) * 100) : 0;
    });

    const totalScore = submission.totalScore;
    const maxScore   = submission.maxScore ?? submission.answers.length * 10;
    const pct        = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

    const scoreLabel = pct >= 80 ? "Excellent" : pct >= 60 ? "Good" : pct >= 40 ? "Average" : "Needs Improvement";
    const scoreColor = pct >= 80 ? "#059669"   : pct >= 60 ? "#c9a227" : pct >= 40 ? "#d97706" : "#dc2626";

    const sortedCats = Object.entries(catBreakdown).sort(([, a], [, b]) => a.order - b.order);

    // ── Logo as base64 ────────────────────────────────────────────────────────
    let logoBase64 = "";
    try {
      const logoPath = path.join(process.cwd(), "public", "images", "logo.png");
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
      }
    } catch {
      // Logo not found — will use text fallback
    }

    // ── Radar SVG ─────────────────────────────────────────────────────────────
    const n = sortedCats.length;
    const R  = 85; const cx = 115; const cy = 115;
    const angleStep  = (2 * Math.PI) / n;
    const startAngle = -Math.PI / 2;

    function polar(r: number, i: number) {
      const a = startAngle + i * angleStep;
      return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
    }

    const dataPoints = sortedCats.map(([, val], i) => polar((val.pct / 100) * R, i));
    const polyPath   = dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";
    const rings      = [20, 40, 60, 80, 100];

    const radarSVG = `
<svg viewBox="0 0 230 230" xmlns="http://www.w3.org/2000/svg" width="230" height="230">
  ${rings.map(r => {
    const pts = sortedCats.map((_, i) => { const p = polar((r/100)*R, i); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(" ");
    return `<polygon points="${pts}" fill="none" stroke="#e5e7eb" stroke-width="0.8"/>`;
  }).join("")}
  ${sortedCats.map((_, i) => { const p = polar(R, i); return `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="#e5e7eb" stroke-width="0.8"/>`; }).join("")}
  <path d="${polyPath}" fill="#1a6b3c20" stroke="#1a6b3c" stroke-width="2" stroke-linejoin="round"/>
  ${dataPoints.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="#1a6b3c" stroke="white" stroke-width="1.5"/>`).join("")}
  ${sortedCats.map(([key], i) => {
    const lp    = polar(R + 20, i);
    const angle = startAngle + i * angleStep;
    const anchor = Math.cos(angle) < -0.15 ? "end" : Math.cos(angle) > 0.15 ? "start" : "middle";
    const short  = key.replace(/_/g, " ").split(" ").slice(0, 2).join(" ");
    const pctVal = catBreakdown[key].pct;
    return `
      <text x="${lp.x.toFixed(1)}" y="${(lp.y - 4).toFixed(1)}" text-anchor="${anchor}" font-size="7.5" fill="#374151" font-family="Arial" font-weight="600">${short}</text>
      <text x="${lp.x.toFixed(1)}" y="${(lp.y + 7).toFixed(1)}" text-anchor="${anchor}" font-size="8" fill="#1a6b3c" font-family="Arial" font-weight="700">${pctVal}%</text>
    `;
  }).join("")}
</svg>`;

    // ── Group answers by category ─────────────────────────────────────────────
const groupedAnswers = submission.answers.reduce(
  (acc: Record<string, typeof submission.answers>, a: { question: { categoryKey: string; }; }) => {
    const k = a.question?.categoryKey ?? "unknown";
    if (!acc[k]) acc[k] = [];
    acc[k].push(a);
    return acc;
  },
  {} as Record<string, typeof submission.answers>
);

    const submittedDate = new Date(submission.submittedAt).toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric"
    });
    const generatedDate = new Date().toLocaleDateString("en-GB", {
      day: "numeric", month: "long", year: "numeric"
    });

    // ── Build category bars HTML ──────────────────────────────────────────────
    const catBarsHtml = sortedCats.map(([key, val]) => {
      const c = val.pct >= 70 ? "#059669" : val.pct >= 50 ? "#d97706" : "#dc2626";
      const label = val.pct >= 70 ? "Strong" : val.pct >= 50 ? "Moderate" : "Needs Work";
      return `
        <tr>
          <td style="padding:9px 14px;font-size:11.5px;color:#374151;border-bottom:1px solid #f3f4f6;text-transform:capitalize;font-weight:500;">
            ${key.replace(/_/g, " ")}
          </td>
          <td style="padding:9px 14px;border-bottom:1px solid #f3f4f6;width:180px;">
            <div style="height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;">
              <div style="height:100%;width:${val.pct}%;background:${c};border-radius:3px;"></div>
            </div>
          </td>
          <td style="padding:9px 14px;text-align:center;border-bottom:1px solid #f3f4f6;white-space:nowrap;">
            <span style="font-size:11px;font-weight:700;color:${c};background:${c}15;padding:2px 9px;border-radius:12px;">${val.pct}%</span>
          </td>
          <td style="padding:9px 14px;font-size:10.5px;color:#9ca3af;border-bottom:1px solid #f3f4f6;white-space:nowrap;">
            ${val.score}/${val.max} pts
          </td>
          <td style="padding:9px 14px;font-size:10px;color:${c};border-bottom:1px solid #f3f4f6;font-weight:600;">
            ${label}
          </td>
        </tr>`;
    }).join("");

    // ── Build detailed answers HTML ───────────────────────────────────────────
    const detailedAnswersHtml = sortedCats.map(([catKey]) => {
      const answers = (groupedAnswers[catKey] ?? []).sort((a: { question: { questionOrder: number; }; }, b: { question: { questionOrder: number; }; }) => a.question.questionOrder - b.question.questionOrder);
      const bd = catBreakdown[catKey];
      if (!answers.length) return "";

      const catColor = bd.pct >= 70 ? "#059669" : bd.pct >= 50 ? "#d97706" : "#dc2626";

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rowsHtml = answers.map((a: { selectedLabel: string; question: { questionEn: any; }; selectedValue: any; }) => {
        const ansColor = a.selectedLabel === "yes" ? "#059669" : a.selectedLabel === "partial" ? "#d97706" : "#dc2626";
        const ansLabel = a.selectedLabel === "yes" ? "✓  Yes" : a.selectedLabel === "partial" ? "~  Partial" : "✗  No";
        const ansIcon  = a.selectedLabel === "yes" ? "✓" : a.selectedLabel === "partial" ? "~" : "✗";
        return `
          <tr>
            <td style="padding:9px 14px;font-size:11px;color:#374151;line-height:1.5;border-bottom:1px solid #f9fafb;vertical-align:top;width:65%;">
              ${a.question.questionEn}
            </td>
            <td style="padding:9px 14px;border-bottom:1px solid #f9fafb;text-align:center;vertical-align:top;">
              <span style="font-size:10px;font-weight:700;color:${ansColor};background:${ansColor}12;padding:3px 8px;border-radius:10px;white-space:nowrap;">
                ${ansLabel}
              </span>
            </td>
            <td style="padding:9px 14px;border-bottom:1px solid #f9fafb;text-align:center;vertical-align:top;">
              <span style="font-size:11px;font-weight:700;color:${ansColor};">+${a.selectedValue}</span>
            </td>
          </tr>`;
      }).join("");

      return `
        <div style="margin-bottom:18px;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;page-break-inside:avoid;">
          <div style="background:#f9fafb;padding:10px 14px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #e5e7eb;">
            <span style="font-size:12px;font-weight:700;color:#111827;text-transform:capitalize;">${catKey.replace(/_/g, " ")}</span>
            <div style="display:flex;align-items:center;gap:10px;">
              <span style="font-size:10.5px;color:#9ca3af;">${bd.score}/${bd.max} pts</span>
              <span style="font-size:11px;font-weight:700;color:${catColor};background:${catColor}15;padding:2px 9px;border-radius:10px;">${bd.pct}%</span>
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#fcfcfc;">
                <th style="padding:7px 14px;text-align:left;font-size:9.5px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #f3f4f6;">Question</th>
                <th style="padding:7px 14px;text-align:center;font-size:9.5px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #f3f4f6;">Response</th>
                <th style="padding:7px 14px;text-align:center;font-size:9.5px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #f3f4f6;">Points</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
        </div>`;
    }).join("");

    // ── Recommendations ───────────────────────────────────────────────────────
    const weakAreas = sortedCats.filter(([, v]) => v.pct < 70);
    const recsHtml = weakAreas.length === 0
      ? `<p style="color:#059669;font-size:12px;font-weight:600;">✓ All domains are performing at or above the 70% benchmark.</p>`
      : weakAreas.slice(0, 5).map(([key, val], i) => `
          <div style="display:flex;gap:14px;padding:14px;background:${i === 0 ? "#f3f8ed" : "#fafafa"};border:1px solid ${i === 0 ? "#d4edd9" : "#f0f0f0"};border-radius:10px;margin-bottom:10px;">
            <div style="width:28px;height:28px;border-radius:8px;background:${i === 0 ? "#1a6b3c" : "#f3f4f6"};color:${i === 0 ? "#fff" : "#1a6b3c"};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:800;flex-shrink:0;">
              ${i + 1}
            </div>
            <div>
              <p style="margin:0 0 4px;font-size:12px;font-weight:700;color:#111827;text-transform:capitalize;">${key.replace(/_/g, " ")} — ${val.pct}%</p>
              <p style="margin:0;font-size:11px;color:#6b7280;line-height:1.5;">
                ${val.pct < 40
                  ? `Scored ${val.score}/${val.max} points. This domain requires immediate structured intervention with a clear improvement roadmap and dedicated resources.`
                  : `Scored ${val.score}/${val.max} points. Targeted initiatives are recommended to bring this domain to the 70%+ benchmark level.`}
              </p>
            </div>
          </div>`
        ).join("");

    // ── Answer distribution ───────────────────────────────────────────────────
    const yesCount     = submission.answers.filter((a: { selectedLabel: string; }) => a.selectedLabel === "yes").length;
    const partialCount = submission.answers.filter((a: { selectedLabel: string; }) => a.selectedLabel === "partial").length;
    const noCount      = submission.answers.filter((a: { selectedLabel: string; }) => a.selectedLabel === "no").length;
    const totalAns     = submission.answers.length;

    const yesPct     = Math.round((yesCount / totalAns) * 100);
    const partialPct = Math.round((partialCount / totalAns) * 100);
    const noPct      = 100 - yesPct - partialPct;

    // ── Full HTML ─────────────────────────────────────────────────────────────
    const logoHtml = logoBase64
      ? `<img src="${logoBase64}" alt="CRAM Logo" style="height:36px;object-fit:contain;" />`
      : `<div style="font-size:16px;font-weight:900;color:#fff;letter-spacing:-0.5px;">CRAM</div>`;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Helvetica Neue',Arial,sans-serif; color:#111827; background:#fff; font-size:12px; }
    @page { margin:0; size:A4; }
    .page-break { page-break-before:always; }
  </style>
</head>
<body>

<!-- ═══════════════════════════════════════════════════════
     PAGE 1 — COVER
═══════════════════════════════════════════════════════ -->
<div style="min-height:297mm;background:linear-gradient(145deg,#0a2e1a 0%,#0f3d22 55%,#0d3520 100%);padding:0;position:relative;overflow:hidden;display:flex;flex-direction:column;">

  <!-- Grid texture -->
  <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(201,162,39,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(201,162,39,0.07) 1px,transparent 1px);background-size:40px 40px;pointer-events:none;"></div>

  <!-- Corner accents -->
  <div style="position:absolute;top:0;left:0;width:60px;height:3px;background:linear-gradient(90deg,#c9a227,transparent);"></div>
  <div style="position:absolute;top:0;left:0;width:3px;height:60px;background:linear-gradient(180deg,#c9a227,transparent);"></div>
  <div style="position:absolute;bottom:0;right:0;width:60px;height:3px;background:linear-gradient(270deg,#c9a227,transparent);"></div>
  <div style="position:absolute;bottom:0;right:0;width:3px;height:60px;background:linear-gradient(0deg,#c9a227,transparent);"></div>

  <!-- Top bar -->
  <div style="position:relative;z-index:1;padding:28px 48px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(201,162,39,0.2);">
    <div style="display:flex;align-items:center;gap:14px;">
      ${logoHtml}
      <div style="border-left:1px solid rgba(255,255,255,0.2);padding-left:14px;">
        <div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.9);letter-spacing:0.15em;text-transform:uppercase;">CRAM Consulting</div>
        <div style="font-size:8.5px;color:rgba(255,255,255,0.4);letter-spacing:0.12em;text-transform:uppercase;margin-top:1px;">Executive Governance Assessment</div>
      </div>
    </div>
    <div style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#c9a227;border:1px solid rgba(201,162,39,0.35);padding:5px 14px;border-radius:20px;background:rgba(201,162,39,0.08);">
      Confidential
    </div>
  </div>

  <!-- Hero content -->
  <div style="position:relative;z-index:1;padding:56px 48px 40px;flex:1;display:flex;flex-direction:column;justify-content:space-between;">

    <div style="display:flex;justify-content:space-between;align-items:flex-start;">
      <!-- Left: title + user info -->
      <div style="max-width:520px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:rgba(201,162,39,0.7);margin-bottom:18px;">
          Assessment 1 · Governance Report
        </div>

        <div style="font-size:56px;font-weight:900;color:#fff;line-height:1.0;letter-spacing:-2px;margin-bottom:8px;">
          Governance
        </div>
        <div style="font-size:56px;font-weight:900;color:#c9a227;line-height:1.0;letter-spacing:-2px;margin-bottom:40px;">
          Assessment Report
        </div>

        <!-- User info block -->
        <div style="border-left:3px solid #c9a227;padding-left:20px;margin-bottom:32px;">
          <div style="font-size:22px;font-weight:800;color:#fff;margin-bottom:4px;">${user.fullName}</div>
          ${user.companyName ? `<div style="font-size:13px;color:rgba(255,255,255,0.55);margin-bottom:2px;">${user.companyName}</div>` : ""}
          ${user.email ? `<div style="font-size:11px;color:rgba(255,255,255,0.35);font-family:monospace;">${user.email}</div>` : ""}
        </div>

        <div style="font-size:9.5px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:rgba(255,255,255,0.3);">
          Submitted ${submittedDate}
        </div>
      </div>

      <!-- Right: score ring -->
      <div style="text-align:center;flex-shrink:0;">
        <div style="position:relative;display:inline-block;margin-bottom:12px;">
          <!-- SVG donut -->
          <svg width="160" height="160" viewBox="0 0 160 160" style="display:block;">
            <circle cx="80" cy="80" r="66" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="14"/>
            <circle cx="80" cy="80" r="66" fill="none" stroke="${scoreColor}" stroke-width="14"
              stroke-linecap="round"
              stroke-dasharray="${(pct/100)*2*Math.PI*66} ${2*Math.PI*66}"
              transform="rotate(-90 80 80)"/>
            <text x="80" y="72" text-anchor="middle" font-size="32" font-weight="900" fill="${scoreColor}" font-family="Arial">${pct}%</text>
            <text x="80" y="92" text-anchor="middle" font-size="10" font-weight="700" fill="${scoreColor}" font-family="Arial" letter-spacing="2">${scoreLabel.toUpperCase()}</text>
          </svg>
        </div>
        <div style="font-size:9px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.3);margin-bottom:2px;">Overall Score</div>
        <div style="font-size:11px;color:rgba(255,255,255,0.5);">${totalScore} of ${maxScore} pts</div>
      </div>
    </div>

    <!-- Stats row -->
    <div style="display:flex;gap:12px;margin-top:40px;">
      ${[
        { l: "Total Score",  v: `${totalScore}/${maxScore}` },
        { l: "Questions",    v: submission.answers.length },
        { l: "Domains",      v: sortedCats.length },
        { l: "Rating",       v: scoreLabel },
      ].map(s => `
        <div style="flex:1;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:14px 16px;text-align:center;">
          <div style="font-size:18px;font-weight:900;color:#fff;">${s.v}</div>
          <div style="font-size:8.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.35);margin-top:3px;">${s.l}</div>
        </div>`).join("")}
    </div>
  </div>

  <!-- Footer bar -->
  <div style="position:relative;z-index:1;padding:14px 48px;border-top:1px solid rgba(255,255,255,0.07);display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:8.5px;color:rgba(255,255,255,0.25);letter-spacing:0.1em;">gm@cram.sa · cram.sa</span>
    <span style="font-size:8.5px;color:rgba(255,255,255,0.25);">Page 1</span>
  </div>
</div>


<!-- ═══════════════════════════════════════════════════════
     PAGE 2 — CHARTS & DOMAIN SCORES
═══════════════════════════════════════════════════════ -->
<div class="page-break" style="min-height:297mm;padding:0;">

  <!-- Page header -->
  <div style="background:#0a2e1a;padding:16px 48px;display:flex;align-items:center;justify-content:space-between;">
    ${logoHtml}
    <div style="font-size:9px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.12em;">Performance Analysis · ${user.fullName}</div>
  </div>

  <div style="padding:32px 48px;">

    <!-- Section title -->
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
      <div style="width:4px;height:20px;background:#1a6b3c;border-radius:2px;"></div>
      <h2 style="font-size:13px;font-weight:800;color:#111827;text-transform:uppercase;letter-spacing:0.1em;">Performance by Domain</h2>
    </div>

    <!-- Radar + Bars side by side -->
    <div style="display:flex;gap:24px;margin-bottom:28px;">

      <!-- Radar -->
      <div style="flex:0 0 260px;border:1px solid #e5e7eb;border-radius:12px;padding:18px;">
        <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#9ca3af;margin-bottom:14px;">Spider Chart</div>
        ${radarSVG}
      </div>

      <!-- Domain table -->
      <div style="flex:1;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
        <div style="padding:14px 16px;border-bottom:1px solid #f3f4f6;background:#f9fafb;">
          <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#9ca3af;">Domain Scores</div>
        </div>
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:#fcfcfc;">
              <th style="padding:8px 14px;text-align:left;font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #f3f4f6;">Domain</th>
              <th style="padding:8px 14px;font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #f3f4f6;">Progress</th>
              <th style="padding:8px 14px;text-align:center;font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #f3f4f6;">Score</th>
              <th style="padding:8px 14px;font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #f3f4f6;">Pts</th>
              <th style="padding:8px 14px;font-size:9px;color:#9ca3af;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;border-bottom:1px solid #f3f4f6;">Rating</th>
            </tr>
          </thead>
          <tbody>${catBarsHtml}</tbody>
        </table>
      </div>
    </div>

    <!-- Answer distribution -->
    <div style="border:1px solid #e5e7eb;border-radius:12px;padding:18px;margin-bottom:28px;">
      <div style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#9ca3af;margin-bottom:14px;">Answer Distribution — ${totalAns} Questions</div>
      <div style="height:24px;border-radius:8px;overflow:hidden;display:flex;margin-bottom:12px;">
        <div style="width:${yesPct}%;background:#059669;display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:700;">
          ${yesPct > 12 ? `Yes (${yesCount})` : ""}
        </div>
        <div style="width:${partialPct}%;background:#d97706;display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:700;">
          ${partialPct > 12 ? `Partial (${partialCount})` : ""}
        </div>
        <div style="width:${noPct}%;background:#dc2626;display:flex;align-items:center;justify-content:center;color:white;font-size:10px;font-weight:700;">
          ${noPct > 12 ? `No (${noCount})` : ""}
        </div>
      </div>
      <div style="display:flex;gap:20px;">
        ${[
          { l:"Yes",     c:"#059669", v:yesCount     },
          { l:"Partial", c:"#d97706", v:partialCount },
          { l:"No",      c:"#dc2626", v:noCount      },
        ].map(s => `
          <div style="display:flex;align-items:center;gap:7px;">
            <div style="width:10px;height:10px;border-radius:2px;background:${s.c};"></div>
            <span style="font-size:10.5px;color:#374151;">${s.l}: <strong>${s.v}</strong> (${Math.round(s.v/totalAns*100)}%)</span>
          </div>`).join("")}
      </div>
    </div>

    <!-- Recommendations -->
    <div style="margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
        <div style="width:4px;height:20px;background:#c9a227;border-radius:2px;"></div>
        <h2 style="font-size:13px;font-weight:800;color:#111827;text-transform:uppercase;letter-spacing:0.1em;">Recommendations</h2>
      </div>
      ${recsHtml}
    </div>
  </div>

  <div style="padding:12px 48px;border-top:1px solid #f3f4f6;display:flex;justify-content:space-between;align-items:center;">
    <span style="font-size:8.5px;color:#9ca3af;">CRAM Consulting · Confidential</span>
    <span style="font-size:8.5px;color:#9ca3af;">Page 2</span>
  </div>
</div>


<!-- ═══════════════════════════════════════════════════════
     PAGE 3 — DETAILED RESPONSES
═══════════════════════════════════════════════════════ -->
<div class="page-break" style="min-height:297mm;padding:0;">

  <!-- Page header -->
  <div style="background:#0a2e1a;padding:16px 48px;display:flex;align-items:center;justify-content:space-between;">
    ${logoHtml}
    <div style="font-size:9px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.12em;">Detailed Responses · ${user.fullName}</div>
  </div>

  <div style="padding:32px 48px;">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px;">
      <div style="width:4px;height:20px;background:#1a6b3c;border-radius:2px;"></div>
      <h2 style="font-size:13px;font-weight:800;color:#111827;text-transform:uppercase;letter-spacing:0.1em;">Detailed Responses</h2>
    </div>
    ${detailedAnswersHtml}
  </div>

  <!-- Final footer -->
  <div style="background:#0a2e1a;padding:20px 48px;margin-top:auto;">
    <div style="display:flex;justify-content:space-between;align-items:center;">
      <div>
        ${logoHtml}
        <div style="font-size:8px;color:rgba(255,255,255,0.3);margin-top:6px;">gm@cram.sa · +966 54 958 4775 · cram.sa</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:8.5px;color:rgba(255,255,255,0.3);">Generated ${generatedDate}</div>
        <div style="font-size:8.5px;color:rgba(255,255,255,0.3);margin-top:2px;">Strictly Confidential · Page 3</div>
      </div>
    </div>
  </div>
</div>

</body>
</html>`;

    // ── Launch Puppeteer ──────────────────────────────────────────────────────
    let browser;
    try {
      // Vercel: use @sparticuz/chromium
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const chromium = require("@sparticuz/chromium");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const puppeteer = require("puppeteer-core");
      browser = await puppeteer.launch({
        args:            chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath:  await chromium.executablePath(),
        headless:        chromium.headless,
      });
    } catch {
      // Local dev: use puppeteer
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const puppeteer = require("puppeteer");
      browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    }

    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format:          "A4",
      printBackground: true,
      margin:          { top: "0", right: "0", bottom: "0", left: "0" },
    });
    await browser.close();

    const filename = `CRAM-Governance-Report-${user.fullName.replace(/\s+/g, "-")}-A1.pdf`;

    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control":       "no-store",
      },
    });

  } catch (err) {
    console.error("[GET /api/admin/report-pdf]", err);
    return NextResponse.json({ error: "Failed to generate PDF", details: String(err) }, { status: 500 });
  }
}