// Renders /experiences/print/ and /vi/experiences/print/ from dist/ to US Letter PDFs (spec §4.3).
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { readEntry } from './lib/frontmatter';
import { serve } from './static-server';

const DIST = 'dist';
const TARGETS = [
  { route: '/experiences/print/', out: 'cv.pdf' },
  { route: '/vi/experiences/print/', out: 'vi/cv.pdf' },
];

async function readProfile() {
  const d = await readEntry('src/content/profile/en/index.md');
  return { name: String(d.name), headline: String(d.headline), tagline: String(d.tagline) };
}

async function main() {
  const profile = await readProfile();
  const { server, url } = await serve(DIST);
  const browser = await chromium.launch();
  try {
    for (const { route, out } of TARGETS) {
      const page = await browser.newPage();
      const res = await page.goto(url + route, { waitUntil: 'networkidle' });
      if (!res?.ok()) throw new Error(`${route} returned ${res?.status()}`);
      await page.evaluate(() => document.fonts.ready);
      const raw = await page.pdf({
        format: 'Letter',
        printBackground: true,
        margin: { top: '0.5in', bottom: '0.5in', left: '0.6in', right: '0.6in' },
      });
      await page.close();

      const pdf = await PDFDocument.load(raw);
      pdf.setTitle(`${profile.name} — ${profile.headline} CV`);
      pdf.setAuthor(profile.name);
      pdf.setSubject(`${profile.headline} — ${profile.tagline}`);
      const file = join(DIST, out);
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, await pdf.save());
      console.log(`${file}: ${pdf.getPageCount()} page(s)`);
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error('CV PDF generation failed:', err);
  process.exit(1);
});
