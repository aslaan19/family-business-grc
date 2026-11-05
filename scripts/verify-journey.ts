import "dotenv/config";
import assert from "node:assert/strict";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import puppeteer, { type Page } from "puppeteer";
import { CONTENT } from "./fixtures/governance";
import { SECTIONS } from "../app/lib/institutional-content";
import { fieldError, invalidFields } from "../app/lib/assessment-validation";
import { escapeHtml, reportHtml } from "../app/lib/report-html";
import { type FinancialProposal } from "../app/lib/proposal-data";
import { proposalHtml } from "../app/lib/proposal-html";

// Local, isolated fixtures: all application API calls are intercepted. No client
// records are created and no emails are sent while exercising the full journey.
const base = process.env.QA_BASE_URL || "http://localhost:3000";
const output = "artifacts/qa";
const user = {
  id: "00000000-0000-4000-8000-000000000001",
  fullName: "Sara Al-Faisal",
  email: "sara@example.test",
  companyName: "Al-Faisal Family Group",
  phone: "+966500000001",
};
const questions = CONTENT.en.categories.flatMap((c) =>
  c.questions.map((q, i) => ({
    id: `00000000-0000-4000-8000-${String(c.num * 10 + i).padStart(12, "0")}`,
    categoryOrder: c.num,
    categoryKey: `domain_${c.num}`,
    questionOrder: i + 1,
    title: c.title,
    question: q.q,
    description: q.desc,
    titleEn: c.title,
    titleAr: CONTENT.ar.categories[c.num - 1].title,
    questionEn: q.q,
    questionAr: CONTENT.ar.categories[c.num - 1].questions[i].q,
    descriptionAr: CONTENT.ar.categories[c.num - 1].questions[i].desc,
  })),
);
const values: Record<string, unknown> = {};
for (const section of SECTIONS)
  for (const field of section.fields) {
    if (field.type === "table")
      values[field.key] = [
        Object.fromEntries(
          (field.columns ?? []).map((c) => [
            c.keyEn,
            c.options?.[0] ?? "Operations",
          ]),
        ),
      ];
    else if (field.type === "yesno") values[field.key] = "Yes";
    else if (field.type === "number")
      values[field.key] = field.key === "yearEstablished" ? "2005" : "12";
    else if (field.type === "select") values[field.key] = field.options?.[0];
    else
      values[field.key] =
        field.key === "legalName"
          ? user.companyName
          : "Established business with a clear growth plan.";
  }
assert.deepEqual(invalidFields(values), []);
assert.ok(invalidFields({}).length > 0);
assert.equal(
  fieldError(
    SECTIONS[0].fields.find((f) => f.key === "numEmployees")!,
    "0",
  ),
  null,
);
assert.equal(
  fieldError(
    SECTIONS[0].fields.find((f) => f.key === "yearEstablished")!,
    "9999",
  ),
  "number",
);
assert.equal(
  fieldError(
    SECTIONS[0].fields.find((f) => f.key === "numEmployees")!,
    "-1",
  ),
  "number",
);
assert.equal(fieldError(SECTIONS[1].fields[0], [{}]), "table");
assert.equal(
  escapeHtml('<script>"x"</script>'),
  "&lt;script&gt;&quot;x&quot;&lt;/script&gt;",
);

