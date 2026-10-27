import { GUIDE_SECTIONS } from '@emidb/shared';
import { expect, test } from '@playwright/test';

test('the guide sits above settings in the menu and explains every page with pictures', async ({ page }) => {
  await page.goto('/pickups');
  const footer = page.locator('app-sidebar .footer .nav-item');
  await expect(footer).toHaveText([/Guide/, /Settings/]);

  await footer.first().click();
  await expect(page).toHaveURL(/\/guide$/);
  await expect(page.getByRole('heading', { name: 'Guide', level: 1 })).toBeVisible();

  // Contents lists every section; picking one scrolls to it.
  await expect(page.locator('.contents-item')).toHaveCount(GUIDE_SECTIONS.length);
  await page.locator('.contents-item', { hasText: 'Find closest match' }).click();
  await expect(page.locator('section#match')).toBeInViewport();

  // Every screenshot exists and decodes.
  const images = page.locator('section img');
  const count = await images.count();
  expect(count).toBe(GUIDE_SECTIONS.reduce((total, section) => total + section.images.length, 0));
  for (let i = 0; i < count; i++) {
    const image = images.nth(i);
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }

  // A picture opens large.
  await images.first().click();
  await expect(page.getByRole('dialog').getByRole('img')).toBeVisible();
});

test('the guide and its pictures follow the language', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('emidb.lang', JSON.stringify('hr')));
  await page.goto('/guide');
  await expect(page.getByRole('heading', { name: 'Upute', level: 1 })).toBeVisible();
  await expect(page.locator('section#pickups h2')).toContainText('Pickupi');
  await expect(page.locator('section#start img').first()).toHaveAttribute('src', '/guide/hr/login.jpg');
  await expect(page.locator('app-sidebar .footer .nav-item').first()).toContainText('Upute');
});
