// app/api/admin/report-pdf/route.ts — EXECUTIVE PREMIUM EDITION
import { NextRequest, NextResponse } from "next/server";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Question {
  categoryKey: string;
  categoryOrder: number;
  questionOrder: number;
  questionEn: string;
}

interface Answer {
  selectedValue: number;
  selectedLabel: string;
  question: Question;
}

interface Submission {
  submittedAt: Date;
  totalScore: number;
  maxScore: number | null;
  answers: Answer[];
}

interface CategoryBreakdown {
  score: number;
  max: number;
  pct: number;
}

// ── Executive Design Tokens ───────────────────────────────────────────────────

const EXEC = {
  forest: {
    950: "#021008",
    900: "#041A0F",
    850: "#062616",
    800: "#0A3320",
    700: "#0F4A2D",
    600: "#15613A",
    500: "#1B7847",
  },
  cream: {
    50: "#FEFCF8",
    100: "#FBF8F1",
    200: "#F7F2E7",
    300: "#F0E9D8",
    400: "#E8DDC6",
  },
  gold: {
    500: "#B8891C",
    400: "#D4A024",
    300: "#E8B93D",
  },
  charcoal: {
    900: "#111827",
    700: "#374151",
    500: "#6B7280",
    400: "#9CA3AF",
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildCategoryBreakdown(answers: Answer[]): Record<string, CategoryBreakdown> {
  const breakdown: Record<string, CategoryBreakdown> = {};
  for (const a of answers) {
    const key = a.question?.categoryKey ?? "unknown";
    if (!breakdown[key]) breakdown[key] = { score: 0, max: 0, pct: 0 };
    breakdown[key].score += a.selectedValue;
    breakdown[key].max += 10;
  }
  for (const key of Object.keys(breakdown)) {
    const b = breakdown[key];
    b.pct = b.max > 0 ? Math.round((b.score / b.max) * 100) : 0;
  }
  return breakdown;
}

function scoreLabel(pct: number): string {
  if (pct >= 80) return "Excellent";
  if (pct >= 60) return "Good";
  if (pct >= 40) return "Average";
  return "Needs Improvement";
}

function scoreColor(pct: number): string {
  if (pct >= 80) return EXEC.forest[500];
  if (pct >= 60) return EXEC.forest[600];
  if (pct >= 40) return EXEC.gold[500];
  return "#DC2626";
}

function categoryColor(pct: number): string {
  if (pct >= 70) return EXEC.forest[500];
  if (pct >= 50) return EXEC.gold[500];
  return "#DC2626";
}

function answerColor(label: string): string {
  if (label === "yes") return EXEC.forest[500];
  if (label === "partial") return EXEC.gold[500];
  return "#DC2626";
}

function answerLabel(label: string): string {
  if (label === "yes") return "✓ Compliant";
  if (label === "partial") return "◐ Partial";
  return "✗ Gap";
}

// ── SVG: Executive Donut Gauge ────────────────────────────────────────────────

function buildDonutSVG(pct: number): string {
  const r = 65, sw = 12, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const sc = scoreColor(pct);
  const sl = scoreLabel(pct);

  return `
<svg viewBox="0 0 180 180" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="execDonutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${EXEC.gold[400]}"/>
      <stop offset="50%" stop-color="${EXEC.cream[200]}"/>
      <stop offset="100%" stop-color="${EXEC.gold[400]}"/>
    </linearGradient>
    <filter id="donutGlow">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  
  <!-- Outer decorative ring -->
  <circle cx="90" cy="90" r="82" fill="none" stroke="${EXEC.gold[400]}" stroke-width="0.5" opacity="0.3"/>
  <circle cx="90" cy="90" r="86" fill="none" stroke="${EXEC.gold[400]}" stroke-width="0.25" opacity="0.2"/>
  
  <!-- Track -->
  <circle cx="90" cy="90" r="${r}" fill="none" stroke="${EXEC.forest[800]}" stroke-width="${sw}"/>
  
  <!-- Progress arc -->
  <circle cx="90" cy="90" r="${r}" fill="none" stroke="url(#execDonutGrad)" stroke-width="${sw}"
    stroke-linecap="round" stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}"
    transform="rotate(-90 90 90)" filter="url(#donutGlow)"/>
  
  <!-- Tick marks -->
  ${[0, 25, 50, 75, 100].map(t => {
    const angle = (t / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = 90 + (r - 8) * Math.cos(angle);
    const y1 = 90 + (r - 8) * Math.sin(angle);
    const x2 = 90 + (r + 2) * Math.cos(angle);
    const y2 = 90 + (r + 2) * Math.sin(angle);
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${EXEC.gold[400]}" stroke-width="1.5" opacity="0.5"/>`;
  }).join("")}
  
  <!-- Center content -->
  <text x="90" y="82" text-anchor="middle" font-size="36" font-weight="900"
    font-family="Georgia, serif" fill="${EXEC.cream[100]}">${pct}%</text>
  
  <!-- Label badge -->
  <rect x="50" y="98" width="80" height="18" rx="9" fill="${EXEC.gold[400]}25"/>
  <text x="90" y="111" text-anchor="middle" font-size="8" font-weight="800"
    font-family="Arial, sans-serif" fill="${EXEC.gold[400]}" letter-spacing="2">★ ${sl.toUpperCase()}</text>