async function main() {
  await mkdir(output, { recursive: true });
  const browser = await puppeteer.launch({ headless: true });
  const errors: string[] = [];
  const checks: string[] = [];
  let first = false,
    second = false,
    requestedAt: string | null = null,
    failSubmit = false;
  let submittedAnswers: { questionId: string; selectedValue: number }[] = [];
  let published: FinancialProposal | null = null;
  const date = new Date("2026-11-05T09:00:00Z");
  const a1 = () => ({
    id: "a1",
    totalScore: submittedAnswers.reduce((s, a) => s + a.selectedValue, 0),
    maxScore: questions.length * 10,
    pct: 100,
    submittedAt: date.toISOString(),
    answers: submittedAnswers.map((a) => ({
      ...a,
      question: questions.find((q) => q.id === a.questionId),
    })),
    rawPayload: {},
    catBreakdown: {},
  });
  const a2 = () => ({
    id: "a2",
    totalScore: 0,
    maxScore: 0,
    pct: null,
    submittedAt: date.toISOString(),
    answers: [],
    rawPayload: {
      ...values,
      _proposalRequestedAt: requestedAt,
      _financialProposal: published,
    },
    catBreakdown: {},
  });
  async function attach(page: Page) {
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.authenticate({
      username: process.env.ADMIN_USER ?? "admin",
      password: process.env.ADMIN_PASS ?? "Cram1234",
    });
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.origin !== base) {
        void request.abort();
        return;
      }
      if (!url.pathname.startsWith("/api/")) {
        void request.continue();
        return;
      }
      let status = 200,
        body: unknown = {};
      const posted = request.postData() ? JSON.parse(request.postData()!) : {};
      if (url.pathname === "/api/users/lookup")
        body = { user, hasAssessment1: first, hasAssessment2: second };
      else if (url.pathname === "/api/users")
        body = { user, hasSubmission: first, hasSubmission2: second };
      else if (url.pathname === "/api/questions") {
        body = {
          questions: questions.map((q) =>
            url.searchParams.get("lang") === "ar"
              ? {
                  ...q,
                  title: q.titleAr,
                  question: q.questionAr,
                  description: q.descriptionAr,
                }
              : q,
          ),
        };
      } else if (url.pathname === "/api/submissions") {
        if (failSubmit) {
          status = 503;
          body = { error: "Temporary failure" };
          failSubmit = false;
        } else {
          assert.equal(posted.answers.length, questions.length);
          submittedAnswers = posted.answers;
          first = true;
          body = { submission: a1() };
        }
      } else if (url.pathname === "/api/submissions2") {
        assert.ok(first);
        assert.deepEqual(invalidFields(posted.formData), []);
        second = true;
        body = { submission: a2() };
      } else if (url.pathname === "/api/proposal") {
        if (!first || !second) status = 403;
        else {
          if (request.method() === "POST") requestedAt ||= date.toISOString();
          body = { requestedAt, proposal: published };
        }
      } else if (url.pathname === "/api/admin/proposal") {
        published = {
          ...posted.proposal,
          issuedAt: date.toISOString(),
          reference: "CRAM-QA-001",
        };
        body = { proposal: published };
      } else if (url.pathname === "/api/admin/stats")
        body = {
          users: [
            {
              id: user.id,
              name: user.fullName,
              email: user.email,
              phone: user.phone,
              organization: user.companyName,
              createdAt: date.toISOString(),
              stage: "proposal_ready",
              assessment1: a1(),
              assessment2: a2(),
            },
          ],
        };
      else {
        status = 503;
        body = {
          error: "QA intentionally blocks export and email side effects",
        };
      }
      void request.respond({
        status,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    });
  }
  async function text(page: Page, value: string) {
    await page.waitForFunction(
      (s) => document.body.innerText.includes(s),
      {},
      value,
    );
  }
  async function clickText(page: Page, value: string, selector = "button,a") {
    await page.waitForFunction(
      (s, sel) =>
        [...document.querySelectorAll<HTMLElement>(sel)].some(
          (e) => e.innerText.trim() === s,
        ),
      {},
      value,
      selector,
    );
    await page.evaluate(
      (s, sel) =>
        [...document.querySelectorAll<HTMLElement>(sel)]
          .find((e) => e.innerText.trim() === s)!
          .click(),
      value,
      selector,
    );
  }
  async function english(page: Page) {
    const btn = await page.$(".header-actions button, .home-language");
    if (btn && (await btn.evaluate((e) => e.textContent))?.includes("English"))
      await btn.click();
  }
  async function noOverflow(page: Page, name: string) {
    const sizes = await page.evaluate(() => ({
      width: innerWidth,
      document: document.documentElement.scrollWidth,
    }));
    assert.ok(
      sizes.document <= sizes.width + 1,
      `${name}: horizontal overflow ${JSON.stringify(sizes)}`,
    );
    checks.push(`${name}: no page overflow`);
  }
  try {
    let page = await browser.newPage();
    await attach(page);
    await page.setViewport({ width: 1440, height: 1050 });
    await page.goto(base, { waitUntil: "networkidle0" });
    await english(page);
    await text(page, "Family business.");
    assert.equal(await page.$$(".chapter.locked a").then((a) => a.length), 0);
    await page.screenshot({
      path: `${output}/home-desktop.png`,
      fullPage: true,
    });
    checks.push("Home keeps assessments two and proposal locked");
    await page.setViewport({ width: 390, height: 844 });
    await noOverflow(page, "Mobile home");
    await page.screenshot({
      path: `${output}/home-mobile.png`,
      fullPage: true,
    });
    await page.goto(`${base}/assessment2/form`, { waitUntil: "networkidle0" });
    await english(page);
    await text(page, "currently locked");
    checks.push("Direct assessment-two link is gated");
    await page.goto(`${base}/proposal`, { waitUntil: "networkidle0" });
    await english(page);
    await text(page, "Complete both assessments");
    checks.push("Direct proposal link is gated");
    await page.goto(`${base}/assessment`, { waitUntil: "networkidle0" });
    await english(page);
    await page.type('[name="fullName"]', user.fullName);
    await page.type('[name="email"]', user.email);
    await page.type('[name="phone"]', user.phone);
    await page.type('[name="companyName"]', user.companyName);
    await clickText(page, "Save details & begin assessment");
    await text(page, "A stronger foundation");
    await clickText(page, "Save & continue");
    await text(page, "Answer every question");
    checks.push("Unanswered governance questions block continuation");
    await page.click('input[type="radio"][value="0"]');
    await page.reload({ waitUntil: "networkidle0" });
    await english(page);
    await page.waitForSelector('input[type="radio"][value="0"]:checked');
    checks.push("A zero-point answer survives refresh");
    await page.setViewport({ width: 1440, height: 1050 });
    await page.screenshot({
      path: `${output}/governance-desktop.png`,
      fullPage: true,
    });
    await page.setViewport({ width: 390, height: 844 });
    await noOverflow(page, "Mobile governance");
    await page.screenshot({
      path: `${output}/governance-mobile.png`,
      fullPage: true,
    });
    for (let i = 0; i < CONTENT.en.categories.length; i++) {
      await page.waitForFunction(
        () =>
          document.querySelectorAll('.question-card input[type="radio"]')
            .length > 0,
      );
      await page.evaluate(() =>
        document
          .querySelectorAll<HTMLInputElement>(
            '.question-card input[value="10"]',
          )
          .forEach((e) => e.click()),
      );
      await clickText(
        page,
        i === CONTENT.en.categories.length - 1
          ? "Review answers"
          : "Save & continue",
      );
      await text(
        page,
        i === CONTENT.en.categories.length - 1
          ? "Review before you submit"
          : CONTENT.en.categories[i + 1].title,
      );
      await new Promise((r) => setTimeout(r, 100));
    }
    assert.equal(first, false);
    checks.push("Review appears before governance submission");
    failSubmit = true;
    await clickText(page, "Submit assessment");
    await text(page, "Your answers were not submitted");
    assert.equal(first, false);
    checks.push("Submission failure preserves answers and offers retry");
    await clickText(page, "Submit assessment");
    await text(page, "next assessment is unlocked");
    assert.equal(first, true);
    checks.push(
      "Governance completion unlocks assessment two with dedicated transition",
    );
    await page.setViewport({ width: 1440, height: 1050 });
    await page.screenshot({
      path: `${output}/unlocked-desktop.png`,
      fullPage: true,
    });
    await page.setViewport({ width: 390, height: 844 });
    await noOverflow(page, "Mobile unlock");
    await clickText(page, "Begin assessment two");
    await text(page, "Let’s complete the picture");
    await clickText(page, "Save & continue");
    await text(page, "highlighted fields");
    checks.push("Institutional required fields block continuation");
    // Exercise the actual table controls before filling the remaining profile.
    await page.evaluate(() =>
      (
        document.querySelectorAll(".section-link")[1] as HTMLButtonElement
      ).click(),
    );
    await clickText(page, "Add an entry");
    assert.equal(await page.$$(".entry-card").then((a) => a.length), 1);
    await noOverflow(page, "Mobile repeatable entry");
    await page.screenshot({
      path: `${output}/institutional-table-mobile.png`,
      fullPage: true,
    });
    await page.click('[aria-label="Remove entry 1"]');
    assert.equal(await page.$$(".entry-card").then((a) => a.length), 0);
    checks.push(
      "Repeatable business entries add and remove correctly on mobile",
    );
    await page.evaluate(
      (id, data) =>
        localStorage.setItem(`karam:a2:${id}`, JSON.stringify(data)),
      user.id,
      values,
    );
    await page.reload({ waitUntil: "networkidle0" });
    await english(page);
    await page.waitForFunction(
      () =>
        (document.querySelector("#field-legalName") as HTMLInputElement)
          ?.value === "Al-Faisal Family Group",
    );
    checks.push("Institutional drafts resume after refresh");
    await page.setViewport({ width: 1440, height: 1050 });
    await page.screenshot({
      path: `${output}/institutional-desktop.png`,
      fullPage: true,
    });
    for (let i = 0; i < SECTIONS.length; i++) {
      await clickText(
        page,
        i === SECTIONS.length - 1 ? "Review details" : "Save & continue",
      );
      await text(
        page,
        i === SECTIONS.length - 1
          ? "Review your business profile"
          : SECTIONS[i + 1].titleEn,
      );
      await new Promise((r) => setTimeout(r, 100));
    }
    await clickText(page, "Submit assessment");
    await text(page, "Request financial proposal");
    assert.equal(second, true);
    await clickText(page, "Request financial proposal");
    await text(page, "Request received");
    assert.ok(requestedAt);
    checks.push("Both assessments lead to a persisted proposal request");
    await page.setViewport({ width: 390, height: 844 });
    await noOverflow(page, "Mobile proposal");
    await page.screenshot({
      path: `${output}/proposal-mobile.png`,
      fullPage: true,
    });
    await page.reload({ waitUntil: "networkidle0" });
    await english(page);
    await text(page, "Request received");
    checks.push("Saved proposal request remains visible after refresh");
    await page.goto(`${base}/admin`, { waitUntil: "networkidle0" });
    await text(page, "Business, in perspective.");
    await text(page, "Sara Al-Faisal");
    await page.setViewport({ width: 1440, height: 1050 });
    await page.screenshot({
      path: `${output}/admin-desktop.png`,
      fullPage: true,
    });
    await page.type(".search-input input", "no-such-client");
    await text(page, "No matching clients");
    await clickText(page, "Reset filters");
    await text(page, "Sara Al-Faisal");
    checks.push("Admin search and filter reset work");
    await page.setViewport({ width: 390, height: 844 });
    await noOverflow(page, "Mobile admin");
    await page.screenshot({
      path: `${output}/admin-mobile.png`,
      fullPage: true,
    });
    await page.goto(`${base}/admin/reports/assessment2/${user.id}`, {
      waitUntil: "networkidle0",
    });
    await text(page, "Institutional profile");
    await text(page, "Operations");
    assert.ok(
      !(await page.evaluate(() => document.body.innerText)).includes("0%"),
    );
    checks.push(
      "Institutional report shows business details without an invented score",
    );
    await noOverflow(page, "Mobile institutional report");
    await page.screenshot({
      path: `${output}/report-institutional-mobile.png`,
      fullPage: true,
    });
    await clickText(page, "Prepare proposal");
    await page.type(
      ".proposal-editor textarea",
      "Governance roadmap and implementation support.",
    );
    await page.$eval('.proposal-editor input[type="date"]', (input) => {
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )!.set!.call(input, "2099-12-31");
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
    await page.type(".proposal-line-item input", "Advisory services");
    const priceInput = (await page.$$(".proposal-line-item input"))[2];
    await priceInput.click({ clickCount: 3 });
    await priceInput.press("Backspace");
    await priceInput.type("12000");
    await noOverflow(page, "Mobile proposal editor");
    await clickText(page, "Publish for client");
    await text(page, "The client can now view and download this proposal.");
    assert.ok(published);
    await page.goto(`${base}/proposal`, { waitUntil: "networkidle0" });
    await english(page);
    await text(page, "Download proposal PDF");
    await text(page, "12,000");
    await noOverflow(page, "Mobile published proposal");
    await page.screenshot({
      path: `${output}/published-proposal-mobile.png`,
      fullPage: true,
    });
    checks.push(
      "Admin-entered scope and fees publish into the client’s financial proposal workspace",
    );
    await page.goto(`${base}/admin/reports/assessment1/${user.id}`, {
      waitUntil: "networkidle0",
    });
    await text(page, "Governance assessment");
    await text(page, "100%");
    await page.setViewport({ width: 1440, height: 1050 });
    await page.screenshot({
      path: `${output}/report-governance-desktop.png`,
      fullPage: true,
    });
    await page.type(".search-input input", "nonexistent-topic");
    await text(page, "No matching responses");
    await clickText(page, "Clear search");
    checks.push("Report search and empty state work");
    await clickText(page, "Email report");
    await text(page, "Send this report to sara@example.test?");
    await clickText(page, "Cancel");
    checks.push(
      "Email action offers a concrete recipient confirmation without sending in QA",
    );
    const pdfPage = await browser.newPage();
    const latin = await readFile("public/fonts/geist-latin.woff2");
    const arabic = await readFile("public/fonts/beiruti-arabic.woff2");
    const fonts = `@font-face{font-family:"CRAM Sans";src:url(data:font/woff2;base64,${latin.toString("base64")});font-weight:100 900}@font-face{font-family:"CRAM Arabic";src:url(data:font/woff2;base64,${arabic.toString("base64")});font-weight:400 900}`;
    for (const type of ["assessment1", "assessment2"] as const) {
      const submission =
        type === "assessment1"
          ? { ...a1(), submittedAt: date }
          : { ...a2(), submittedAt: date };
      const html = reportHtml(
        { user, submission, type } as Parameters<typeof reportHtml>[0],
        fonts,
      );
      assert.ok(
        type === "assessment1" ||
          (!html.includes("0%</b>") && html.includes("Operations")),
      );
      await pdfPage.setContent(html, { waitUntil: "load" });
      await pdfPage.pdf({
        path: `${output}/${type}.pdf`,
        format: "A4",
        printBackground: true,
      });
      await pdfPage.screenshot({
        path: `${output}/${type}-print-preview.png`,
        fullPage: true,
      });
    }
    checks.push(
      "Both report templates render as PDFs; institutional output includes submitted details",
    );
    await pdfPage.setContent(
      proposalHtml(user, published!).replace("</style>", `${fonts}</style>`),
      { waitUntil: "load" },
    );
    await pdfPage.pdf({
      path: `${output}/financial-proposal.pdf`,
      format: "A4",
      printBackground: true,
    });
    checks.push("Published financial proposal renders as a downloadable PDF");
    console.log("PDF checks finished; checking Arabic layouts");
    first = false;
    second = false;
    page = await browser.newPage();
    await attach(page);
    await page.goto(base, { waitUntil: "networkidle0" });
    await english(page);
    await page.click(".home-language");
    await text(page, "حوكمة الأعمال");
    await page.screenshot({
      path: `${output}/home-arabic-desktop.png`,
      fullPage: true,
    });
    await page.goto(`${base}/assessment/Qs`, { waitUntil: "networkidle0" });
    await text(page, "أساس أقوى لأعمالك.");
    assert.equal(
      await page.$eval(
        ".assessment-progress strong",
        (e) => getComputedStyle(e).direction,
      ),
      "ltr",
    );
    assert.equal(
      await page.evaluate(() => document.documentElement.dir),
      "rtl",
    );
    await page.screenshot({
      path: `${output}/governance-arabic-desktop.png`,
      fullPage: true,
    });
    await page.setViewport({ width: 390, height: 844 });
    await noOverflow(page, "Arabic mobile governance");
    await page.screenshot({
      path: `${output}/governance-arabic-mobile.png`,
      fullPage: true,
    });
    await page.emulateMediaFeatures([
      { name: "prefers-reduced-motion", value: "reduce" },
    ]);
    await noOverflow(page, "Reduced-motion mobile layout");
    checks.push(
      "Arabic layout and language preference survive navigation and reload",
    );
    assert.deepEqual(errors, [], "Browser runtime errors");
    await writeFile(
      `${output}/results.json`,
      JSON.stringify({ checks, browserErrors: errors }, null, 2),
    );
    console.log(
      `PASS: ${checks.length} journey, admin, report, validation, and responsive checks. Evidence: ${output}`,
    );
  } catch (error) {
    console.error("Verification failed:", error);
    throw error;
  } finally {
    const timer = setTimeout(() => browser.process()?.kill(), 5000);
    await browser.close().finally(() => clearTimeout(timer));
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
