import { expect, test, type Page } from '@playwright/test';

const SIZES = [
  [1280, 800],
  [1366, 768],
  [1536, 864],
  [1280, 700],
  [1280, 640],
  [1440, 900],
  [1920, 1080],
] as const;

/** Nothing in the rail is clipped: it fits, and every visible block lies inside it. */
async function expectRailFits(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  const rail = page.locator('aside.rail');
  const { overflow, outside } = await rail.evaluate((el) => {
    const box = el.getBoundingClientRect();
    const outside: string[] = [];
    el.querySelectorAll('a, h1, p, li, dt, dd, button').forEach((child) => {
      const r = child.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return; // not rendered (hidden by priority)
      if (r.bottom > box.bottom + 1 || r.top < box.top - 1)
        outside.push(`${child.tagName} ${child.textContent?.slice(0, 30)}`);
    });
    return { overflow: el.scrollHeight - el.clientHeight, outside };
  });
  expect(overflow).toBeLessThanOrEqual(0);
  expect(outside).toEqual([]);
  // Every visible section-index link sits fully inside the rail.
  const box = (await rail.boundingBox())!;
  for (const link of await page.locator('[data-section-index] a').all()) {
    if (!(await link.isVisible())) continue;
    const b = (await link.boundingBox())!;
    expect(b.y).toBeGreaterThanOrEqual(box.y);
    expect(b.y + b.height).toBeLessThanOrEqual(box.y + box.height + 1);
  }
}

test.describe('profile rail never clips', () => {
  for (const [w, h] of SIZES) {
    for (const path of ['/', '/vi/']) {
      test(`${path} at ${w}x${h}`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: h });
        await page.goto(path);
        await expectRailFits(page);
        // And after scrolling: the sticky rail keeps fitting.
        await page.evaluate(() => window.scrollTo(0, 1500));
        await expectRailFits(page);
      });
    }
  }

  for (const [w, h] of [
    [1300, 500],
    [1280, 560],
  ] as const) {
    test(`nothing is unreachable at ${w}x${h}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/');
      await page.evaluate(() => document.fonts.ready);
      const rail = page.locator('aside.rail');
      const { position, overflow } = await rail.evaluate((el) => ({
        position: getComputedStyle(el).position,
        overflow: el.scrollHeight - el.clientHeight,
      }));
      // Short windows: the rail scrolls with the page instead of clipping.
      if (h < 551) expect(position).toBe('static');
      expect(overflow).toBeLessThanOrEqual(0);
      // Every contact link can be scrolled into view and sits inside the viewport.
      const links = rail.locator(
        'a[href^="mailto:"], a[href*="github.com"], a[href*="linkedin.com"]',
      );
      for (const link of await links.all()) {
        if (!(await link.isVisible())) continue;
        await link.scrollIntoViewIfNeeded();
        const b = (await link.boundingBox())!;
        expect(b.y).toBeGreaterThanOrEqual(0);
        expect(b.y + b.height).toBeLessThanOrEqual(h + 1);
      }
      expect(await links.count()).toBeGreaterThan(0);
    });
  }

  test('hides the section index first, then the languages, as the viewport gets shorter', async ({
    page,
  }) => {
    const visible = async (h: number) => {
      await page.setViewportSize({ width: 1440, height: h });
      return {
        index: await page.locator('[data-section-index]').isVisible(),
        langs: await page.locator('.rail .langs').isVisible(),
      };
    };
    await page.goto('/');
    expect(await visible(900)).toEqual({ index: true, langs: true });
    expect(await visible(800)).toEqual({ index: false, langs: true });
    expect(await visible(600)).toEqual({ index: false, langs: false });
  });

  test('the JS safety net hides blocks when the text is larger than the breakpoints assume', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await expect(page.locator('[data-section-index]')).toBeVisible();
    await page.addStyleTag({ content: '.rail .headline { font-size: 2.2rem !important; }' });
    await page.setViewportSize({ width: 1440, height: 901 }); // triggers the resize handler
    await expect(page.locator('[data-section-index]')).toBeHidden();
    await expectRailFits(page);
  });
});

test.describe('Home container', () => {
  for (const width of [1440, 1920]) {
    test(`nav and footer line up with the rail and the canvas at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/');
      const brand = (await page.locator('header[data-nav] .brand').boundingBox())!;
      const rail = (await page.locator('aside.rail').boundingBox())!;
      expect(Math.abs(brand.x - rail.x)).toBeLessThanOrEqual(1);
      const canvas = (await page.locator('.canvas').boundingBox())!;
      const foot = (await page.locator('footer .meta').boundingBox())!;
      expect(Math.abs(foot.x + foot.width - (canvas.x + canvas.width))).toBeLessThanOrEqual(1);
    });
  }

  test('other pages keep the 1120px container', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1000 });
    await page.goto('/experiences/');
    const brand = (await page.locator('header[data-nav] .brand').boundingBox())!;
    expect(brand.x).toBeCloseTo((1920 - 1120) / 2, 0);
  });
});