</svg>`;
}

// ── SVG: Executive Pie Chart ──────────────────────────────────────────────────

function buildPieSVG(yes: number, partial: number, no: number, total: number): string {
  const segs = [
    { v: yes, c: EXEC.forest[500], l: "Compliant" },
    { v: partial, c: EXEC.gold[500], l: "Partial" },
    { v: no, c: "#DC2626", l: "Gap" },
  ];
  const cx = 70, cy = 70, r = 52, innerR = 28;
  let cumAngle = -90;

  const slicePaths = segs.map(seg => {
    const sliceAngle = (seg.v / total) * 360;
    const startDeg = cumAngle;
    const endDeg = cumAngle + sliceAngle;
    cumAngle = endDeg;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startDeg));
    const y1 = cy + r * Math.sin(toRad(startDeg));
    const x2 = cx + r * Math.cos(toRad(endDeg));
    const y2 = cy + r * Math.sin(toRad(endDeg));
    const xi1 = cx + innerR * Math.cos(toRad(startDeg));
    const yi1 = cy + innerR * Math.sin(toRad(startDeg));
    const xi2 = cx + innerR * Math.cos(toRad(endDeg));
    const yi2 = cy + innerR * Math.sin(toRad(endDeg));
    const large = sliceAngle > 180 ? 1 : 0;
    const d = `M ${xi1.toFixed(1)} ${yi1.toFixed(1)} L ${x1.toFixed(1)} ${y1.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)} L ${xi2.toFixed(1)} ${yi2.toFixed(1)} A ${innerR} ${innerR} 0 ${large} 0 ${xi1.toFixed(1)} ${yi1.toFixed(1)} Z`;
    const pct = Math.round((seg.v / total) * 100);
    return { ...seg, d, pct };
  }).filter(s => s.v > 0);

  const legend = segs.map((seg, i) => {
    const pct = Math.round((seg.v / total) * 100);
    return `
      <rect x="150" y="${28 + i * 30}" width="12" height="12" rx="3" fill="${seg.c}"/>
      <text x="168" y="${38 + i * 30}" font-size="10" font-family="Arial" fill="${EXEC.charcoal[700]}" font-weight="700">${seg.l}</text>
      <text x="168" y="${50 + i * 30}" font-size="9" font-family="Arial" fill="${EXEC.charcoal[500]}">${seg.v} responses (${pct}%)</text>
    `;
  }).join("");

  return `
<svg viewBox="0 0 260 140" width="260" height="140" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="pieShadow">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.2"/>
    </filter>
  </defs>
  ${slicePaths.map(s => `<path d="${s.d}" fill="${s.c}" filter="url(#pieShadow)"/>`).join("")}
  <circle cx="${cx}" cy="${cy}" r="${innerR - 1}" fill="${EXEC.cream[50]}"/>
  <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="14" font-weight="900" font-family="Arial" fill="${EXEC.forest[800]}">${total}</text>
  <text x="${cx}" y="${cy + 10}" text-anchor="middle" font-size="7" font-family="Arial" fill="${EXEC.charcoal[500]}" letter-spacing="1">TOTAL</text>
  ${legend}
