import { networkInterfaces } from 'node:os';
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

test('files attached to a manufacturer show up in the library', async ({ page }) => {
  await page.goto('/manufacturers');
  await page.getByRole('button', { name: 'New manufacturer' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name', { exact: true }).fill('Library Test Maker');
  await dialog.locator('app-attachments-panel input[type=file][multiple]').setInputFiles({
    name: 'colour-codes.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64',
    ),
  });
  await dialog.getByRole('button', { name: 'Create' }).click();
  const row = page.locator('tbody tr', { hasText: 'Library Test Maker' });
  await expect(row.getByRole('button', { name: 'Open colour-codes.png' })).toBeVisible();

  await page.getByRole('link', { name: 'Library' }).click();
  const tile = page.getByRole('button', { name: 'Open colour-codes.png' });
  await expect(tile).toContainText('Library Test Maker');
  await page.getByPlaceholder('Search files…').fill('nothing like this');
  await expect(tile).toHaveCount(0);
  await expect(page.getByText('No files match')).toBeVisible();
  await page.getByPlaceholder('Search files…').fill('library test');
  await tile.click();
  await expect(page.getByRole('dialog').getByRole('img', { name: 'colour-codes.png' })).toBeVisible();
});

test('a large photo is shrunk before upload and storage usage is shown in settings', async ({ page }) => {
  await page.goto('/manufacturers');
  await page.getByRole('button', { name: 'New manufacturer' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name', { exact: true }).fill('Photo Test Maker');

  // A noisy 3600x2400 JPEG, the size of a phone photo, made in the browser.
  const photo = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 3600;
    canvas.height = 2400;
    const context = canvas.getContext('2d')!;
    const image = context.createImageData(3600, 2400);
    for (let i = 0; i < image.data.length; i += 4) {
      image.data[i] = Math.random() * 255;
      image.data[i + 1] = Math.random() * 255;
      image.data[i + 2] = Math.random() * 255;
      image.data[i + 3] = 255;
    }
    context.putImageData(image, 0, 0);
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.95));
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  });
  const original = Buffer.from(photo, 'base64');
  await dialog.locator('app-attachments-panel input[capture]').setInputFiles({
    name: 'bench.jpg',
    mimeType: 'image/jpeg',
    buffer: original,
  });
  // Shrinking takes a moment; the file shows up as a tile once it is ready.
  await expect(dialog.locator('app-attachments-panel .tile', { hasText: 'bench.jpg' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Create' }).click();
  await expect(page.locator('tbody tr', { hasText: 'Photo Test Maker' }).getByRole('button', { name: 'Open bench.jpg' })).toBeVisible();

  const stored = await page.evaluate(async () => {
    const list = (await (await fetch('/api/library')).json()) as { ownerName: string; url: string; size: number }[];
    const item = list.find((entry) => entry.ownerName === 'Photo Test Maker')!;
    const bitmap = await createImageBitmap(await (await fetch(item.url)).blob());
    return { size: item.size, width: bitmap.width, height: bitmap.height };
  });
  expect(Math.max(stored.width, stored.height)).toBeLessThanOrEqual(2400);
  expect(stored.size).toBeLessThan(original.length);

  await page.goto('/settings');
  await expect(page.getByRole('heading', { name: 'Storage' })).toBeVisible();
  await expect(page.getByText(/\d+ files/)).toBeVisible();
});

test('a tall photo opens inside its preview dialog with the close button in reach', async ({ page }) => {
  await page.goto('/manufacturers');
  await page.getByRole('button', { name: 'New manufacturer' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Name', { exact: true }).fill('Tall Photo Maker');
  const tall = await page.evaluate(async () => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 2400;
    const context = canvas.getContext('2d')!;
    const gradient = context.createLinearGradient(0, 0, 0, 2400);
    gradient.addColorStop(0, '#c0392b');
    gradient.addColorStop(1, '#2980b9');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 900, 2400);
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  });
  await dialog.locator('app-attachments-panel input[type=file][multiple]').setInputFiles({
    name: 'tall.png',
    mimeType: 'image/png',
    buffer: Buffer.from(tall, 'base64'),
  });
  await expect(dialog.locator('app-attachments-panel .tile', { hasText: 'tall.png' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Create' }).click();
  await page.locator('tbody tr', { hasText: 'Tall Photo Maker' }).getByRole('button', { name: 'Open tall.png' }).click();

  const preview = page.locator('app-attachment-preview');
  const image = preview.getByRole('img');
  await expect(image).toBeVisible();
  await page.waitForTimeout(600); // let the dialog's opening animation finish before measuring
  const frame = (await page.locator('.mat-mdc-dialog-surface').boundingBox())!;
  const box = (await image.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(frame.y);
  expect(box.y + box.height).toBeLessThanOrEqual(frame.y + frame.height + 1);
  await expect(preview.getByRole('button', { name: 'Close' })).toBeInViewport();
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
  await dialog.locator('app-attachments-panel input[type=file][multiple]').setInputFiles({
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

// A non-loopback address is not a secure context, so no service worker: the same situation as
// a tablet using the workshop laptop over plain http.
const lanAddress = Object.values(networkInterfaces())
  .flat()
  .find((net) => net && net.family === 'IPv4' && !net.internal)?.address;

test('offers a reload over plain http when the server reports a newer build', async ({ browser }) => {
  test.skip(!lanAddress, 'needs a non-loopback network address');
  const context = await browser.newContext({ baseURL: `http://${lanAddress}:3100` });
  const page = await context.newPage();
  let calls = 0;
  await page.route('**/api/version', async (route) => {
    calls += 1;
    await route.fulfill({ json: { version: '0.1.0', commit: null, build: calls === 1 ? 'old-build' : 'new-build' } });
  });
  await page.goto('/pickups');
  await expect(page.getByText('A new version of emidb is available')).toHaveCount(0);

  // Waking the tablet triggers a check.
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  await expect(page.getByText('A new version of emidb is available')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reload' })).toBeVisible();
  await context.close();
});

test('settings show the version and let the user check for updates', async ({ page }) => {
  await page.goto('/settings');
  await expect(page.getByText(/emidb v\d/)).toBeVisible();
  await page.getByRole('button', { name: 'Check for updates' }).click();
  await expect(page.getByText('You have the latest version.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reload app' })).toBeVisible();
});

test('the diagram column on the wiring diagram page can be resized by dragging', async ({ page }) => {
  await page.goto('/wiring-diagrams/1');
  const layout = page.locator('.layout');
  const handle = page.getByRole('separator', { name: 'Resize columns' });
  const detailsWidth = async () => (await page.locator('app-entity-details').boundingBox())!.width;

  const before = await detailsWidth();
  const box = (await handle.boundingBox())!;
  const layoutBox = (await layout.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 40);
  await page.mouse.down();
  await page.mouse.move(layoutBox.x + layoutBox.width * 0.45, box.y + 40, { steps: 6 });
  await page.mouse.up();
  await expect.poll(detailsWidth).toBeLessThan(before - 100);
  const after = await detailsWidth();

  // Remembered after a reload, and double-click restores the default.
  await page.reload();
  await expect.poll(detailsWidth).toBeCloseTo(after, -1);
  await page.getByRole('separator', { name: 'Resize columns' }).dblclick();
  await expect.poll(detailsWidth).toBeGreaterThan(after + 100);
});
