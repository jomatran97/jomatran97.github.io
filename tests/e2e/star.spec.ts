import { expect, test } from '@playwright/test';

test.describe('STAR', () => {
  test('groups stories by role and ends with Other / Personal', async ({ page }) => {
    await page.goto('/star/');
    const groups = page.locator('section.group h2');
    await expect(groups).toHaveText([
      'FPT Software',
      'Datum / Security Bank',
      'Datum / TymeX',
      'Other / Personal',
    ]);
    await expect(page.locator('section#fpt-software-senior-data-engineer')).toBeVisible();
    await expect(page.locator('section#other')).toBeVisible();
  });

  test('Expand all / Collapse all and keyboard toggle', async ({ page }) => {
    await page.goto('/star/');
    const first = page.locator('[data-story]').first();
    await expect(first.locator(':scope > details')).not.toHaveAttribute('open', '');
    await first.locator('summary').first().focus();
    await page.keyboard.press('Enter');
    await expect(first.locator(':scope > details')).toHaveAttribute('open', '');
    await page.getByRole('button', { name: 'Collapse all' }).click();
    await expect(first.locator(':scope > details')).not.toHaveAttribute('open', '');
    await page.getByRole('button', { name: 'Expand all' }).click();
    for (const d of await page.locator('[data-story] > details').all())
      await expect(d).toHaveAttribute('open', '');
    // Situation is open, the other steps are collapsed, and steps are native <details>.
    const steps = first.locator('.step details');
    await expect(steps).toHaveCount(4);
    await expect(steps.nth(0)).toHaveAttribute('open', '');
    await expect(steps.nth(1)).not.toHaveAttribute('open', '');
    await steps.nth(1).locator('summary').click();
    await expect(steps.nth(1)).toHaveAttribute('open', '');
  });

  test('competency filter updates the URL and can be loaded from ?c=', async ({ page }) => {
    await page.goto('/star/');
    await page.getByRole('button', { name: 'Ambiguity' }).click();
    await expect(page).toHaveURL(/\?c=ambiguity$/);
    await expect(page.locator('[data-story]:visible')).toHaveCount(1);
    await expect(page.locator('section.group h2')).toHaveCount(4); // groups are kept
    await page.goBack();
    await expect(page.locator('[data-story]:visible')).toHaveCount(4);
    await page.goto('/star/?c=delivery');
    await expect(page.locator('[data-story]:visible')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Delivery' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('permalink page shows every step open', async ({ page }) => {
    await page.goto('/star/');
    await page.getByRole('link', { name: /Permalink to this story: Sample: Planning/ }).click();
    await expect(page).toHaveURL(/\/star\/talend-to-databricks-migration\/$/);
    const steps = page.locator('.step details');
    await expect(steps).toHaveCount(4);
    for (const s of await steps.all()) await expect(s).toHaveAttribute('open', '');
    await expect(page.getByText('<n> jobs migrated')).toBeVisible();
  });

  test('Experiences timeline links to the role group', async ({ page }) => {
    await page.goto('/experiences/');
    const link = page.getByRole('link', { name: '1 STAR story →' }).first();
    await expect(link).toHaveAttribute('href', '/star/#fpt-software-senior-data-engineer');
    await link.click();
    await expect(page.locator('section#fpt-software-senior-data-engineer')).toBeInViewport();
  });
});

test.describe('STAR samples', () => {
  test('are marked as samples and show their lead note', async ({ page }) => {
    await page.goto('/star/');
    await expect(page.locator('[data-story] .chip-butter', { hasText: 'Sample' })).toHaveCount(4);
    await page.getByRole('button', { name: 'Expand all' }).click();
    await expect(page.locator('[data-story] .lead').first()).toContainText(
      'illustrative sample story',
    );
    await page.goto('/star/talend-to-databricks-migration/');
    await expect(page.locator('h1 ~ p .chip-butter')).toHaveText('Sample');
    await expect(
      page.getByText('illustrative sample story with placeholder metrics'),
    ).toBeVisible();
  });

  test('language switch keeps translated stories and falls back to the section index otherwise', async ({
    page,
  }) => {
    await page.goto('/star/talend-to-databricks-migration/');
    await expect(page.locator('.lang-switch a')).toHaveAttribute(
      'href',
      '/vi/star/talend-to-databricks-migration/',
    );
    await page.goto('/star/deploy-rollback-readiness/');
    await expect(page.locator('.lang-switch a')).toHaveAttribute('href', '/vi/star/');
    // The Vietnamese URL still exists as an English fallback with the banner; switching back keeps the page.
    await page.goto('/vi/star/deploy-rollback-readiness/');
    await expect(page.getByRole('note')).toHaveText('Nội dung này hiện chỉ có bằng tiếng Anh.');
    await expect(page.locator('.lang-switch a')).toHaveAttribute(
      'href',
      '/star/deploy-rollback-readiness/',
    );
  });
});