</svg>`;
}

// ── SVG: Executive Radar Chart ────────────────────────────────────────────────


function buildRadarSVG(sortedCats: [string, CategoryBreakdown][]): string {
  const n = sortedCats.length;
  const R = 70, cx = 90, cy = 90;
  const step = (2 * Math.PI) / n;
  const start = -Math.PI / 2;
  const polar = (r: number, i: number) => ({
    x: cx + r * Math.cos(start + i * step),
    y: cy + r * Math.sin(start + i * step),
  });

  // Short abbreviations for domains
  const abbreviations = ["BG", "RM", "CO", "IA", "TR", "ET"];

  const rings = [25, 50, 75, 100].map(rv => {
    const pts = sortedCats.map((_, i) => { const p = polar((rv / 100) * R, i); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(" ");
    const stroke = rv === 100 ? EXEC.gold[400] : EXEC.forest[700];
    const sw = rv === 100 ? "2" : "1";
    const dash = rv !== 100 ? 'stroke-dasharray="3 6"' : "";
    const opacity = rv === 100 ? "0.6" : "0.3";
    return `<polygon points="${pts}" fill="none" stroke="${stroke}" stroke-width="${sw}" ${dash} opacity="${opacity}"/>`;
  }).join("");

  const spokes = sortedCats.map((_, i) => {
    const p = polar(R, i);
    return `<line x1="${cx}" y1="${cy}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="${EXEC.forest[700]}" stroke-width="1" stroke-dasharray="2 4" opacity="0.4"/>`;
  }).join("");

  const dataPts = sortedCats.map(([, val], i) => polar((val.pct / 100) * R, i));
  const polyPath = dataPts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") + " Z";

  // Data points with abbreviation labels inside
  const dots = dataPts.map((p, i) => {
    const abbr = abbreviations[i] || (i + 1).toString();
    return `
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="12" fill="${EXEC.forest[800]}" stroke="${EXEC.gold[400]}" stroke-width="2"/>
      <text x="${p.x.toFixed(1)}" y="${(p.y + 3).toFixed(1)}" text-anchor="middle" font-size="7" font-weight="900" fill="${EXEC.cream[100]}" font-family="Arial">${abbr}</text>
    `;
  }).join("");

  // Center decoration
  const center = `
    <circle cx="${cx}" cy="${cy}" r="8" fill="${EXEC.forest[700]}" stroke="${EXEC.gold[400]}" stroke-width="2" opacity="0.8"/>
    <circle cx="${cx}" cy="${cy}" r="3" fill="${EXEC.gold[400]}"/>
  `;

  return `
<svg viewBox="0 0 180 180" width="180" height="180" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="execRadarFill" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${EXEC.gold[400]}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${EXEC.forest[600]}" stop-opacity="0.15"/>
    </linearGradient>
    <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${EXEC.gold[300]}"/>
      <stop offset="50%" stop-color="${EXEC.gold[400]}"/>
      <stop offset="100%" stop-color="${EXEC.gold[500]}"/>
    </linearGradient>
    <filter id="radarGlow">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  ${rings}${spokes}
  <path d="${polyPath}" fill="url(#execRadarFill)" stroke="url(#radarStroke)" stroke-width="3" stroke-linejoin="round" filter="url(#radarGlow)"/>
  ${dots}${center}
</svg>`;
}
// ── Executive Horizontal Bars HTML ────────────────────────────────────────────

function buildBarsHTML(sortedCats: [string, CategoryBreakdown][]): string {
  const benchmark = 70;
  return sortedCats.map(([key, val], i) => {
    const c = categoryColor(val.pct);
    const sl = scoreLabel(val.pct);
    const isTop = i === 0;
    return `
      <div style="margin-bottom:18px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:24px;height:24px;border-radius:8px;background:${isTop ? `linear-gradient(135deg, ${EXEC.gold[500]}, ${EXEC.gold[400]})` : EXEC.forest[800]};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:900;color:${isTop ? EXEC.forest[900] : EXEC.cream[200]};${isTop ? `box-shadow:0 2px 8px ${EXEC.gold[400]}50;` : ""}">${i + 1}</div>
            <span style="font-size:12px;font-weight:800;color:${EXEC.charcoal[900]};text-transform:capitalize;">${key.replace(/_/g, " ")}</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:9px;font-weight:700;color:${c};background:${c}20;padding:3px 10px;border-radius:12px;border:1px solid ${c}40;">${sl}</span>
            <span style="font-size:14px;font-weight:900;color:${c};">${val.pct}%</span>
          </div>
        </div>
        <div style="position:relative;height:10px;background:${EXEC.cream[300]};border-radius:5px;overflow:visible;">
          <div style="height:100%;width:${val.pct}%;background:linear-gradient(90deg,${EXEC.forest[700]},${c});border-radius:5px;box-shadow:0 2px 8px ${c}40;"></div>
          <div style="position:absolute;top:-2px;bottom:-2px;width:2px;background:${EXEC.gold[400]};left:${benchmark}%;border-radius:1px;"></div>
          <div style="position:absolute;top:-18px;left:${benchmark}%;transform:translateX(-50%);font-size:7px;font-weight:800;color:${EXEC.cream[50]};background:${EXEC.gold[400]};padding:2px 6px;border-radius:4px;">70%</div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:4px;">
          <span style="font-size:9px;color:${EXEC.charcoal[500]};">${val.score}/${val.max} pts</span>
          <span style="font-size:9px;color:${EXEC.charcoal[400]};">Industry benchmark: 70%</span>
        </div>
      </div>`;
  }).join("");
}

// ── Detailed Answers HTML ─────────────────────────────────────────────────────

