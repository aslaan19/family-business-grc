// app/api/admin/send-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

/**
 * POST /api/admin/send-report
 * Body: { userId: string, assessmentType: "assessment1" | "assessment2" }
 *
 * Sends the governance report to the user's email.
 * Uses Resend (https://resend.com) — install with: npm install resend
 * Set RESEND_API_KEY in your .env
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, assessmentType } = await req.json();

    if (!userId || !assessmentType) {
      return NextResponse.json({ error: "userId and assessmentType are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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
    const catBreakdown: Record<string, { score: number; max: number; pct: number }> = {};
    submission.answers.forEach((a: { question: { categoryKey: string; }; selectedValue: number; }) => {
      const k = a.question?.categoryKey ?? "unknown";
      if (!catBreakdown[k]) catBreakdown[k] = { score: 0, max: 0, pct: 0 };
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
    const scoreColor = pct >= 80 ? "#059669"   : pct >= 60 ? "#0284c7" : pct >= 40 ? "#d97706" : "#dc2626";

    // ── Build HTML email ──────────────────────────────────────────────────────
    const categoriesHtml = Object.entries(catBreakdown)
      .sort(([, a], [, b]) => b.pct - a.pct)
      .map(([key, val]) => {
        const catColor = val.pct >= 70 ? "#059669" : val.pct >= 50 ? "#d97706" : "#dc2626";
        return `
          <tr>
            <td style="padding:10px 16px;font-size:13px;color:#374151;text-transform:capitalize;border-bottom:1px solid #f3f4f6;">
              ${key.replace(/_/g, " ")}
            </td>
            <td style="padding:10px 16px;text-align:center;border-bottom:1px solid #f3f4f6;">
              <span style="font-size:12px;font-weight:700;color:${catColor};background:${catColor}15;padding:3px 10px;border-radius:20px;">
                ${val.pct}%
              </span>
            </td>
            <td style="padding:10px 16px;border-bottom:1px solid #f3f4f6;">
              <div style="height:6px;background:#e5e7eb;border-radius:3px;overflow:hidden;">
                <div style="height:100%;width:${val.pct}%;background:${catColor};border-radius:3px;"></div>
              </div>
            </td>
          </tr>
        `;
      }).join("");

    const htmlEmail = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <div style="max-width:620px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#0a2e1a,#0f3d22);border-radius:16px 16px 0 0;padding:40px 40px 32px;text-align:center;position:relative;overflow:hidden;">
      <div style="font-size:10px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#d4b347;margin-bottom:16px;">
        CRAM Consulting · Governance Assessment
      </div>
      <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;line-height:1.2;">
        Assessment 1 Report
      </h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:14px;">
        ${user.fullName}${user.companyName ? ` · ${user.companyName}` : ""}
      </p>

      <!-- Score circle -->
      <div style="display:inline-block;margin-top:24px;width:88px;height:88px;border-radius:50%;background:rgba(255,255,255,0.08);border:3px solid ${scoreColor}50;line-height:88px;text-align:center;">
        <span style="font-size:24px;font-weight:900;color:${scoreColor};">${pct}%</span>
      </div>
      <p style="margin:8px 0 0;font-size:12px;font-weight:700;color:${scoreColor};text-transform:uppercase;letter-spacing:0.1em;">
        ${scoreLabel}
      </p>
    </div>

    <!-- Score bar -->
    <div style="background:#fff;padding:24px 40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
        <span style="font-size:12px;color:#6b7280;font-weight:600;">Total Score</span>
        <span style="font-size:12px;color:#374151;font-weight:700;">${totalScore} / ${maxScore} points</span>
      </div>
      <div style="height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#1a6b3c,#c9a227);border-radius:4px;"></div>
      </div>
    </div>

    <!-- Category Table -->
    <div style="background:#fff;padding:0 40px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
      <h2 style="font-size:13px;font-weight:800;color:#111827;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 16px;padding-top:24px;border-top:1px solid #f3f4f6;">
        Performance by Domain
      </h2>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px 16px;text-align:left;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Domain</th>
            <th style="padding:8px 16px;text-align:center;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Score</th>
            <th style="padding:8px 16px;font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Progress</th>
          </tr>
        </thead>
        <tbody>${categoriesHtml}</tbody>
      </table>
    </div>

    <!-- Message -->
    <div style="background:#fff;padding:24px 40px 32px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;border-bottom:1px solid #e5e7eb;border-radius:0 0 16px 16px;">
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;">
        <p style="margin:0;font-size:14px;color:#065f46;line-height:1.6;">
          Dear <strong>${user.fullName}</strong>,<br><br>
          Thank you for completing the CRAM Governance Assessment. Our senior consultants have reviewed your responses and will be in touch with a comprehensive, personalised governance proposal tailored to your organisation's needs.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align:center;padding:24px;color:#9ca3af;font-size:11px;">
      CRAM Consulting · gm@cram.sa · cram.sa<br>
      This report is confidential and intended solely for the recipient.
    </div>
  </div>
</body>
</html>
    `;

    // ── Send via Resend ───────────────────────────────────────────────────────
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    if (!RESEND_API_KEY) {
      console.warn("[send-report] RESEND_API_KEY not set — skipping email send");
      return NextResponse.json({ success: true, warning: "Email not sent: RESEND_API_KEY not configured" });
    }

    const emailRes = await fetch("https://api.resend.com/emails", {
      method:  "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:    "CRAM Consulting <reports@cram.sa>",
        to:      [user.email],
        subject: `Your CRAM Governance Report — ${scoreLabel} (${pct}%)`,
        html:    htmlEmail,
      }),
    });

    if (!emailRes.ok) {
      const errData = await emailRes.json();
      console.error("[send-report] Resend error:", errData);
      return NextResponse.json({ error: "Failed to send email", details: errData }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/admin/send-report]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}