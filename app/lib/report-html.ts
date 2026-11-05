import { SECTIONS } from "./institutional-content";

export interface ReportSource {
  user: { fullName: string; email: string; companyName: string | null };
  submission: {
    totalScore: number;
    maxScore: number | null;
    submittedAt: Date;
    rawPayload: unknown;
    answers: {
      selectedValue: number;
      question: {
        categoryOrder: number;
        titleEn: string;
        titleAr: string;
        questionEn: string;
        questionAr: string;
      };
    }[];
  };
  type: "assessment1" | "assessment2";
}
export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
function displayValue(value: unknown): string {
  if (
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && !value.length)
  )
    return '<span style="color:#87917e">Not provided</span>';
  if (Array.isArray(value))
    return value
      .map(
        (row, i) =>
          `<div class="entry"><b>Entry ${i + 1}</b>${Object.entries(
            row as Record<string, unknown>,
          )
            .map(
              ([key, val]) =>
                `<p><span>${escapeHtml(key)}:</span> ${escapeHtml(val)}</p>`,
            )
            .join("")}</div>`,
      )
      .join("");
  return escapeHtml(value);
}

export function reportHtml(
  { user, submission, type }: ReportSource,
  fonts = "",
) {
  const first = type === "assessment1";
  const pct = submission.maxScore
    ? Math.round((submission.totalScore / submission.maxScore) * 100)
    : 0;
  const payload = (submission.rawPayload ?? {}) as Record<string, unknown>;
  const groups = [
    ...new Set(submission.answers.map((a) => a.question.categoryOrder)),
  ].map((order) =>
    submission.answers.filter((a) => a.question.categoryOrder === order),
  );
  const title = first ? "Governance assessment" : "Institutional profile";
  const domains = first
    ? `<h2>Performance by domain</h2><table class="domains"><thead><tr><th>Domain</th><th>Score</th><th>Points</th></tr></thead><tbody>${groups
        .map((group) => {
          const score = group.reduce((sum, a) => sum + a.selectedValue, 0);
          const max = group.length * 10;
          return `<tr><td>${escapeHtml(group[0].question.titleEn)}<div class="bar"><i style="width:${(score / max) * 100}%"></i></div></td><td>${Math.round((score / max) * 100)}%</td><td>${score}/${max}</td></tr>`;
        })
        .join("")}</tbody></table>`
    : "";
  const details = first
    ? groups
        .map(
          (group) =>
            `<section class="detail"><h3>${escapeHtml(group[0].question.titleEn)}</h3>${group.map((a) => `<div class="response"><div class="label">${escapeHtml(a.question.questionEn)}<small dir="rtl">${escapeHtml(a.question.questionAr)}</small></div><div class="value"><span class="badge">${a.selectedValue === 10 ? "Yes" : a.selectedValue === 5 ? "Partial" : "No"} · ${a.selectedValue}/10</span></div></div>`).join("")}</section>`,
        )
        .join("")
    : SECTIONS.map(
        (s) =>
          `<section class="detail"><h3>${escapeHtml(s.titleEn)} <small dir="rtl">${escapeHtml(s.titleAr)}</small></h3>${s.fields.map((f) => `<div class="response"><div class="label">${escapeHtml(f.labelEn)}<small dir="rtl">${escapeHtml(f.labelAr)}</small></div><div class="value">${displayValue(payload[f.key])}</div></div>`).join("")}</section>`,
      ).join("");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>CRAM ${title}</title><style>${fonts}
  *{box-sizing:border-box}body{margin:0;background:#fff;color:#203c32;font:12px "CRAM Sans",Arial,sans-serif;line-height:1.6}h1,h2,h3,p{margin:0}h1,h2,h3{line-height:1.25}h2{break-after:avoid;font-size:22px;font-weight:500;margin:28px 0 18px}h3{font-size:15px;font-weight:600;padding:14px 18px;background:#eef2e7;break-after:avoid}p{color:#66715e}.cover{padding:34px;background:#214637;color:#f4f3e7;border-radius:5px;print-color-adjust:exact}.brand{font-size:22px;font-weight:700}.cover-top{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #ffffff30;padding-bottom:18px;margin-bottom:30px}.eyebrow{font-size:9px;letter-spacing:1.5px;color:#c7c294}.cover h1{font-size:38px;font-weight:500;line-height:1.15;margin-bottom:12px}.cover>p{font-size:16px;color:#c7c9a6;font-family:Georgia,serif;font-style:italic}.client{display:flex;justify-content:space-between;gap:20px;border-top:1px solid #ffffff30;margin-top:30px;padding-top:20px}.client b{font-size:17px;font-weight:500}.client p{font-size:10px;color:#c4d0ba}.client small{display:block;font-size:8px;color:#b5c4a9;letter-spacing:1px}.summary{display:flex;gap:30px;padding:28px 0;border-bottom:1px solid #dce2d5;break-inside:avoid}.summary>div:first-child{flex:1}.summary h2{margin:6px 0 12px}.summary p{font-size:11px}.score{width:170px;background:#edf2e5;padding:20px;text-align:center;border-radius:5px}.score b{display:block;font-size:37px;font-weight:500;line-height:1.2}.score span{font-size:8px;color:#66715e}.score small{display:block;font-size:10px;margin-top:5px}.domains{break-inside:avoid;width:100%;border-collapse:collapse;margin-bottom:28px}.domains th{text-align:left;font-size:9px;color:#66715e;text-transform:uppercase;background:#f2f4ed;padding:10px 14px}.domains td{padding:12px 14px;border-bottom:1px solid #e6eadf;font-size:11px}.domains tr{break-inside:avoid}.bar{height:4px;background:#dce3d3;margin-top:8px;width:95%}.bar i{display:block;height:4px;background:#4e7050}.detail{border:1px solid #dce2d5;border-radius:4px;margin:18px 0;overflow:hidden}.response{display:flex;gap:25px;justify-content:space-between;padding:14px 18px;border-top:1px solid #e6eadf;break-inside:avoid}.label{font-size:11px;flex:1}.label small,h3 small{display:block;font-family:"CRAM Arabic",Arial,sans-serif;font-size:15px;color:#68755f;text-align:left;font-weight:400}.value{font-size:11px;flex:1;white-space:pre-wrap;overflow-wrap:anywhere}.badge{display:inline-block;background:#edf2e5;border:1px solid #d7e0cc;border-radius:3px;padding:3px 8px;font-size:10px}.entry{background:#f5f7f0;border-radius:4px;padding:10px;margin-bottom:8px;break-inside:avoid}.entry b{font-size:10px}.entry p{margin-top:4px}.entry span{color:#89917f}.footnote{font-size:9px;color:#7b8771;border-top:1px solid #dce2d5;padding-top:18px;margin-top:30px;display:flex;justify-content:space-between;gap:15px}.callout{background:#f6f0df;border-left:2px solid #a2854b;padding:15px 18px;margin-top:24px;font-size:11px}@page{size:A4;margin:16mm 14mm 20mm}thead{display:table-header-group}footer{break-inside:avoid}
  </style></head><body><header class="cover"><div class="cover-top"><span class="brand">CRAM.</span><span class="eyebrow">PRIVATE & CONFIDENTIAL</span></div><h1>${title}</h1><p>${first ? "A foundation for progress." : "The business, in detail."}</p><div class="client"><div><b>${escapeHtml(user.companyName || user.fullName)}</b><p>${escapeHtml(user.fullName)} · ${escapeHtml(user.email)}</p></div><div><small>SUBMITTED</small>${new Date(submission.submittedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</div></div></header><section class="summary"><div><span style="color:#a2854b" class="eyebrow">EXECUTIVE SUMMARY</span><h2>${first ? "Governance at a glance" : "A complete business perspective"}</h2><p>${first ? "This report reflects the client’s self-assessment of current governance practices. Use these results to guide follow-up and identify practical improvements." : "This profile presents the information submitted by the client across eight business areas. Review it alongside the governance assessment to define the scope of work and financial proposal."}</p></div><div class="score"><b>${first ? pct + "%" : "8"}</b><span>${first ? "SELF-ASSESSED GOVERNANCE SCORE" : "BUSINESS AREAS COVERED"}</span><small>${first ? submission.totalScore + " of " + submission.maxScore + " points" : "Institutional assessment"}</small></div></section>${domains}${!first && payload._proposalRequestedAt ? `<div class="callout"><b>Financial proposal requested</b><br>Request saved: ${escapeHtml(new Date(String(payload._proposalRequestedAt)).toLocaleDateString("en-GB"))}.</div>` : ""}<h2>${first ? "Submitted responses" : "Submitted business information"}</h2>${details}<footer class="footnote"><b>CRAM Consulting</b><span>Self-reported client information · Confidential</span><span>gm@cram.sa</span></footer></body></html>`;
}