function buildAnswersHtml(submission: Submission, breakdown: Record<string, CategoryBreakdown>): string {
  const grouped = submission.answers.reduce<Record<string, Answer[]>>((acc, a) => {
    const key = a.question?.categoryKey ?? "unknown";
    (acc[key] ??= []).push(a);
    return acc;
  }, {});

  return Object.entries(grouped)
    .sort(([ka], [kb]) => {
      const oa = submission.answers.find(a => a.question?.categoryKey === ka)?.question?.categoryOrder ?? 0;
      const ob = submission.answers.find(a => a.question?.categoryKey === kb)?.question?.categoryOrder ?? 0;
      return oa - ob;
    })
    .map(([key, answers]) => {
      const bd = breakdown[key];
      const cc = bd ? categoryColor(bd.pct) : EXEC.charcoal[500];
      const catYes = answers.filter(a => a.selectedLabel === "yes").length;
      const catNo = answers.filter(a => a.selectedLabel === "no").length;

      const rows = [...answers]
        .sort((a, b) => a.question.questionOrder - b.question.questionOrder)
        .map(a => {
          const ac = answerColor(a.selectedLabel);
          return `
            <div style="padding:14px 24px;border-top:1px solid ${EXEC.cream[300]};display:flex;justify-content:space-between;gap:20px;align-items:flex-start;">
              <p style="margin:0;font-size:11px;color:${EXEC.charcoal[700]};line-height:1.7;flex:1;">${a.question.questionEn}</p>
              <span style="font-size:9px;font-weight:800;color:${ac};background:${ac}15;padding:5px 12px;border-radius:20px;white-space:nowrap;border:1px solid ${ac}35;">
                ${answerLabel(a.selectedLabel)} · +${a.selectedValue}
              </span>
            </div>`;
        }).join("");

      return `
        <div style="margin-bottom:28px;border:1px solid ${EXEC.cream[400]};border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
          <div style="background:linear-gradient(90deg,${EXEC.cream[200]},${EXEC.cream[50]});padding:18px 24px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid ${EXEC.cream[300]};">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,${EXEC.forest[700]},${EXEC.gold[500]});display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:900;color:white;">${answers[0]?.question.categoryOrder}</div>
              <div>
                <span style="font-size:14px;font-weight:800;color:${EXEC.charcoal[900]};text-transform:capitalize;">${key.replace(/_/g, " ")}</span>
                <div style="margin-top:4px;font-size:10px;">
                  <span style="color:${EXEC.forest[500]};font-weight:700;">${catYes} compliant</span>
                  <span style="color:${EXEC.charcoal[400]};margin:0 8px;">·</span>
                  <span style="color:#DC2626;font-weight:700;">${catNo} gaps</span>
                </div>
              </div>
            </div>
            ${bd ? `
              <div style="display:flex;align-items:center;gap:14px;">
                <div style="width:100px;height:6px;background:${EXEC.cream[300]};border-radius:3px;overflow:hidden;">
                  <div style="height:100%;width:${bd.pct}%;background:${cc};border-radius:3px;"></div>
                </div>
                <span style="font-size:12px;font-weight:900;color:${cc};background:${cc}15;padding:4px 12px;border-radius:20px;border:1px solid ${cc}35;">${bd.pct}%</span>
              </div>` : ""}
          </div>
          ${rows}
        </div>`;
    }).join("");
}

// ── Executive Full HTML ───────────────────────────────────────────────────────

