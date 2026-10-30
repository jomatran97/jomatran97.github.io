import { expect, test, type Page } from '@playwright/test';

const SKILLS = [
  'Data Engineering',
  'Cloud Platform',
  'DevOps & IaC',
  'Backend Engineering',
  'AI Engineering',
  'Methodologies',
];

// Layout is measured without the reveal animation (its translate would skew the numbers).
test.use({ reducedMotion: 'reduce' });

const size = (width: number, height = 900) => ({ width, height });

/** Vertical gaps between consecutive content blocks of the canvas. */
const blockGaps = (page: Page) =>
  page.locator('.canvas [data-block]').evaluateAll((els) => {
    const boxes = els
      .map((e) => e.getBoundingClientRect())
      .filter((r) => r.height > 0)
      .sort((a, b) => a.top - b.top);
    return boxes.slice(1).map((b, i) => Math.round(b.top - boxes[i].bottom));
  });

test.describe('Home layout', () => {
  test('is one page with exactly one H1 and no skipped heading levels', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Ryan Parker');
    const levels = await page
      .locator('main :is(h1,h2,h3,h4,h5,h6)')
      .evaluateAll((els) => els.map((e) => Number(e.tagName[1])));
    expect(levels[0]).toBe(1);
    levels.slice(1).forEach((level, i) => expect(level).toBeLessThanOrEqual(levels[i] + 1));
    await expect(page.locator('main h2')).toHaveText([
      'Technical skills',
      'Work & writing',
      'Featured STAR stories',
      "Let's talk",
    ]);
  });

  test('uses a container of at least 1520px at 1920px and shows the sticky rail', async ({
    page,
  }) => {
    await page.setViewportSize(size(1920, 1080));
    await page.goto('/');
    const grid = await page.locator('.home-grid').boundingBox();
    expect(grid!.width).toBeGreaterThanOrEqual(1520);
    const rail = page.locator('aside.rail');
    await expect(rail).toBeVisible();
    expect((await rail.boundingBox())!.width).toBeCloseTo(360, 0);
    expect(grid!.x).toBeLessThanOrEqual(200);
  });

  test('the rail stays in view while the canvas scrolls (>= 1280px)', async ({ page }) => {
    await page.setViewportSize(size(1440, 900));
    await page.goto('/');
    await expect(page.locator('aside.rail')).toHaveCSS('position', 'sticky');
    const before = (await page.locator('aside.rail').boundingBox())!.y;
    await page.evaluate(() => window.scrollTo(0, 1600));
    await page.waitForTimeout(200);
    const box = (await page.locator('aside.rail').boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(52);
    expect(box.y).toBeLessThan(120);
    expect(box.y + box.height).toBeLessThanOrEqual(900);
    expect(before).toBeGreaterThan(0);
    // Nothing is clipped: the whole rail fits in the viewport at 1440 x 900.
    expect(
      await page.locator('aside.rail').evaluate((el) => el.scrollHeight - el.clientHeight),
    ).toBeLessThanOrEqual(1);
  });

  for (const width of [1440, 1920]) {
    test(`no vertical gap between content blocks is taller than 160px at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(size(width, 1080));
      await page.goto('/');
      const gaps = await blockGaps(page);
      expect(gaps.length).toBeGreaterThan(5);
      for (const gap of gaps) expect(gap).toBeLessThanOrEqual(160);
    });
  }

  test('1024-1279px: a non-sticky two-column profile header, no section index', async ({
    page,
  }) => {
    await page.setViewportSize(size(1100));
    await page.goto('/');
    await expect(page.locator('aside.rail')).toHaveCSS('position', 'static');
    const identity = (await page.locator('.rail .identity').boundingBox())!;
    const side = (await page.locator('.rail .side').boundingBox())!;
    expect(side.x).toBeGreaterThan(identity.x + identity.width - 1);
    expect(Math.abs(side.y - identity.y)).toBeLessThan(80);
    await expect(page.locator('[data-section-index]')).toBeHidden();
    const canvas = (await page.locator('.canvas').boundingBox())!;
    expect(canvas.x).toBeLessThan(identity.x + 1);
    expect(canvas.y).toBeGreaterThan(identity.y + identity.height);
  });

  test('below 1024px everything stacks in one column', async ({ page }) => {
    await page.setViewportSize(size(375, 800));
    await page.goto('/');
    const parts = await Promise.all(
      ['.rail .identity', '.rail .stats', '.rail .langs', '.canvas'].map((s) =>
        page.locator(s).boundingBox(),
      ),
    );
    for (let i = 1; i < parts.length; i++)
      expect(parts[i]!.y).toBeGreaterThanOrEqual(parts[i - 1]!.y + parts[i - 1]!.height - 1);
    for (const p of parts) expect(p!.x).toBeLessThan(40);
    await expect(page.locator('aside.rail')).toHaveCSS('position', 'static');
    const cols = await page
      .locator('[data-skill-card]')
      .evaluateAll((els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().x))).size);
    expect(cols).toBe(1);
  });

  test('has no horizontal scroll at 320px', async ({ page }) => {
    await page.setViewportSize(size(320, 700));
    await page.goto('/');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(0);
  });

  test('every section and card is visible with JavaScript off', async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: size(1440) });
    const page = await context.newPage();
    await page.goto('/');
    for (const id of ['skills', 'work', 'stories', 'contact', 'certifications'])
      await expect(page.locator(`#${id}`)).toBeVisible();
    for (const card of await page.locator('[data-skill-card]').all())
      await expect(card).toBeVisible();
    await expect(page.locator('[data-cert-card]').first()).toBeVisible();
    await context.close();
  });
});

