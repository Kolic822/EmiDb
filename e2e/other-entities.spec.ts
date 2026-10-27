import { expect, test } from '@playwright/test';

test('wiring diagram shows pots, switches and can be created with components', async ({ page }) => {
  await page.goto('/wiring-diagrams');
  await expect(page.getByText('11 wiring diagrams')).toBeVisible();
  await page.locator('tbody tr', { hasText: 'Les Paul standard' }).click();
  await expect(page.getByRole('heading', { name: 'Les Paul standard' })).toBeVisible();
  await expect(page.locator('app-entity-details')).toContainText('Pot 4');
  await expect(page.locator('app-entity-details')).not.toContainText('Pot 5');
  await expect(page.getByText('Three Way Toggle', { exact: true })).toBeVisible();

  await page.goto('/wiring-diagrams/new');
  await page.getByLabel('Name').fill('Test HSS');
  await page.getByLabel('Wiring type').click();
  await page.getByRole('option', { name: 'Guitar wiring' }).click();
  await expect(page.getByLabel('Pot 1', { exact: true })).toHaveCount(0);
  // Clicking a field's label is how Material opens an (empty) select. A layout preset fills count and roles.
  await page.locator('mat-label', { hasText: /^Layout$/ }).click();
  await page.getByRole('option', { name: 'Volume + tone', exact: true }).click();
  await expect(page.getByLabel('Pots', { exact: true })).toContainText('2');
  await expect(page.getByLabel('Pot 1', { exact: true })).toContainText('Volume');
  await expect(page.getByLabel('Pot 2', { exact: true })).toContainText('Tone');
  await expect(page.getByLabel('Pot 3', { exact: true })).toHaveCount(0);
  // Guitar wiring narrows the pickup type list to guitar types.
  await page.locator('mat-label', { hasText: /^Neck$/ }).click();
  await page.getByRole('listbox').getByPlaceholder('Search…').fill('bass');
  await expect(page.getByRole('option', { name: 'Jazz Bass', exact: true })).toHaveCount(0);
  await page.getByRole('listbox').getByPlaceholder('Search…').fill('P90');
  await page.getByRole('option', { name: 'P90', exact: true }).click();
  await page.locator('mat-label', { hasText: /^Pot 1 type$/ }).click();
  await page.getByRole('option', { name: '250k audio' }).click();
  await page.locator('mat-label', { hasText: /^Pot 2 function$/ }).click();
  await page.getByRole('option', { name: 'Push-push' }).click();
  await page.getByRole('button', { name: 'Add switch' }).click();
  await page.locator('.multi', { hasText: 'Switches' }).getByRole('combobox').click();
  await page.getByRole('option', { name: 'Five Way Blade', exact: true }).click();
  await page.getByRole('button', { name: 'Create wiring diagram' }).click();

  await expect(page.getByRole('heading', { name: 'Test HSS' })).toBeVisible();
  await expect(page.locator('app-entity-details')).toContainText('250k audio');
  await expect(page.locator('app-entity-details')).toContainText('P90');
  await expect(page.locator('app-entity-details')).toContainText('Push-push');
  await expect(page.locator('app-entity-details')).toContainText('Five Way Blade');
});

test('wiring diagrams filter by the function of a specific pot position', async ({ page }) => {
  await page.goto('/wiring-diagrams/filter');
  await page.locator('mat-label', { hasText: /^Pot 2 function$/ }).click();
  await page.getByRole('option', { name: 'Push-pull' }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByText(/^1 of \d+ diagrams match$/)).toBeVisible();
  await expect(page.locator('app-data-table tbody')).toContainText('HH coil split push-pull');
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

  const pickups = page.locator('mat-expansion-panel').filter({ hasText: 'Pickups' }).first();
  await pickups.getByRole('button', { name: /Pickups/ }).click();
  await pickups.getByRole('checkbox', { name: 'Gauss' }).check();
  await pickups.getByRole('checkbox', { name: 'Position' }).uncheck();

  await page.goto('/pickups');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('app-data-table thead')).toContainText('Gauss');
  await expect(page.locator('app-data-table thead')).not.toContainText('Position');

  await page.goto('/settings');
  const panel = page.locator('mat-expansion-panel').filter({ hasText: 'Pickups' }).first();
  await panel.getByRole('button', { name: /Pickups/ }).click();
  await panel.getByRole('button', { name: 'Use built-in defaults' }).click();
  await page.goto('/pickups');
  await expect(page.locator('app-data-table thead')).toContainText('Position');
});

test('a pot layout can be created with positions and a sketch', async ({ page }) => {
  await page.goto('/components');
  await page.getByRole('tab', { name: 'Pot layouts' }).click();
  await page.getByRole('button', { name: 'New pot layout' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name', { exact: true }).fill('Test 1V 1T');
  await dialog.getByRole('button', { name: 'Add position' }).click();
  await dialog.locator('.multi-row').nth(0).getByRole('combobox').click();
  await page.getByRole('option', { name: 'Volume' }).click();
  await dialog.getByRole('button', { name: 'Add position' }).click();
  await dialog.locator('.multi-row').nth(1).getByRole('combobox').click();
  await page.getByRole('option', { name: 'Tone' }).click();
  await dialog.locator('app-attachments-panel input[type=file]').setInputFiles({
    name: 'sketch.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64',
    ),
  });
  await dialog.getByRole('button', { name: 'Create' }).click();
  const row = page.locator('tbody tr', { hasText: 'Test 1V 1T' });
  await expect(row).toContainText('Volume, Tone');
  await expect(row.getByRole('button', { name: 'Open sketch.png' })).toBeVisible();
});
