import { hr } from '@emidb/shared';
import { type APIRequestContext, expect, type Page, test } from '@playwright/test';

/**
 * Regenerates the screenshots of the in-app Guide (apps/web/public/guide/<lang>/*.jpg).
 * Not part of the normal run: GUIDE_SHOTS=1 npx playwright test e2e/guide-screenshots.spec.ts --project=chromium
 * It fills the throw-away e2e database with a few example files first, so the pages look lived in.
 */
test.skip(!process.env['GUIDE_SHOTS'], 'only when regenerating the guide screenshots');
test.describe.configure({ mode: 'serial' });

const OUT = 'apps/web/public/guide';
const AUTH_URL = 'http://localhost:3101';

type Kind = 'photo' | 'sketch' | 'colours';

/** Draws a believable placeholder picture in the browser and returns it as base64 PNG. */
function drawImage(page: Page, kind: Kind): Promise<string> {
  return page.evaluate(async (what) => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 600;
    const c = canvas.getContext('2d')!;
    c.fillStyle = '#fbfaf7';
    c.fillRect(0, 0, 900, 600);
    c.lineWidth = 4;
    c.strokeStyle = '#2c2c2c';
    c.fillStyle = '#2c2c2c';
    c.font = '600 26px sans-serif';
    if (what === 'photo') {
      const g = c.createLinearGradient(0, 0, 900, 600);
      g.addColorStop(0, '#7a5c3b');
      g.addColorStop(1, '#3d2b1a');
      c.fillStyle = g;
      c.fillRect(0, 0, 900, 600);
      c.fillStyle = '#16161a';
      c.fillRect(150, 200, 600, 200);
      c.fillStyle = '#d9d4c7';
      for (let i = 0; i < 6; i++) {
        c.beginPath();
        c.arc(225 + i * 90, 300, 26, 0, Math.PI * 2);
        c.fill();
      }
      c.fillStyle = '#fff';
      c.fillText('Humbucker, back side', 300, 560);
    } else if (what === 'sketch') {
      c.strokeRect(80, 80, 200, 90);
      c.strokeRect(80, 230, 200, 90);
      c.fillText('Neck', 150, 135);
      c.fillText('Bridge', 140, 285);
      for (let i = 0; i < 4; i++) {
        c.beginPath();
        c.arc(520 + (i % 2) * 150, 150 + Math.floor(i / 2) * 150, 50, 0, Math.PI * 2);
        c.stroke();
        c.fillText(i < 2 ? 'Vol' : 'Tone', 495 + (i % 2) * 150, 160 + Math.floor(i / 2) * 150);
      }
      c.beginPath();
      c.moveTo(280, 125);
      c.lineTo(470, 125);
      c.moveTo(280, 275);
      c.lineTo(470, 275);
      c.moveTo(520, 200);
      c.lineTo(520, 230);
      c.stroke();
      c.fillText('Wiring sketch', 330, 560);
    } else {
      const colours = ['#c0392b', '#111', '#f1c40f', '#27ae60', '#fff'];
      const names = ['Start', 'Finish', 'Series', 'Ground', 'Shield'];
      colours.forEach((col, i) => {
        c.fillStyle = col;
        c.fillRect(80, 90 + i * 85, 160, 50);
        c.strokeRect(80, 90 + i * 85, 160, 50);
        c.fillStyle = '#2c2c2c';
        c.fillText(names[i]!, 280, 128 + i * 85);
      });
      c.fillText('Colour code', 330, 560);
    }
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'));
    const bytes = new Uint8Array(await blob.arrayBuffer());
    let binary = '';
    for (const byte of bytes) binary += String.fromCharCode(byte);
    return btoa(binary);
  }, kind);
}

async function attach(request: APIRequestContext, page: Page, owner: string, ownerId: number, kind: Kind, name: string) {
  const png = await drawImage(page, kind);
  const response = await request.post('/api/attachments', {
    multipart: { owner, ownerId: String(ownerId), file: { name, mimeType: 'image/png', buffer: Buffer.from(png, 'base64') } },
  });
  expect(response.ok()).toBe(true);
}

async function idOf(request: APIRequestContext, path: string, name: string): Promise<number> {
  const rows = (await (await request.get(`/api/${path}`)).json()) as { id: number; name: string }[];
  return rows.find((row) => row.name === name)!.id;
}

test('prepare example data', async ({ page, request }) => {
  await page.goto('/pickups');
  const jb = await idOf(request, 'pickups', 'SH-4 JB');
  await attach(request, page, 'pickup', jb, 'photo', 'sh4-back.png');
  await attach(request, page, 'pickup', jb, 'sketch', 'sh4-wiring.png');
  const lp = await idOf(request, 'wiring-diagrams', 'Les Paul standard');
  await attach(request, page, 'wiringDiagram', lp, 'sketch', 'les-paul-wiring.png');
  await attach(request, page, 'manufacturer', await idOf(request, 'manufacturers', 'Gibson'), 'colours', 'gibson-colour-codes.png');
  await attach(request, page, 'manufacturer', await idOf(request, 'manufacturers', 'DiMarzio'), 'colours', 'dimarzio-colour-codes.png');
  const layouts = (await (await request.get('/api/pot-layouts')).json()) as { id: number; name: string }[];
  await attach(request, page, 'potLayout', layouts[4]!.id, 'sketch', 'pot-positions.png');
  // Something in the trash.
  const maker = await (await request.post('/api/manufacturers', { data: { name: 'Old Pickup Co' } })).json();
  await request.delete(`/api/manufacturers/${maker.id}`);
  const draft = await (await request.post('/api/pickups', { data: { name: 'Prototype 3', type: 'HUMBUCKER', resistance: 9.1 } })).json();
  await request.delete(`/api/pickups/${draft.id}`);
});