function buildHtml(
  user: { fullName: string; companyName?: string | null },
  submission: Submission,
  breakdown: Record<string, CategoryBreakdown>,
  sortedCats: [string, CategoryBreakdown][],
  radarSVG: string,
  donutSVG: string,
  pieSVG: string,
): string {
  const totalScore = submission.totalScore;
  const maxScore = submission.maxScore ?? submission.answers.length * 10;
  const pct = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const label = scoreLabel(pct);
  const color = scoreColor(pct);
  const n = sortedCats.length;

  const yes = submission.answers.filter(a => a.selectedLabel === "yes").length;
  const partial = submission.answers.filter(a => a.selectedLabel === "partial").length;
  const no = submission.answers.filter(a => a.selectedLabel === "no").length;

  const strengths = sortedCats.filter(([, v]) => v.pct >= 70);
  const weaknesses = sortedCats.filter(([, v]) => v.pct < 50);

  const submittedDate = new Date(submission.submittedAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const generatedDate = new Date().toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const strengthsHtml = strengths.length === 0
    ? `<p style="font-size:11px;color:${EXEC.charcoal[500]};">No domains above 70% threshold yet</p>`
    : strengths.map(([k, v]) => `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="width:16px;height:16px;border-radius:50%;background:${EXEC.forest[500]}20;display:flex;align-items:center;justify-content:center;font-size:10px;color:${EXEC.forest[500]};">✓</div>
          <span style="font-size:11px;color:${EXEC.charcoal[700]};font-weight:600;text-transform:capitalize;flex:1;">${k.replace(/_/g, " ")}</span>
          <span style="font-size:11px;font-weight:900;color:${EXEC.forest[500]};">${v.pct}%</span>
        </div>`).join("");

  const weaknessesHtml = weaknesses.length === 0
    ? `<p style="font-size:11px;color:${EXEC.charcoal[500]};">All domains above 50% threshold</p>`
    : weaknesses.map(([k, v]) => `
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
          <div style="width:16px;height:16px;border-radius:50%;background:#DC262620;display:flex;align-items:center;justify-content:center;font-size:10px;color:#DC2626;">!</div>
          <span style="font-size:11px;color:${EXEC.charcoal[700]};font-weight:600;text-transform:capitalize;flex:1;">${k.replace(/_/g, " ")}</span>
          <span style="font-size:11px;font-weight:900;color:#DC2626;">${v.pct}%</span>
        </div>`).join("");

  const recommendationsHtml = sortedCats.filter(([, v]) => v.pct < 70).slice(0, 5).map(([key, val], i) => {
    const priority = i === 0 ? "CRITICAL" : i === 1 ? "HIGH" : i === 2 ? "MEDIUM" : "LOW";
    const pColor = i === 0 ? "#DC2626" : i <= 2 ? EXEC.gold[500] : EXEC.forest[600];
    const bgColor = i === 0 ? "#DC262608" : EXEC.cream[100];
    const borderColor = i === 0 ? "#DC262630" : EXEC.cream[400];
    return `
      <div style="display:flex;gap:20px;padding:20px;border-radius:14px;border:1px solid ${borderColor};background:${bgColor};margin-bottom:16px;">
        <div style="display:flex;flex-direction:column;align-items:center;gap:6px;min-width:54px;">
          <div style="width:42px;height:42px;border-radius:12px;background:${i === 0 ? "#DC2626" : i <= 2 ? EXEC.gold[500] : EXEC.forest[600]};display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:900;color:${i <= 2 ? EXEC.forest[900] : "white"};box-shadow:0 4px 12px ${pColor}30;">${i + 1}</div>
          <span style="font-size:7px;font-weight:900;color:${pColor};text-transform:uppercase;letter-spacing:0.12em;">${priority}</span>
        </div>
        <div style="flex:1;">
          <p style="font-size:14px;font-weight:800;color:${EXEC.charcoal[900]};margin:0 0 6px;text-transform:capitalize;">${key.replace(/_/g, " ")} — ${val.pct}%</p>
          <div style="height:5px;background:${EXEC.cream[300]};border-radius:3px;margin-bottom:10px;overflow:hidden;">
            <div style="height:100%;width:${val.pct}%;background:${categoryColor(val.pct)};border-radius:3px;"></div>
          </div>
          <p style="font-size:11px;color:${EXEC.charcoal[400]};margin:0;line-height:1.6;">
            ${val.pct < 40
              ? `Scored ${val.score}/${val.max} pts. Requires immediate structured intervention with a dedicated improvement roadmap and executive oversight.`
              : `Scored ${val.score}/${val.max} pts. Targeted strategic initiatives can bridge this domain to meet the 70%+ industry benchmark.`}
          </p>
        </div>
      </div>`;
  }).join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800;900&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: ${EXEC.charcoal[900]}; background: ${EXEC.cream[50]}; }
    @page { margin: 0; size: A4; }
    h1, h2 { font-family: 'Playfair Display', Georgia, serif; }
  </style>
</head>
<body>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- EXECUTIVE COVER PAGE -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->

<div style="background:linear-gradient(145deg,${EXEC.forest[900]} 0%,${EXEC.forest[850]} 40%,${EXEC.forest[800]} 100%);min-height:380px;padding:48px 56px;position:relative;overflow:hidden;">
  
  <!-- Premium grid pattern -->
  <div style="position:absolute;inset:0;background-image:linear-gradient(${EXEC.gold[400]}20 1px,transparent 1px),linear-gradient(90deg,${EXEC.gold[400]}20 1px,transparent 1px);background-size:60px 60px;opacity:0.1;"></div>
  
  <!-- Radial glow -->
  <div style="position:absolute;right:-100px;top:-100px;width:450px;height:450px;border-radius:50%;background:radial-gradient(circle,${EXEC.gold[400]}12,transparent 60%);"></div>
  
  <!-- Corner decorations -->
  <div style="position:absolute;top:40px;left:40px;">
    <div style="position:absolute;top:0;left:0;width:40px;height:1px;background:${EXEC.gold[400]};"></div>
    <div style="position:absolute;top:0;left:0;width:1px;height:40px;background:${EXEC.gold[400]};"></div>
  </div>
  <div style="position:absolute;bottom:40px;right:40px;">
    <div style="position:absolute;bottom:0;right:0;width:40px;height:1px;background:${EXEC.gold[400]};"></div>
    <div style="position:absolute;bottom:0;right:0;width:1px;height:40px;background:${EXEC.gold[400]};"></div>
  </div>
  
  <!-- Vertical accent lines -->
  <div style="position:absolute;right:180px;top:0;width:1px;height:100%;background:linear-gradient(to bottom,transparent,${EXEC.gold[400]}40,transparent);"></div>

  <div style="position:relative;z-index:1;display:flex;justify-content:space-between;align-items:flex-start;">
    <div style="flex:1;">
      
      <!-- Executive Badge -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:32px;">
        <div style="width:40px;height:40px;border-radius:12px;background:${EXEC.gold[400]}20;border:1px solid ${EXEC.gold[400]}40;display:flex;align-items:center;justify-content:center;">
          <span style="font-size:18px;">🛡</span>
        </div>
        <div>
          <div style="font-size:10px;font-weight:900;letter-spacing:0.3em;text-transform:uppercase;color:${EXEC.gold[400]};">CRAM Consulting</div>
          <div style="font-size:9px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;color:${EXEC.cream[400]};margin-top:2px;">Executive Governance Assessment</div>
        </div>
        <div style="margin-left:16px;padding:4px 12px;border-radius:12px;background:${EXEC.gold[400]}15;border:1px solid ${EXEC.gold[400]}30;">
          <span style="font-size:8px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:${EXEC.gold[400]};">🔒 CONFIDENTIAL</span>
        </div>
      </div>

      <h1 style="font-size:52px;font-weight:700;color:${EXEC.cream[100]};line-height:1;margin-bottom:4px;">
        Governance
      </h1>
      <h1 style="font-size:52px;font-weight:700;color:${EXEC.gold[400]};line-height:1;margin-bottom:32px;">
        Assessment Report
      </h1>

      <!-- Client Info -->
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:8px;">
        <div style="width:1px;height:52px;background:${EXEC.gold[400]}60;"></div>
        <div>
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="font-size:12px;color:${EXEC.cream[400]};">📋</span>
            <p style="font-size:20px;font-weight:700;color:${EXEC.cream[100]};margin:0;">${user.fullName}</p>
          </div>
          ${user.companyName ? `
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:12px;color:${EXEC.cream[300]};">🏢</span>
              <p style="font-size:14px;color:${EXEC.cream[400]};margin:0;">${user.companyName}</p>
            </div>
          ` : ""}
        </div>
      </div>
      
      <div style="display:flex;align-items:center;gap:8px;margin-top:16px;color:${EXEC.cream[400]};">
        <span style="font-size:11px;">📅</span>
        <p style="font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin:0;">Submitted ${submittedDate}</p>
      </div>

      <!-- Premium KPI Strip -->
      <div style="display:flex;gap:16px;margin-top:36px;">
        ${[
          { icon: "🎯", l: "Total Score", v: `${totalScore}/${maxScore}` },
          { icon: "📝", l: "Questions", v: `${submission.answers.length}` },
          { icon: "📊", l: "Domains", v: `${n}` },
          { icon: "🏆", l: "Rating", v: label },
        ].map(s => `
          <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.08);border-radius:14px;padding:16px 20px;text-align:center;min-width:90px;backdrop-filter:blur(4px);">
            <div style="font-size:14px;margin-bottom:6px;">${s.icon}</div>
            <div style="font-size:18px;font-weight:900;color:${EXEC.cream[100]};">${s.v}</div>
            <div style="font-size:8px;font-weight:600;color:${EXEC.cream[300]};text-transform:uppercase;letter-spacing:0.12em;margin-top:4px;">${s.l}</div>
          </div>`).join("")}
      </div>
    </div>

    <!-- Executive Donut -->
    <div style="text-align:center;padding-left:40px;">
      ${donutSVG}
      <p style="font-size:9px;color:${EXEC.cream[300]};letter-spacing:0.18em;text-transform:uppercase;margin-top:12px;">Overall Compliance Score</p>
      <p style="font-size:11px;color:${EXEC.cream[400]};margin-top:4px;">${totalScore} of ${maxScore} points achieved</p>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════════════════════════════════ -->
<!-- PAGE CONTENT -->
<!-- ══════════════════════════════════════════════════════════════════════════ -->

<div style="padding:48px 56px;background:${EXEC.cream[50]};">

  <!-- SECTION: Executive Summary -->
  <div style="margin-bottom:44px;">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:28px;">
      <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,${EXEC.forest[700]},${EXEC.forest[600]});display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px ${EXEC.forest[900]}40;">
        <span style="color:${EXEC.gold[400]};font-size:16px;">📋</span>
      </div>
      <span style="font-size:11px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;color:${EXEC.charcoal[900]};">Executive Summary</span>
      <div style="flex:1;height:1px;background:linear-gradient(90deg,${EXEC.gold[400]}40,transparent);margin-left:12px;"></div>
    </div>

    <div style="display:flex;gap:20px;">
      <!-- Performance Classification Card -->
      <div style="flex:1;border-radius:16px;padding:24px;background:${color}10;border:1px solid ${color}30;">
        <div style="font-size:9px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${color};margin-bottom:8px;">Performance Classification</div>
        <div style="font-size:48px;font-weight:900;color:${color};font-family:'Playfair Display',Georgia,serif;line-height:1;">${label}</div>
        <div style="font-size:14px;font-weight:600;color:${color};margin:8px 0 16px;">${pct}% · ${totalScore}/${maxScore} pts</div>
        <div style="height:8px;background:${color}20;border-radius:4px;overflow:hidden;">
          <div style="height:100%;width:${pct}%;background:${color};border-radius:4px;"></div>
        </div>
        <!-- Answer mini summary -->
        <div style="display:flex;gap:16px;margin-top:20px;padding-top:16px;border-top:1px solid ${color}20;">
          ${[
            { l: "Compliant", c: EXEC.forest[500], v: yes },
            { l: "Partial", c: EXEC.gold[500], v: partial },
            { l: "Gap", c: "#DC2626", v: no },
          ].map(s => `
            <div style="flex:1;text-align:center;">
              <div style="font-size:18px;font-weight:900;color:${s.c};">${s.v}</div>
              <div style="font-size:8px;color:${EXEC.charcoal[500]};text-transform:uppercase;letter-spacing:0.1em;">${s.l}</div>
            </div>`).join("")}
        </div>
      </div>

      <!-- Strengths -->
      <div style="flex:1;border-radius:16px;padding:24px;background:${EXEC.forest[500]}08;border:1px solid ${EXEC.forest[500]}25;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;">
          <span style="font-size:16px;">📈</span>
          <span style="font-size:10px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${EXEC.forest[600]};">Strengths</span>
          <span style="margin-left:auto;font-size:10px;font-weight:900;color:${EXEC.forest[500]};background:${EXEC.forest[500]}20;padding:3px 10px;border-radius:12px;">${strengths.length}</span>
        </div>
        ${strengthsHtml}
      </div>

      <!-- Priority Areas -->
      <div style="flex:1;border-radius:16px;padding:24px;background:${EXEC.gold[500]}08;border:1px solid ${EXEC.gold[500]}25;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px;">
          <span style="font-size:16px;">⚠️</span>
          <span style="font-size:10px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${EXEC.gold[400]};">Priority Areas</span>
          <span style="margin-left:auto;font-size:10px;font-weight:900;color:#DC2626;background:#DC262615;padding:3px 10px;border-radius:12px;">${weaknesses.length}</span>
        </div>
        ${weaknessesHtml}
      </div>
    </div>
  </div>

  <!-- SECTION: Performance Analytics -->
  <div style="margin-bottom:44px;">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:28px;">
      <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,${EXEC.forest[700]},${EXEC.forest[600]});display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px ${EXEC.forest[900]}40;">
        <span style="color:${EXEC.gold[400]};font-size:16px;">📊</span>
      </div>
      <span style="font-size:11px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;color:${EXEC.charcoal[900]};">Performance Analytics</span>
      <div style="flex:1;height:1px;background:linear-gradient(90deg,${EXEC.gold[400]}40,transparent);margin-left:12px;"></div>
    </div>

    <div style="display:flex;gap:20px;">
      <!-- Radar Chart -->
      <div style="flex:0 0 260px;border:1px solid ${EXEC.cream[400]};border-radius:18px;padding:20px;background:${EXEC.cream[100]};">
        <div style="font-size:9px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:${EXEC.charcoal[500]};margin-bottom:16px;">Competency Radar</div>
        ${radarSVG}
      </div>

      <!-- Domain Bars -->
      <div style="flex:1;border:1px solid ${EXEC.cream[400]};border-radius:18px;padding:24px;background:${EXEC.cream[100]};">
        <div style="font-size:9px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:${EXEC.charcoal[500]};margin-bottom:20px;">Domain Benchmark Performance</div>
        ${buildBarsHTML(sortedCats)}
      </div>

      <!-- Pie Chart -->
      <div style="flex:0 0 220px;border:1px solid ${EXEC.cream[400]};border-radius:18px;padding:20px;background:${EXEC.cream[100]};">
        <div style="font-size:9px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:${EXEC.charcoal[500]};margin-bottom:16px;">Answer Distribution</div>
        ${pieSVG}
      </div>
    </div>
  </div>

  <!-- SECTION: Strategic Recommendations -->
  <div style="margin-bottom:44px;">
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:28px;">
      <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,${EXEC.forest[700]},${EXEC.forest[600]});display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px ${EXEC.forest[900]}40;">
        <span style="color:${EXEC.gold[400]};font-size:16px;">🏆</span>
      </div>
      <span style="font-size:11px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;color:${EXEC.charcoal[900]};">Strategic Recommendations</span>
      <div style="flex:1;height:1px;background:linear-gradient(90deg,${EXEC.gold[400]}40,transparent);margin-left:12px;"></div>
    </div>
    ${recommendationsHtml || `<div style="text-align:center;padding:40px;color:${EXEC.forest[500]};font-size:14px;background:${EXEC.forest[500]}08;border-radius:16px;border:1px solid ${EXEC.forest[500]}20;">✓ All domains performing at or above the 70% benchmark — Outstanding performance!</div>`}
  </div>

  <!-- SECTION: Detailed Responses -->
  <div>
    <div style="display:flex;align-items:center;gap:14px;margin-bottom:28px;">
      <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,${EXEC.forest[700]},${EXEC.forest[600]});display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px ${EXEC.forest[900]}40;">
        <span style="color:${EXEC.gold[400]};font-size:16px;">📝</span>
      </div>
      <span style="font-size:11px;font-weight:900;letter-spacing:0.2em;text-transform:uppercase;color:${EXEC.charcoal[900]};">Detailed Assessment Responses</span>
      <div style="flex:1;height:1px;background:linear-gradient(90deg,${EXEC.gold[400]}40,transparent);margin-left:12px;"></div>
    </div>
    ${buildAnswersHtml(submission, breakdown)}
  </div>

  <!-- Executive Footer -->
  <div style="border-top:2px solid ${EXEC.cream[400]};padding-top:28px;margin-top:24px;display:flex;justify-content:space-between;align-items:center;">
    <div style="display:flex;align-items:center;gap:16px;">
      <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,${EXEC.forest[700]},${EXEC.gold[500]});display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px ${EXEC.forest[900]}30;">
        <span style="color:white;font-size:20px;">🛡</span>
      </div>
      <div>
        <div style="font-size:14px;font-weight:800;color:${EXEC.charcoal[900]};">CRAM Consulting</div>
        <div style="font-size:11px;color:${EXEC.charcoal[500]};margin-top:2px;">gm@cram.sa · cram.sa</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:24px;">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 16px;border-radius:20px;background:${EXEC.gold[400]}10;border:1px solid ${EXEC.gold[400]}25;">
        <span style="font-size:12px;">🔒</span>
        <span style="font-size:9px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${EXEC.gold[500]};">Strictly Confidential</span>
      </div>
      <div style="text-align:right;font-size:10px;color:${EXEC.charcoal[500]};line-height:1.7;">
        Generated ${generatedDate}<br>
        For authorized recipients only
      </div>
    </div>
  </div>