test.describe('Profile rail', () => {
  test('shows identity, actions, stats, languages and contact', async ({ page }) => {
    await page.goto('/');
    const rail = page.locator('aside.rail');
    await expect(rail).toContainText(
      'Senior Data Engineer — Data Pipelines, ETL/ELT & Cloud Data Platforms',
    );
    await expect(rail).toContainText('Ho Chi Minh City, Vietnam');
    await expect(rail.getByRole('link', { name: 'View experiences' })).toHaveAttribute(
      'href',
      '/experiences/',
    );
    await expect(rail.getByRole('link', { name: 'Download PDF' })).toHaveAttribute(
      'href',
      '/cv.pdf',
    );
    await expect(rail.getByRole('link', { name: 'Download PDF' })).toHaveAttribute(
      'download',
      'Ryan-Parker-CV.pdf',
    );
    await expect(rail.getByRole('link', { name: 'Read the blog' })).toHaveAttribute(
      'href',
      '/blog/',
    );
    const stats = rail.locator('.stats');
    await expect(stats).toContainText('5+');
    await expect(stats).toContainText('Senior Data Engineer (Team Lead)');
    await expect(stats).toContainText('FPT Software · Since Aug 2026');
    await expect(stats).toContainText('7');
    await expect(stats).toContainText('engineers led');
    // Spoken languages live in the rail; there is no Languages card in the canvas.
    await expect(rail.locator('.langs')).toContainText(
      'English — Professional working proficiency',
    );
    await expect(page.locator('.canvas')).not.toContainText('Languages');
    await expect(rail.getByRole('link', { name: 'Email' })).toHaveAttribute(
      'href',
      'mailto:ryanparker.p.97@gmail.com',
    );
    await expect(rail.getByRole('link', { name: 'Mobile' })).toHaveAttribute(
      'href',
      'tel:+84963378831',
    );
    await expect(rail.getByRole('link', { name: 'LinkedIn' })).toBeVisible();
    await expect(rail.getByRole('link', { name: 'GitHub' })).toBeVisible();
  });

  test('the section index highlights the section in view', async ({ page }) => {
    await page.setViewportSize(size(1440, 900));
    await page.goto('/');
    const index = page.locator('[data-section-index]');
    await expect(index).toBeVisible();
    await expect(index.locator('a')).toHaveText([
      'Skills',
      'Work & writing',
      'STAR stories',
      'Contact',
    ]);
    await expect(index.locator('a').first()).toHaveAttribute('href', '#skills');
    for (const [id, label] of [
      ['work', 'Work & writing'],
      ['contact', 'Contact'],
      ['skills', 'Skills'],
    ]) {
      await page.evaluate((i) => document.getElementById(i)!.scrollIntoView(), id);
      await expect(index.locator('a[aria-current="location"]')).toHaveText(label);
    }
    await index.getByRole('link', { name: 'STAR stories' }).click();
    await expect(page).toHaveURL(/#stories$/);
  });

  test('hides the section index, then the languages, on short viewports', async ({ page }) => {
    await page.setViewportSize(size(1440, 700));
    await page.goto('/');
    await expect(page.locator('[data-section-index]')).toBeHidden();
    await expect(page.locator('.rail .langs')).toBeVisible();
    await page.setViewportSize(size(1440, 600));
    await expect(page.locator('.rail .langs')).toBeHidden();
  });
});

test.describe('Technical skills', () => {
  test('one card per category in order, with icon, description and chips', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('#skills [data-skill-card]');
    await expect(cards).toHaveCount(SKILLS.length);
    await expect(cards.locator('h3')).toHaveText(SKILLS); // DOM order is the `order` field
    for (const card of await cards.all()) {
      await expect(card.locator('svg[data-skill-icon]')).toBeVisible();
      expect(((await card.locator('p').first().textContent()) ?? '').length).toBeGreaterThan(20);
      expect(await card.locator('ul li').count()).toBeGreaterThan(1);
    }
    const cloud = cards.filter({ hasText: 'Cloud Platform' });
    await expect(cloud.locator('li.chip:not(.chip-sm)')).toHaveText(['AWS', 'Azure']);
    await expect(cloud.locator('li.chip-sm')).toHaveText([
      'EMR',
      'S3',
      'Athena',
      'Redshift',
      'Lake Formation',
      'Databricks',
    ]);
    await expect(page.getByRole('link', { name: 'See where I used them →' })).toHaveAttribute(
      'href',
      '/experiences/',
    );
  });

  for (const [width, columns] of [
    [1440, 3],
    [800, 2],
    [400, 1],
  ] as const) {
    test(`balances into ${columns} column(s) at ${width}px`, async ({ page }) => {
      await page.setViewportSize(size(width));
      await page.goto('/');
      const xs = await page
        .locator('#skills [data-skill-card]')
        .evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().x)));
      const distinct = [...new Set(xs)];
      if (columns === 3) expect(distinct.length).toBeGreaterThanOrEqual(3);
      else expect(distinct.length).toBe(columns);
    });
  }

  test('wide cards (2x1, 2x2) span about two columns on desktop and one on tablet', async ({
    page,
  }) => {
    await page.setViewportSize(size(1440));
    await page.goto('/');
    const width = (name: string) =>
      page
        .locator('[data-skill-card]', { hasText: name })
        .first()
        .evaluate((e) => e.getBoundingClientRect().width);
    const wide = await width('Data Engineering');
    const narrow = await width('Cloud Platform');
    expect(wide).toBeGreaterThan(narrow * 1.8);
    await page.setViewportSize(size(800));
    expect(
      Math.abs((await width('Data Engineering')) - (await width('Cloud Platform'))),
    ).toBeLessThan(2);
  });

  for (const width of [375, 800, 1100, 1440, 1920]) {
    test(`no skill card is more than 24px taller than its content at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(size(width));
      await page.goto('/');
      const slack = await page.locator('[data-skill-card]').evaluateAll((els) =>
        els.map((card) => {
          const cs = getComputedStyle(card);
          const first = card.firstElementChild!.getBoundingClientRect();
          const last = card.lastElementChild!.getBoundingClientRect();
          const inner = last.bottom - first.top;
          return (
            card.getBoundingClientRect().height -
            inner -
            parseFloat(cs.paddingTop) -
            parseFloat(cs.paddingBottom)
          );
        }),
      );
      for (const s of slack) expect(s).toBeLessThanOrEqual(24);
    });
  }

  test('cards lift on hover with a pointer', async ({ page, browserName }) => {
    test.skip(browserName !== 'chromium', 'hover media query support differs in WebKit automation');
    await page.setViewportSize(size(1440));
    await page.goto('/');
    const card = page.locator('#skills [data-skill-card]').nth(1);
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveCSS('opacity', '1');
    await card.hover();
    await expect(card).toHaveCSS('scale', '1.01');
  });
});

test.describe('Work & writing', () => {
  test('lists the featured project, latest writing and certifications side by side', async ({
    page,
  }) => {
    await page.setViewportSize(size(1440));
    await page.goto('/');
    const work = page.locator('#work');
    await expect(work.locator('h3')).toHaveText([
      'Featured project',
      'Latest writing',
      'Certifications',
    ]);
    await expect(work.getByRole('link', { name: 'Agentic Coding Workflow' })).toHaveAttribute(
      'href',
      '/projects/#agentic-coding-workflow',
    );
    await expect(work.getByRole('link', { name: 'All projects →' })).toHaveAttribute(
      'href',
      '/projects/',
    );
    await expect(work.locator('.chip', { hasText: 'Personal' })).toBeVisible();
    await expect(
      work.getByRole('link', { name: /Neovim setup guide, Part 1/ }).first(),
    ).toBeVisible();
    await expect(work.getByRole('link', { name: 'Neovim setup guide · Part 1' })).toHaveAttribute(
      'href',
      '/blog/series/neovim-setup-guide/',
    );
    await expect(work.getByRole('link', { name: 'All posts →' })).toHaveAttribute('href', '/blog/');
    await work.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900); // let the reveal animation finish
    const boxes = await work
      .locator('article.card')
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
    expect(new Set(boxes.map((b) => Math.round(b.top))).size).toBeLessThanOrEqual(2); // aligned at the top
    expect(boxes[0].right).toBeLessThan(boxes[1].left);
    expect(boxes[1].right).toBeLessThan(boxes[2].left);
    // Cards are not stretched to equal height.
    expect(new Set(boxes.map((b) => Math.round(b.height))).size).toBeGreaterThan(1);
  });

  test('2 columns on tablet with the project spanning both, 1 column on mobile', async ({
    page,
  }) => {
    await page.setViewportSize(size(800));
    await page.goto('/');
    const cards = page.locator('#work article.card');
    const [a, b, c] = await cards.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()));
    expect(a.width).toBeGreaterThan(b.width * 1.8);
    expect(Math.abs(b.top - c.top)).toBeLessThan(2);
    await page.setViewportSize(size(400));
    const xs = await cards.evaluateAll(
      (els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().x))).size,
    );
    expect(xs).toBe(1);
  });

  test('lists certifications newest first with monogram fallbacks and no Verify link without a URL', async ({
    page,
  }) => {
    await page.goto('/');
    const certs = page.locator('#certifications [data-cert-card]');
    await expect(page.locator('#certifications')).toBeVisible();
    await expect(certs).toHaveCount(2);
    await expect(certs.locator('.name')).toHaveText([
      'Datadog Certified: Datadog Fundamentals',
      'AWS Certified Solutions Architect – Associate',
    ]);
    await expect(certs.locator('[data-monogram]')).toHaveText(['DD', 'AWS']);
    await expect(certs.locator('.chip')).toHaveText(['2023', '2022']);
    await expect(certs.getByRole('link')).toHaveCount(0);
  });
});

test.describe('Featured STAR stories and contact', () => {
  test('3 stories use 3 columns; each links to its story and is marked Sample', async ({
    page,
  }) => {
    await page.setViewportSize(size(1440));
    await page.goto('/');
    const stories = page.locator('#stories li.card');
    await expect(stories).toHaveCount(3);
    const lefts = await stories.evaluateAll(
      (els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().x))).size,
    );
    expect(lefts).toBe(3);
    await expect(stories.first().getByRole('link')).toHaveAttribute('href', /\/star\/.+\//);
    await expect(stories.first().locator('.chip-butter')).toHaveText('Sample');
    await expect(page.getByRole('link', { name: 'All stories →' })).toHaveAttribute(
      'href',
      '/star/',
    );
  });

  test('stories go to 2 columns on tablet and 1 on mobile', async ({ page }) => {
    const columns = () =>
      page
        .locator('#stories li.card')
        .evaluateAll(
          (els) => new Set(els.map((e) => Math.round(e.getBoundingClientRect().x))).size,
        );
    await page.setViewportSize(size(800));
    await page.goto('/');
    expect(await columns()).toBe(2);
    await page.setViewportSize(size(400));
    expect(await columns()).toBe(1);
  });

  test('the contact band is compact at 1440px and a centred block with icons below 1280px', async ({
    page,
  }) => {
    await page.setViewportSize(size(1440));
    await page.goto('/');
    const band = (await page.locator('#contact [data-block]').boundingBox())!;
    expect(band.height).toBeLessThanOrEqual(160);
    await expect(page.locator('#contact').getByRole('link', { name: 'Email me' })).toHaveAttribute(
      'href',
      'mailto:ryanparker.p.97@gmail.com',
    );
    await expect(page.locator('#contact .social')).toBeHidden();
    await page.setViewportSize(size(1100));
    await expect(page.locator('#contact .social')).toBeVisible();
  });
});

test.describe('Deep links and metadata', () => {
  for (const id of ['skills', 'certifications']) {
    test(`/#${id} scrolls below the sticky nav`, async ({ page }) => {
      await page.goto(`/#${id}`);
      await page.waitForTimeout(300);
      const top = (await page.locator(`#${id}`).boundingBox())!.y;
      expect(top).toBeGreaterThanOrEqual(52);
      expect(top).toBeLessThan(130);
    });
  }

  test('Experiences "Skills & certifications →" lands on #skills', async ({ page }) => {
    await page.goto('/experiences/');
    await page.getByRole('link', { name: 'Skills & certifications →' }).click();
    await expect(page).toHaveURL(/\/#skills$/);
    await expect(page.locator('#skills')).toBeInViewport();
  });

  test('has Person JSON-LD on Home and Experiences and Open Graph tags', async ({ page }) => {
    for (const path of ['/', '/experiences/']) {
      await page.goto(path);
      const ld = JSON.parse(
        (await page.locator('script[type="application/ld+json"]').first().textContent()) ?? '{}',
      );
      expect(ld['@type']).toBe('Person');
      expect(ld.telephone).toBe('+84963378831');
      await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
        'content',
        'https://jomatran97.github.io/og-default.png',
      );
      await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute(
        'content',
        'summary_large_image',
      );
    }
  });

  test('blog posts have BlogPosting JSON-LD', async ({ page }) => {
    await page.goto('/blog/neovim-setup-1-zero-to-editor/');
    const ld = JSON.parse(
      (await page.locator('script[type="application/ld+json"]').first().textContent()) ?? '{}',
    );
    expect(ld['@type']).toBe('BlogPosting');
    expect(ld.inLanguage).toBe('en');
  });

  test('Vietnamese home mirrors the layout, is translated and has no banner', async ({ page }) => {
    await page.setViewportSize(size(1440));
    await page.goto('/vi/');
    await expect(page.getByRole('note')).toHaveCount(0);
    await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('main h2')).toHaveText([
      'Kỹ năng chuyên môn',
      'Công việc & bài viết',
      'Câu chuyện STAR nổi bật',
      'Cùng trò chuyện',
    ]);
    await expect(page.locator('#skills [data-skill-card] h3').first()).toHaveText(
      'Kỹ thuật dữ liệu',
    );
    await expect(page.locator('aside.rail .langs')).toContainText('Tiếng Anh');
    await expect(page.getByRole('link', { name: 'Tải PDF' })).toHaveAttribute('href', '/vi/cv.pdf');
    await expect(page.locator('[data-section-index] a')).toHaveText([
      'Kỹ năng',
      'Công việc & bài viết',
      'Câu chuyện STAR',
      'Liên hệ',
    ]);
    await expect(page.locator('link[hreflang="vi"]')).toHaveCount(1);
  });
});
