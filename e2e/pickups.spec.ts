import { expect, test, type Page } from '@playwright/test';

const row = (page: Page, name: string) => page.locator('app-data-table tbody tr', { hasText: name });

test.describe('Pickups table', () => {
  test('lists seeded pickups with default columns', async ({ page }) => {
    await page.goto('/pickups');
    await expect(page.getByRole('heading', { name: 'Pickups' })).toBeVisible();
    await expect(page.getByText('21 pickups')).toBeVisible();
    await expect(row(page, 'SH-4 JB')).toContainText('Seymour Duncan');
    await expect(page.locator('app-data-table thead')).toContainText('Resistance');
    await expect(page.locator('app-data-table thead')).not.toContainText('Gauss');
  });

  test('quick search narrows the rows', async ({ page }) => {
    await page.goto('/pickups');
    await page.getByPlaceholder('Search pickups…').fill('dimarzio');
    await expect(page.locator('app-data-table tbody tr')).toHaveCount(3);
    await expect(page.getByText('3 of 21 pickups')).toBeVisible();
  });

  test('sorts by clicking a column header', async ({ page }) => {
    await page.goto('/pickups');
    await page.getByRole('button', { name: /^Resistance/ }).click();
    const first = page.locator('app-data-table tbody tr').first();
    await expect(first).toContainText('Fluence Modern Humbucker');
    await page.getByRole('button', { name: /^Resistance/ }).click();
    await expect(first).toContainText('SH-4 JB');
  });

  test('column picker shows and hides columns and remembers the choice', async ({ page }) => {
    await page.goto('/pickups');
    await page.getByRole('button', { name: 'Columns' }).click();
    await page.getByRole('checkbox', { name: 'Gauss' }).check();
    await page.getByRole('checkbox', { name: 'Year' }).uncheck();
    await page.keyboard.press('Escape');
    await expect(page.locator('app-data-table thead')).toContainText('Gauss');
    await expect(page.locator('app-data-table thead')).not.toContainText('Year');

    await page.reload();
    await expect(page.locator('app-data-table thead')).toContainText('Gauss');

    await page.getByRole('button', { name: 'Columns' }).click();
    await page.getByRole('button', { name: 'Reset to default' }).click();
    await page.keyboard.press('Escape');
    await expect(page.locator('app-data-table thead')).toContainText('Year');
  });

  test('column filter popover filters by enum', async ({ page }) => {
    await page.goto('/pickups');
    await page.locator('th', { hasText: 'Type' }).hover();
    await page.getByRole('button', { name: 'Filter type' }).click();
    await page.locator('.column-filter').getByRole('combobox').click();
    await page.getByRole('option', { name: 'Single coil', exact: true }).click();
    await page.keyboard.press('Escape');
    await page.keyboard.press('Escape');
    await expect(page.getByText('Type: Single coil')).toBeVisible();
    await expect(page.locator('app-data-table tbody tr')).toHaveCount(7);
  });
});

test.describe('Filter view', () => {
  test('matches numeric values within a tolerance and carries over to the table', async ({ page }) => {
    await page.goto('/pickups/filter');
    const resistance = page.locator('app-filter-field', { hasText: 'Resistance' });
    await resistance.getByRole('spinbutton').first().fill('8');
    await resistance.getByRole('spinbutton').last().fill('0.5');
    await expect(page.getByText('6 of 21 pickups match')).toBeVisible();

    await page.getByRole('link', { name: 'Show in table' }).click();
    await expect(page).toHaveURL(/\/pickups$/);
    await expect(page.getByText('Resistance ≈ 8 ± 0.5 kΩ')).toBeVisible();
    await expect(page.locator('app-data-table tbody tr')).toHaveCount(6);

    await page.getByRole('button', { name: 'Clear all' }).click();
    await expect(page.getByText('21 pickups')).toBeVisible();
  });
});