for (const lang of ['en', 'hr'] as const) {
  test(`screenshots (${lang})`, async ({ browser, request }) => {
    const tr = (source: string) => (lang === 'hr' ? ((hr as Record<string, string>)[source] ?? source) : source);
    const context = await browser.newContext({ baseURL: 'http://localhost:3100', viewport: { width: 1280, height: 800 } });
    await context.addInitScript((value) => localStorage.setItem('emidb.lang', JSON.stringify(value)), lang);
    const page = await context.newPage();
    const shot = async (name: string) => {
      await page.waitForTimeout(500); // menus and dialogs finish animating
      await page.screenshot({ path: `${OUT}/${lang}/${name}.jpg`, type: 'jpeg', quality: 82 });
    };
    const lock = async () => {
      // Make sure the data of the page has arrived (rows or a heading) before taking the picture.
      await page.waitForLoadState('networkidle');
    };

    const jb = await idOf(request, 'pickups', 'SH-4 JB');
    const lp = await idOf(request, 'wiring-diagrams', 'Les Paul standard');
    const hh = await idOf(request, 'wiring-diagrams', 'HH coil split push-pull');
    const setId = await idOf(request, 'pickup-sets', 'Hot Rodded Humbucker Set');
    const jazz = await idOf(request, 'pickups', 'SH-2 Jazz');
    const pafId = await idOf(request, 'pickups', 'PAF 36th Anniversary');

    await page.goto('/pickups');
    await lock();
    await shot('pickups-list');

    await page.getByRole('button', { name: tr('Columns') }).click();
    await shot('columns-menu');
    await page.keyboard.press('Escape');

    await page.locator('th', { hasText: tr('Year') }).locator('.filter-btn').click();
    await shot('column-filter');
    await page.keyboard.press('Escape');

    await page.goto('/pickups/filter');
    await lock();
    const field = (label: string) => page.locator('app-filter-field').filter({ has: page.locator('mat-label', { hasText: new RegExp(`^${tr(label)}$`) }) });
    await field('Resistance').locator('input').first().fill('8');
    await field('Resistance').locator('input').nth(1).fill('1');
    await shot('pickup-filter');

    await page.goto('/pickups/match');
    await lock();
    await page.getByLabel(tr('Resistance')).fill('8.2');
    await page.getByLabel(tr('Inductance')).fill('4.2');
    await shot('pickup-match');

    await page.goto(`/pickups/${jb}`);
    await lock();
    await page.waitForTimeout(800);
    await shot('pickup-detail');

    await page.goto(`/pickups/${jb}/edit`);
    await lock();
    await shot('pickup-form');

    await page.goto(`/pickups/compare?ids=${jb},${jazz},${pafId}`);
    await lock();
    await shot('pickup-compare');

    await page.goto('/sets');
    await lock();
    await shot('sets-list');
    await page.goto(`/sets/${setId}`);
    await lock();
    await shot('set-detail');

    await page.goto('/wiring-diagrams');
    await lock();
    await shot('wiring-list');

    await page.goto('/wiring-diagrams/filter');
    await lock();
    await field('No. of pots').getByRole('combobox').click();
    await page.getByRole('option', { name: '4', exact: true }).click();
    await page.locator('mat-label', { hasText: new RegExp(`^${tr('Pot {n} function').replace('{n}', '2')}$`) }).click();
    await page.getByRole('option', { name: tr('Push-pull') }).click();
    await page.keyboard.press('Escape');
    await shot('wiring-filter');

    await page.goto(`/wiring-diagrams/${lp}`);
    await lock();
    await page.waitForTimeout(800);
    await shot('wiring-detail');

    await page.goto(`/wiring-diagrams/${hh}/edit`);
    await lock();
    await shot('wiring-form');

    await page.goto('/manufacturers');
    await lock();
    await shot('manufacturers');
    await page.locator('tbody tr', { hasText: 'Gibson' }).click();
    await page.waitForTimeout(600);
    await shot('manufacturer-dialog');
    await page.keyboard.press('Escape');

    await page.goto('/components');
    await lock();
    await shot('components-pots');
    await page.getByRole('tab', { name: tr('Switches') }).click();
    await shot('components-switches');
    await page.getByRole('tab', { name: tr('Pot layouts') }).click();
    await shot('components-layouts');

    await page.goto('/library');
    await lock();
    await page.waitForTimeout(600);
    await shot('library');

    await page.goto('/trash');
    await lock();
    await shot('trash');

    await page.goto('/settings');
    await lock();
    await page.locator('mat-expansion-panel').first().getByRole('button').first().click();
    await shot('settings-top');
    await page.locator('.page-scroll').evaluate((el) => (el.scrollTop = el.scrollHeight));
    await shot('settings-bottom');

    await context.close();
  });
}

test('sign-in screen', async ({ browser }) => {
  for (const lang of ['en', 'hr'] as const) {
    const context = await browser.newContext({ baseURL: AUTH_URL, viewport: { width: 1280, height: 800 } });
    await context.addInitScript((value) => localStorage.setItem('emidb.lang', JSON.stringify(value)), lang);
    const page = await context.newPage();
    await page.goto('/pickups');
    await expect(page.locator('app-login')).toBeVisible();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${OUT}/${lang}/login.jpg`, type: 'jpeg', quality: 82 });
    await context.close();
  }
});
