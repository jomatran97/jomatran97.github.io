import { expect, test } from '@playwright/test';

test('home loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page).toHaveTitle(/Ryan Parker/);
});

test('404 page returns 404, has no canonical/hreflang and a working language link', async ({
  page,
}) => {
  const res = await page.goto('/does-not-exist/');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Page not found' })).toBeVisible();
  await expect(page.locator('link[rel=canonical], link[hreflang]')).toHaveCount(0);
  await expect(page.locator('.lang-switch a')).toHaveAttribute('href', '/vi/');
});

test('every page has a build-id meta tag', async ({ page }) => {
  await page.goto('/experiences/');
  await expect(page.locator('meta[name=build-id]')).toHaveCount(1);
});

test('old /cv/ URLs redirect to /experiences/', async ({ page }) => {
  await page.goto('/cv/');
  await expect(page).toHaveURL(/\/experiences\/$/);
  await page.goto('/vi/cv/');
  await expect(page).toHaveURL(/\/vi\/experiences\/$/);
});
