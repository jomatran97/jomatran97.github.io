import { expect, test } from '@playwright/test';

test.describe('desktop nav', () => {
  test('lists Experiences, Projects, STAR, Blog in order', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('header nav.links a');
    await expect(links).toHaveText(['Experiences', 'Projects', 'STAR', 'Blog']);
  });

  for (const [path, label] of [
    ['/projects/', 'Projects'],
    ['/vi/projects/', 'Dự án'],
    ['/experiences/', 'Experiences'],
  ] as const) {
    test(`marks ${label} as current on ${path}`, async ({ page }) => {
      await page.goto(path);
      const current = page.locator('header nav.links a[aria-current="page"]');
      await expect(current).toHaveCount(1);
      await expect(current).toHaveText(label);
    });
  }
});

test.describe('mobile sheet', () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test('opens, moves focus into the sheet, marks the current page and closes on Escape', async ({
    page,
  }) => {
    await page.goto('/projects/');
    const button = page.getByRole('button', { name: 'Menu' });
    const sheet = page.locator('#mobile-sheet');
    await expect(sheet).toBeHidden();
    await expect(page.locator('header nav.links')).toBeHidden();
    await button.click();
    await expect(sheet).toBeVisible();
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await expect(sheet.locator('a').first()).toBeFocused();
    await expect(sheet.locator('a')).toHaveText(['Experiences', 'Projects', 'STAR', 'Blog']);
    await expect(sheet.locator('a[aria-current="page"]')).toHaveText('Projects');
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(button).toBeFocused();
  });

  test('keeps theme and language controls visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-theme-toggle]')).toBeVisible();
    await expect(page.locator('.lang-switch')).toBeVisible();
  });
});