test.describe('Compare', () => {
  test('highlights highest and lowest values', async ({ page }) => {
    await page.goto('/pickups');
    await row(page, 'SH-4 JB').getByRole('checkbox').check();
    await row(page, 'SH-2 Jazz').getByRole('checkbox').check();
    await page.getByRole('button', { name: 'Compare' }).click();
    await expect(page).toHaveURL(/\/pickups\/compare\?ids=/);

    const resistance = page.locator('tr', { hasText: 'Resistance' }).first();
    await expect(resistance.locator('td.high')).toHaveText(/16\.4/);
    await expect(resistance.locator('td.low')).toHaveText(/7\.7/);

    await page.getByRole('switch', { name: 'Only differences' }).click();
    await expect(page.locator('tr', { hasText: 'Activity' })).toHaveCount(0);
  });
});

test.describe('Create and edit', () => {
  test('creates a pickup, shows it in the table, edits and deletes it', async ({ page }) => {
    await page.goto('/pickups/new');
    await page.getByLabel('Name').fill('Test Bucker');
    await page.getByLabel('Manufacturer').click();
    await page.getByRole('option', { name: 'Gibson' }).click();
    await page.getByLabel('Resistance').fill('9.1');
    await page.getByLabel('Gauss').fill('500');
    await expect(page.getByLabel('Tesla')).toHaveValue('0.05');
    await page.getByLabel('Potted').click();
    await page.getByRole('option', { name: 'Yes' }).click();
    await page.locator('app-attachments-panel input[type=file]').setInputFiles({
      name: 'photo.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64',
      ),
    });
    await expect(page.getByText('Uploaded when you save')).toBeVisible();
    await page.getByRole('button', { name: 'Create pickup' }).click();

    await expect(page.getByRole('heading', { name: 'Test Bucker' })).toBeVisible();
    await expect(page.locator('app-page-header')).toContainText('Gibson');
    await expect(page.locator('app-entity-details')).toContainText('Potted');
    await expect(page.locator('app-attachments-panel .tile', { hasText: 'photo.png' })).toBeVisible();

    await page.getByRole('link', { name: 'Edit' }).click();
    await page.getByLabel('Name').fill('Test Bucker II');
    await page.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('heading', { name: 'Test Bucker II' })).toBeVisible();

    await page.getByRole('button', { name: 'Delete pickup' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expect(page).toHaveURL(/\/pickups$/);
    await expect(row(page, 'Test Bucker')).toHaveCount(0);
  });

  test('uploads, previews and deletes an attachment', async ({ page }) => {
    await page.goto('/pickups/1');
    await page.locator('app-attachments-panel input[type=file]').setInputFiles({
      name: 'wiring.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64',
      ),
    });
    const tile = page.locator('app-attachments-panel .tile', { hasText: 'wiring.png' });
    await expect(tile).toBeVisible();
    await expect(tile.locator('img')).toBeVisible();

    await tile.locator('.thumb').click();
    await expect(page.locator('app-attachment-preview img')).toBeVisible();
    await page.getByRole('button', { name: 'Close' }).click();

    await tile.hover();
    await tile.getByRole('button', { name: 'Remove' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
    await expect(tile).toHaveCount(0);
  });
});

test.describe('Compare search', () => {
  test('adds a pickup through the searchable box', async ({ page }) => {
    await page.goto('/pickups/compare?ids=1');
    const box = page.getByPlaceholder('Add pickup…');
    await box.fill('jazz');
    await page.getByRole('option', { name: /SH-2 Jazz/ }).click();
    await expect(page).toHaveURL(/ids=1,2$/);
    await expect(page.locator('thead')).toContainText('SH-2 Jazz');
    await expect(box).toHaveValue('');
  });
});

test.describe('Dropdowns', () => {
  test('search filters a dropdown and a new manufacturer can be added inline', async ({ page }) => {
    await page.goto('/pickups/new');
    await page.locator('mat-label', { hasText: /^Manufacturer$/ }).click();
    const search = page.getByRole('listbox').getByPlaceholder('Search…');
    await search.fill('gib');
    await expect(page.getByRole('option', { name: 'Gibson' })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Fender' })).toHaveCount(0);

    await search.fill('Lace Sensor');
    await page.getByRole('option', { name: 'Add “Lace Sensor”' }).click();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('“Lace Sensor” added')).toBeVisible();
    await expect(page.getByLabel('Manufacturer')).toContainText('Lace Sensor');

    await page.goto('/manufacturers');
    await expect(page.locator('tbody tr', { hasText: 'Lace Sensor' })).toBeVisible();
  });
});

test.describe('Duplicate', () => {
  test('opens a prefilled copy from the detail page and from the table row', async ({ page }) => {
    await page.goto('/pickups/1');
    await page.getByRole('link', { name: 'Duplicate' }).click();
    await expect(page).toHaveURL(/\/pickups\/new\?from=1$/);
    await expect(page.getByLabel('Name')).toHaveValue('SH-4 JB (copy)');
    await expect(page.getByLabel('Resistance')).toHaveValue('16.4');
    await page.getByRole('button', { name: 'Create pickup' }).click();
    await expect(page.getByRole('heading', { name: 'SH-4 JB (copy)' })).toBeVisible();

    await page.goto('/pickups');
    const row = page.locator('app-data-table tbody tr', { hasText: 'SH-2 Jazz' });
    await row.hover();
    await row.getByRole('button', { name: 'Duplicate' }).click();
    await expect(page).toHaveURL(/\/pickups\/new\?from=2$/);
    await expect(page.getByLabel('Name')).toHaveValue('SH-2 Jazz (copy)');
  });
});

test.describe('PDF preview', () => {
  test('renders pages with pdf.js instead of relying on the browser viewer', async ({ page }) => {
    await page.goto('/pickups/2');
    await page.locator('app-attachments-panel input[type=file]').setInputFiles('e2e/fixtures/sample.pdf');
    const tile = page.locator('app-attachments-panel .tile', { hasText: 'sample.pdf' });
    await expect(tile.locator('app-pdf-thumbnail canvas')).toBeVisible();

    await tile.locator('.thumb').click();
    await expect(page.locator('app-pdf-viewer canvas').first()).toBeVisible();
    await expect(page.locator('app-attachment-preview iframe')).toHaveCount(0);
    await page.getByRole('button', { name: 'Close' }).click();
  });
});

test.describe('Trash', () => {
  test('deleted entries can be undone, restored from the trash page and purged', async ({ page }) => {
    await page.request.post('/api/pickups', { data: { name: 'Trash Test Pickup' } });
    await page.goto('/pickups');
    const row = page.locator('app-data-table tbody tr', { hasText: 'Trash Test Pickup' });
    const deleteIt = async () => {
      await row.getByRole('checkbox').check();
      await page.getByRole('button', { name: 'Delete', exact: true }).click();
      await page.getByRole('dialog').getByRole('button', { name: 'Delete' }).click();
      await expect(row).toHaveCount(0);
    };

    // Undo straight after deleting.
    await deleteIt();
    await page.getByRole('button', { name: 'Undo' }).click();
    await expect(row).toBeVisible();

    // Delete again, find it in the trash and restore it.
    await deleteIt();
    await page.getByRole('link', { name: 'Trash' }).click();
    const entry = page.locator('.row', { hasText: 'Trash Test Pickup' });
    await expect(entry).toContainText('Pickup');
    await entry.getByRole('button', { name: 'Restore' }).click();
    await expect(entry).toHaveCount(0);
    await page.getByRole('link', { name: 'Pickups' }).click();
    await expect(row).toBeVisible();

    // Delete once more and remove it for good.
    await deleteIt();
    await page.getByRole('link', { name: 'Trash' }).click();
    await entry.getByRole('button', { name: 'Delete permanently' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete permanently' }).click();
    await expect(entry).toHaveCount(0);
  });
});