test.describe('Profile rail details', () => {
  test('"Read the blog →" is a quiet link right under the pills, aligned with them', async ({
    page,
  }) => {
    for (const width of [375, 1100, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/');
      const pills = (await page.locator('.rail .pills').boundingBox())!;
      const read = page.locator('.rail .read');
      await expect(read).toHaveText('Read the blog →');
      const box = (await read.boundingBox())!;
      expect(Math.abs(box.x - pills.x)).toBeLessThanOrEqual(1); // no indent
      expect(box.height).toBeGreaterThanOrEqual(44);
      expect(box.y - (pills.y + pills.height)).toBeLessThanOrEqual(8);
      expect(box.y).toBeGreaterThanOrEqual(pills.y + pills.height - 1);
    }
  });

  for (const width of [375, 1100, 1440]) {
    test(`stat numbers come before their labels at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/');
      for (const tile of await page.locator('.rail .tile-num').all()) {
        const num = (await tile.locator('.num').boundingBox())!;
        const label = (await tile.locator('dt').boundingBox())!;
        expect(num.y).toBeLessThan(label.y);
      }
    });
  }

  test('a clicked section-index item stays current even when the page cannot scroll further', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    const index = page.locator('[data-section-index]');
    await expect(index.locator('a[aria-current="location"]')).toHaveText('Skills'); // current on load
    await index.getByRole('link', { name: 'STAR stories' }).click();
    await page.waitForTimeout(600);
    await expect(index.locator('a[aria-current="location"]')).toHaveText('STAR stories');
    await index.getByRole('link', { name: 'Work & writing' }).click();
    await page.waitForTimeout(400);
    await expect(index.locator('a[aria-current="location"]')).toHaveText('Work & writing');
    // The lock ends as soon as the user scrolls.
    await page.mouse.move(900, 500);
    await page.mouse.wheel(0, 3000);
    await expect(index.locator('a[aria-current="location"]')).toHaveText('Contact');
  });

  test('Skills is current before any JavaScript runs', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page.locator('[data-section-index] a[aria-current="location"]')).toHaveText(
      'Skills',
    );
    await context.close();
  });
});

test.describe('Section index scroll-spy', () => {
  for (const [w, h] of [
    [1280, 800],
    [1440, 900],
    [1920, 1080],
  ] as const) {
    test(`every item is current in order while wheeling down at ${w}x${h}`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto('/');
      await page.mouse.move(w / 2, h / 2);
      const names = await page.locator('[data-section-index] a').allTextContents();
      expect(names).toHaveLength(4);
      const seen: string[] = [];
      const record = async () => {
        const cur = await page
          .locator('[data-section-index] a[aria-current="location"]')
          .allTextContents();
        expect(cur).toHaveLength(1);
        if (seen.at(-1) !== cur[0]) seen.push(cur[0]);
      };
      await record();
      for (let i = 0; i < 40; i++) {
        await page.mouse.wheel(0, 300);
        await page.waitForTimeout(60);
        await record();
        if (
          await page.evaluate(
            () => innerHeight + scrollY >= document.documentElement.scrollHeight - 1,
          )
        )
          break;
      }
      expect(seen).toEqual(names);
    });
  }
});

test.describe('Home sections', () => {
  for (const width of [1440, 1920]) {
    test(`the contact section is at most 160px tall at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto('/');
      const box = (await page.locator('#contact').boundingBox())!;
      expect(box.height).toBeLessThanOrEqual(160);
    });
  }

  // Story counts of 0/1/2/3 are covered by the rendering tests in tests/unit/home-render.test.ts;
  // this checks the CSS those class names drive, on the real 3-story page.
  test('the STAR row is three equal columns at 1440px', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/');
    const widths = await page
      .locator('#stories li.card')
      .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().width)));
    expect(widths).toHaveLength(3);
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
  });
});
