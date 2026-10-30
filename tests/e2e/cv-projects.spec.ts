import { expect, test } from '@playwright/test';

test.describe('Experiences', () => {
  test('has header contacts, no projects/skills/certifications, and separate entries for repeated companies', async ({
    page,
  }) => {
    await page.goto('/experiences/');
    await expect(page.locator('a[href="mailto:ryanparker.p.97@gmail.com"]').first()).toBeVisible();
    await expect(page.locator('a[href="tel:+84963378831"]').first()).toBeVisible();
    for (const name of [
      'Selected Projects',
      'Technical Skills',
      'Certifications',
      'Projects',
      'Skills',
    ]) {
      await expect(page.getByRole('heading', { name, exact: true })).toHaveCount(0);
    }
    await expect(page.locator('section[aria-labelledby="experience"] ol > li')).toHaveCount(5);
    await expect(page.getByRole('heading', { name: 'FPT Software', exact: true })).toHaveCount(2);
    await expect(page.getByRole('heading', { name: 'Datum / Security Bank' })).toBeVisible();
    // Month and year-only dates.
    await expect(page.getByText('Aug 2026 – Present')).toBeVisible();
    await expect(page.getByText('2024 – Mar 2026')).toBeVisible();
    await expect(page.getByText('2021 – 2024')).toBeVisible();
  });

  test('links to Projects and Skills & certifications', async ({ page }) => {
    await page.goto('/experiences/');
    await expect(page.getByRole('link', { name: 'Projects →' })).toHaveAttribute(
      'href',
      '/projects/',
    );
    await expect(page.getByRole('link', { name: 'Skills & certifications →' })).toHaveAttribute(
      'href',
      '/#skills',
    );
  });

  for (const [path, pdf] of [
    ['/experiences/', '/cv.pdf'],
    ['/vi/experiences/', '/vi/cv.pdf'],
  ] as const) {
    test(`Download PDF on ${path} points to a real PDF`, async ({ page, request }) => {
      await page.goto(path);
      const link = page.locator('a[download="Ryan-Parker-CV.pdf"]');
      await expect(link).toHaveAttribute('href', pdf);
      const res = await request.get(pdf);
      expect(res.status()).toBe(200);
      expect(res.headers()['content-type']).toContain('application/pdf');
    });
  }

  test('print layout is noindex and has no nav', async ({ page }) => {
    await page.goto('/experiences/print/');
    await expect(page.locator('meta[name=robots]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('header[data-nav]')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Selected Projects' })).toBeVisible();
  });
});

test.describe('Projects', () => {
  test('shows the project card with Details closed, and Expand all / Collapse all', async ({
    page,
  }) => {
    await page.goto('/projects/');
    const details = page.locator('[data-project="agentic-coding-workflow"] details');
    await expect(details).not.toHaveAttribute('open', '');
    await page.getByRole('button', { name: 'Expand all' }).click();
    await expect(details).toHaveAttribute('open', '');
    await expect(page.getByText('Orchestrated Specialist Flows:')).toBeVisible();
    await page.getByRole('button', { name: 'Collapse all' }).click();
    await expect(details).not.toHaveAttribute('open', '');
  });

  test('Details toggles with Enter and Space', async ({ page }) => {
    await page.goto('/projects/');
    const summary = page.locator('[data-project="agentic-coding-workflow"] summary');
    const details = page.locator('[data-project="agentic-coding-workflow"] details');
    await summary.focus();
    await page.keyboard.press('Enter');
    await expect(details).toHaveAttribute('open', '');
    await page.keyboard.press('Space');
    await expect(details).not.toHaveAttribute('open', '');
  });

  test('/projects/#<slug> opens that card', async ({ page }) => {
    await page.goto('/projects/#agentic-coding-workflow');
    await expect(page.locator('[data-project="agentic-coding-workflow"] details')).toHaveAttribute(
      'open',
      '',
    );
  });

  test('?kind= filters, shows the empty state, resets, and works with Back/Forward', async ({
    page,
  }) => {
    await page.goto('/projects/?kind=work');
    await expect(page.getByText('No projects here yet.')).toBeVisible();
    await expect(page.locator('[data-project="agentic-coding-workflow"]')).toBeHidden();
    await page.getByRole('button', { name: 'Show all projects' }).click();
    await expect(page).toHaveURL(/\/projects\/$/);
    await expect(page.locator('[data-project="agentic-coding-workflow"]')).toBeVisible();
    await page.goBack();
    await expect(page.getByText('No projects here yet.')).toBeVisible();
    await page.goForward();
    await expect(page.locator('[data-project="agentic-coding-workflow"]')).toBeVisible();
    // With a single kind the segmented control is hidden altogether.
    await expect(page.locator('[data-kind-filter]')).toHaveCount(0);
    await page.goto('/projects/?kind=personal');
    await expect(page.locator('[data-project="agentic-coding-workflow"]')).toBeVisible();
  });

  test('a deep link to a hidden card resets the filter and keeps the URL in sync', async ({
    page,
  }) => {
    await page.goto('/projects/?kind=work#agentic-coding-workflow');
    await expect(page.locator('[data-project="agentic-coding-workflow"]')).toBeVisible();
    await expect(page).not.toHaveURL(/kind=/);
  });
});