</div>
</body>
</html>`;
}

// ── Demo Route Handler (returns HTML preview) ─────────────────────────────────

export async function GET(req: NextRequest): Promise<NextResponse> {
  // Demo data for preview
  const demoUser = {
    fullName: "Dr. Mohammed Al-Rashid",
    companyName: "Saudi National Corporation",
  };

  const demoAnswers: Answer[] = [
    { selectedValue: 10, selectedLabel: "yes", question: { categoryKey: "board_governance", categoryOrder: 1, questionOrder: 1, questionEn: "Does the organization have a formal board charter that defines roles and responsibilities?" } },
    { selectedValue: 5, selectedLabel: "partial", question: { categoryKey: "board_governance", categoryOrder: 1, questionOrder: 2, questionEn: "Are board meetings held regularly with documented minutes?" } },
    { selectedValue: 10, selectedLabel: "yes", question: { categoryKey: "board_governance", categoryOrder: 1, questionOrder: 3, questionEn: "Is there a clear separation between the board and executive management?" } },
    { selectedValue: 0, selectedLabel: "no", question: { categoryKey: "risk_management", categoryOrder: 2, questionOrder: 1, questionEn: "Does the organization have a comprehensive risk management framework?" } },
    { selectedValue: 5, selectedLabel: "partial", question: { categoryKey: "risk_management", categoryOrder: 2, questionOrder: 2, questionEn: "Are risk assessments conducted and documented regularly?" } },
    { selectedValue: 10, selectedLabel: "yes", question: { categoryKey: "compliance", categoryOrder: 3, questionOrder: 1, questionEn: "Does the organization maintain compliance with all applicable regulations?" } },
    { selectedValue: 10, selectedLabel: "yes", question: { categoryKey: "compliance", categoryOrder: 3, questionOrder: 2, questionEn: "Is there a dedicated compliance officer or function?" } },
    { selectedValue: 5, selectedLabel: "partial", question: { categoryKey: "internal_audit", categoryOrder: 4, questionOrder: 1, questionEn: "Does the organization have an independent internal audit function?" } },
    { selectedValue: 10, selectedLabel: "yes", question: { categoryKey: "internal_audit", categoryOrder: 4, questionOrder: 2, questionEn: "Are audit findings tracked and addressed in a timely manner?" } },
    { selectedValue: 0, selectedLabel: "no", question: { categoryKey: "transparency", categoryOrder: 5, questionOrder: 1, questionEn: "Does the organization publish annual governance reports?" } },
    { selectedValue: 10, selectedLabel: "yes", question: { categoryKey: "transparency", categoryOrder: 5, questionOrder: 2, questionEn: "Are stakeholders provided with timely and accurate information?" } },
    { selectedValue: 5, selectedLabel: "partial", question: { categoryKey: "ethics", categoryOrder: 6, questionOrder: 1, questionEn: "Does the organization have a code of ethics and conduct?" } },
  ];

  const demoSubmission: Submission = {
    submittedAt: new Date("2026-05-01"),
    totalScore: 80,
    maxScore: 120,
    answers: demoAnswers,
  };

  const breakdown = buildCategoryBreakdown(demoSubmission.answers);
  const sortedCats = Object.entries(breakdown).sort(([, a], [, b]) => b.pct - a.pct);
  const pct = Math.round((demoSubmission.totalScore / (demoSubmission.maxScore ?? 1)) * 100);

  const yes = demoSubmission.answers.filter(a => a.selectedLabel === "yes").length;
  const partial = demoSubmission.answers.filter(a => a.selectedLabel === "partial").length;
  const no = demoSubmission.answers.filter(a => a.selectedLabel === "no").length;
  const total = demoSubmission.answers.length;

  const radarSVG = buildRadarSVG(sortedCats);
  const donutSVG = buildDonutSVG(pct);
  const pieSVG = buildPieSVG(yes, partial, no, total);
  const html = buildHtml(demoUser, demoSubmission, breakdown, sortedCats, radarSVG, donutSVG, pieSVG);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
