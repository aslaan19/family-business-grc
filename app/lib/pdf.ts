import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Browser } from "puppeteer-core";

export async function renderPdf(html: string) {
  let browser: Browser | undefined;
  try {
    const [latin, arabic] = await Promise.all([
      readFile(path.join(process.cwd(), "public/fonts/geist-latin.woff2")),
      readFile(path.join(process.cwd(), "public/fonts/beiruti-arabic.woff2")),
    ]);
    const fonts = `@font-face{font-family:"CRAM Sans";src:url(data:font/woff2;base64,${latin.toString("base64")});font-weight:100 900}@font-face{font-family:"CRAM Arabic";src:url(data:font/woff2;base64,${arabic.toString("base64")});font-weight:400 900}`;
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      const chromium = (await import("@sparticuz/chromium")).default;
      browser = await (
        await import("puppeteer-core")
      ).default.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      });
    } else
      browser = (await (
        await import("puppeteer")
      ).default.launch({ headless: true })) as unknown as Browser;
    const page = await browser.newPage();
    await page.setJavaScriptEnabled(false);
    await page.setContent(html.replace("</style>", `${fonts}</style>`), {
      waitUntil: "load",
    });
    await page.evaluate(() => document.fonts.ready);
    return await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate:
        '<div style="width:100%;font:8px Arial;color:#7b8771;margin:0 14mm;display:flex;justify-content:space-between"><span>CRAM Consulting · Confidential</span><span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span></div>',
      margin: { top: "16mm", right: "14mm", bottom: "20mm", left: "14mm" },
    });
  } finally {
    await browser?.close();
  }
}
