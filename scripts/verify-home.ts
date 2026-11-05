import "dotenv/config";
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import puppeteer from "puppeteer";

// Homepage-only QA. All API requests are intercepted; no real client data changes.
async function main() {
  const base = process.env.QA_BASE_URL || "http://localhost:3000";
  const output = "artifacts/qa/home-redesign";
  await mkdir(output, { recursive: true });
  const browser = await puppeteer.launch({ headless: true });
  const checks: string[] = [];
  const errors: string[] = [];
  const user = {
    id: "00000000-0000-4000-8000-000000000001",
    fullName: "Sara Al-Faisal",
    email: "sara@example.test",
    companyName: "Al-Faisal Group",
  };
  try {
    for (const state of [0, 1, 2]) {
      const page = await browser.newPage();
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        const url = new URL(request.url());
        if (url.origin !== base) {
          void request.abort();
          return;
        }
        if (url.pathname === "/api/users/lookup") {
          void request.respond({
            contentType: "application/json",
            body: JSON.stringify({
              user,
              hasAssessment1: state >= 1,
              hasAssessment2: state >= 2,
            }),
          });
          return;
        }
        if (url.pathname.startsWith("/api/")) {
          void request.respond({
            status: 503,
            contentType: "application/json",
            body: '{"error":"Blocked during isolated homepage QA"}',
          });
          return;
        }
        void request.continue();
      });
      await page.evaluateOnNewDocument(
        (profile, stage) => {
          localStorage.setItem("karam_language", "ar");
          if (stage)
            localStorage.setItem("karam_user", JSON.stringify(profile));
          else localStorage.removeItem("karam_user");
        },
        user,
        state,
      );
      await page.setViewport({ width: 1440, height: 1000 });
      await page.goto(base, { waitUntil: "networkidle0" });
      await page.waitForSelector(".exp-hero-copy h1");
      await page.waitForFunction(
        () => !document.body.innerText.includes("جارٍ تحميل تقدمك"),
      );
      assert.equal(
        await page.$$(".chapter.locked").then((e) => e.length),
        2 - state,
      );
      assert.equal(await page.$$(".chapter.locked a").then((e) => e.length), 0);
      assert.equal(
        await page.$eval(".exp-hero-cta a", (e) => e.getAttribute("href")),
        state === 0
          ? "/assessment"
          : state === 1
            ? "/assessment2/form"
            : "/proposal",
      );
      assert.equal(
        await page.$eval(
          ".chapter-wrap.current .chapter h3",
          (e) => e.textContent,
        ),
        ["تقييم الحوكمة", "التقييم المؤسسي", "عرضك المالي المخصص"][state],
      );
      checks.push(
        `Stage ${state}: correct next action, active chapter, and sequential locks`,
      );
      if (state === 0) {
        // Trigger and finish each scroll reveal before capturing the full page.
        for (const chapter of await page.$$(".chapter")) {
          await chapter.scrollIntoView();
          await page.waitForFunction(
            (element) => getComputedStyle(element).opacity === "1",
            {},
            chapter,
          );
        }
        await page.evaluate(() => {
          (document.activeElement as HTMLElement)?.blur();
          scrollTo({ top: 0, behavior: "instant" });
        });
        checks.push("Every roadmap chapter reveals when scrolled into view");
        await page.screenshot({
          path: `${output}/arabic-desktop.png`,
          fullPage: true,
        });
        await page.screenshot({ path: `${output}/arabic-desktop-hero.png` });
        await page.click(".map-stop.stop-1");
        await page.waitForFunction(() =>
          document
            .querySelector(".map-preview")
            ?.textContent?.includes("أكمل تقييم الحوكمة"),
        );
        assert.equal(
          await page.$eval(".map-stop.stop-1", (e) =>
            e.getAttribute("aria-pressed"),
          ),
          "true",
        );
        await page.click(".map-stop.stop-2");
        await page.waitForFunction(() =>
          document
            .querySelector(".map-preview")
            ?.textContent?.includes("أكمل التقييمين"),
        );
        checks.push(
          "Interactive map explains both locked prerequisites without navigation",
        );
        await page.click(".map-stop.stop-0");
        await page.click(".motion-toggle");
        assert.equal(
          await page.$eval(
            ".route-traveller",
            (e) => getComputedStyle(e).animationPlayState,
          ),
          "paused",
        );
        await page.click(".motion-toggle");
        assert.equal(
          await page.$eval(
            ".route-traveller",
            (e) => getComputedStyle(e).animationPlayState,
          ),
          "running",
        );
        checks.push("Animation pause and play controls work");
        for (const width of [390, 320, 768]) {
          await page.setViewport({ width, height: 844 });
          assert.ok(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth + 1,
            ),
            `Overflow at ${width}px`,
          );
          const bounds = await page.$$eval(".map-stop", (elements) =>
            elements.map((e) => {
              const a = e.getBoundingClientRect();
              const p = e.closest(".legacy-map")!.getBoundingClientRect();
              return a.left >= p.left - 2 && a.right <= p.right + 2;
            }),
          );
          assert.ok(
            bounds.every(Boolean),
            `Map node outside panel at ${width}px`,
          );
          checks.push(
            `Arabic ${width}px: no page overflow; map nodes remain inside their panel`,
          );
          if (width === 390) {
            await page.evaluate(() => {
              (document.activeElement as HTMLElement)?.blur();
              scrollTo({ top: 0, behavior: "instant" });
            });
            await page.screenshot({
              path: `${output}/arabic-mobile.png`,
              fullPage: true,
            });
            await page.screenshot({ path: `${output}/arabic-mobile-hero.png` });
            await (await page.$(".exp-chapters"))!.screenshot({
              path: `${output}/arabic-mobile-roadmap.png`,
            });
          }
        }
        await page.setViewport({ width: 1440, height: 1000 });
        await page.click(".home-language");
        await page.waitForFunction(
          () => document.documentElement.dir === "ltr",
        );
        await page.screenshot({ path: `${output}/english-desktop-hero.png` });
        await page.setViewport({ width: 390, height: 844 });
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth + 1,
          ),
        );
        await page.screenshot({
          path: `${output}/english-mobile.png`,
          fullPage: true,
        });
        checks.push("English layout switches correctly and fits mobile");
        await page.emulateMediaFeatures([
          { name: "prefers-reduced-motion", value: "reduce" },
        ]);
        assert.equal(
          await page.$eval(
            ".route-traveller",
            (e) => getComputedStyle(e).animationName,
          ),
          "none",
        );
        checks.push(
          "System reduced-motion preference disables decorative animation",
        );
        await page.click(".exp-hero-cta a");
        await page.waitForSelector(".registration-form");
        assert.equal(await page.$$(".cram-home").then((e) => e.length), 0);
        checks.push("Primary action reaches the existing registration flow");
      } else {
        for (const chapter of await page.$$(".chapter")) {
          await chapter.scrollIntoView();
          await page.waitForFunction(
            (element) => getComputedStyle(element).opacity === "1",
            {},
            chapter,
          );
        }
        await page.evaluate(() => scrollTo({ top: 0, behavior: "instant" }));
        await page.screenshot({
          path: `${output}/stage-${state}-desktop.png`,
          fullPage: true,
        });
      }
      await page.close();
    }
    assert.deepEqual(errors, []);
    await writeFile(
      `${output}/results.json`,
      JSON.stringify({ checks, errors }, null, 2),
    );
    console.log(`PASS: ${checks.length} homepage checks. Evidence: ${output}`);
  } finally {
    const timer = setTimeout(() => browser.process()?.kill(), 5000);
    await browser.close().finally(() => clearTimeout(timer));
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
