import { expect, test } from '@playwright/test';

test('wiring diagram shows pots, switches and can be created with components', async ({ page }) => {
  await page.goto('/wiring-diagrams');
  await expect(page.getByText('5 wiring diagrams')).toBeVisible();
  await page.locator('tbody tr', { hasText: 'Les Paul standard' }).click();
  await expect(page.getByRole('heading', { name: 'Les Paul standard' })).toBeVisible();
  await expect(page.getByText('500k audio, 500k audio').first()).toBeVisible();
  await expect(page.getByText('3-way toggle', { exact: true })).toBeVisible();

  await page.goto('/wiring-diagrams/new');
  await page.getByLabel('Name').fill('Test HSS');
  await page.getByLabel('Wiring type').click();
  await page.getByRole('option', { name: 'Guitar wiring' }).click();
  await page.getByRole('button', { name: 'Add volume pot' }).click();
  await page.locator('.multi', { hasText: 'Volume pots' }).getByRole('combobox').click();
  await page.getByRole('option', { name: '250k audio' }).click();
  await page.getByRole('button', { name: 'Add switch' }).click();
  await page.locator('.multi', { hasText: 'Switches' }).getByRole('combobox').click();
  await page.getByRole('option', { name: '5-way blade' }).click();
  await page.getByRole('button', { name: 'Create wiring diagram' }).click();

  await expect(page.getByRole('heading', { name: 'Test HSS' })).toBeVisible();
  await expect(page.locator('app-entity-details')).toContainText('250k audio');
  await expect(page.locator('app-entity-details')).toContainText('5-way blade');
});

test('set detail shows its pickups side by side', async ({ page }) => {
  await page.goto('/sets');
  await page.locator('tbody tr', { hasText: 'Hot Rodded Humbucker Set' }).click();
  await expect(page.locator('.slot', { hasText: 'Neck' })).toContainText('SH-2 Jazz');
  await expect(page.locator('.slot', { hasText: 'Bridge' })).toContainText('SH-4 JB');
  await page.getByRole('link', { name: 'Compare pickups' }).click();
  await expect(page).toHaveURL(/\/pickups\/compare\?ids=2,1/);
});

test('manufacturers are edited in a dialog and rejected when the name is taken', async ({ page }) => {
  await page.goto('/manufacturers');
  await page.getByRole('button', { name: 'New manufacturer' }).click();
  await page.getByLabel('Name', { exact: true }).fill('Gibson');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.getByText('An entry with that name already exists')).toBeVisible();
  await page.getByLabel('Name', { exact: true }).fill('Test Pickups Co');
  await page.getByRole('button', { name: 'Create' }).click();
  await expect(page.locator('tbody tr', { hasText: 'Test Pickups Co' })).toBeVisible();
});

test('settings switch dark mode and accent, and define default columns', async ({ page }) => {
  await page.goto('/settings');
  await page.getByRole('radio', { name: 'Dark' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('radio', { name: 'Sky' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-accent', 'sky');

  const pickups = page.locator('.table-block').filter({ has: page.getByRole('heading', { name: 'Pickups' }) });
  await pickups.getByRole('checkbox', { name: 'Gauss' }).check();
  await pickups.getByRole('checkbox', { name: 'Position' }).uncheck();

  await page.goto('/pickups');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('app-data-table thead')).toContainText('Gauss');
  await expect(page.locator('app-data-table thead')).not.toContainText('Position');

  await page.goto('/settings');
  await page
    .locator('.table-block')
    .filter({ has: page.getByRole('heading', { name: 'Pickups' }) })
    .getByRole('button', { name: 'Use built-in defaults' })
    .click();
  await page.goto('/pickups');
  await expect(page.locator('app-data-table thead')).toContainText('Position');
});
