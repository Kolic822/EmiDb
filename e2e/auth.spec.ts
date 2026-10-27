import { expect, test } from '@playwright/test';

// Runs against a second server started with APP_PASSWORD=workshop-secret (see playwright.config.ts).

test('the API refuses requests without a session, but the version stays public', async ({ request }) => {
  expect((await request.get('/api/pickups')).status()).toBe(401);
  expect((await request.get('/api/attachments?owner=pickup&ownerId=1')).status()).toBe(401);
  expect((await request.get('/api/version')).ok()).toBe(true);
  expect(await (await request.get('/api/auth')).json()).toEqual({ required: true, authenticated: false });
});

test('the app asks for the password, rejects a wrong one and stays signed in after a reload', async ({ page }) => {
  await page.goto('/pickups');
  await expect(page.getByText('Enter the password to open the database.')).toBeVisible();
  await expect(page.locator('app-sidebar')).toHaveCount(0);

  await page.getByLabel('Password').fill('not the password');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('Wrong password')).toBeVisible();
  await expect(page.locator('app-sidebar')).toHaveCount(0);

  await page.getByLabel('Password').fill('workshop-secret');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('21 pickups')).toBeVisible();

  await page.reload();
  await expect(page.getByText('21 pickups')).toBeVisible();
  const cookie = (await page.context().cookies()).find((c) => c.name === 'emidb_session');
  expect(cookie?.httpOnly).toBe(true);
});

test('signing out returns to the password screen', async ({ page }) => {
  await page.goto('/settings');
  await page.getByLabel('Password').fill('workshop-secret');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page.getByText('Enter the password to open the database.')).toBeVisible();
  expect((await page.request.get('/api/pickups')).status()).toBe(401);
});

test('too many wrong passwords lock the sign-in for a minute', async ({ request }) => {
  let status = 0;
  for (let i = 0; i < 7; i++) {
    status = (await request.post('/api/auth/login', { data: { password: `wrong${i}` } })).status();
  }
  expect(status).toBe(429);
});
