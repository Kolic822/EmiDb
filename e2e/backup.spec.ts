import { expect, test } from '@playwright/test';

const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

test('a backup can be downloaded and restored, bringing back data and files', async ({ page, request }) => {
  const maker = await (await request.post('/api/manufacturers', { data: { name: 'Backup Probe' } })).json();
  const file = await (
    await request.post('/api/attachments', {
      multipart: { owner: 'manufacturer', ownerId: String(maker.id), file: { name: 'probe.png', mimeType: 'image/png', buffer: PNG } },
    })
  ).json();

  const backup = await request.get('/api/backup');
  expect(backup.ok()).toBe(true);
  expect(backup.headers()['content-type']).toContain('application/zip');
  expect(backup.headers()['content-disposition']).toContain('emidb-backup-');
  const zip = await backup.body();
  expect(zip.subarray(0, 2).toString()).toBe('PK');

  // Changes made after the backup are what a restore should undo.
  await request.post('/api/manufacturers', { data: { name: 'Made After Backup' } });
  await request.delete(`/api/attachments/${file.id}`);
  expect((await request.get(file.url)).status()).toBe(404);

  await page.goto('/settings');
  await expect(page.getByRole('button', { name: 'Download backup' }).or(page.getByRole('link', { name: 'Download backup' }))).toBeVisible();
  await page.locator('input[type=file][accept*=zip]').setInputFiles({ name: 'emidb-backup.zip', mimeType: 'application/zip', buffer: zip });
  await page.getByRole('dialog').getByRole('button', { name: 'Replace everything' }).click();
  await expect(page.getByText(/Backup restored: \d+ pickups, \d+ files/)).toBeVisible();

  const names = ((await (await request.get('/api/manufacturers')).json()) as { name: string }[]).map((m) => m.name);
  expect(names).toContain('Backup Probe');
  expect(names).not.toContain('Made After Backup');
  const restored = await request.get(file.url);
  expect(restored.ok()).toBe(true);
  expect((await restored.body()).equals(PNG)).toBe(true);
});

test('a file that is not a backup is refused and nothing changes', async ({ request }) => {
  const before = ((await (await request.get('/api/manufacturers')).json()) as unknown[]).length;
  const garbage = await request.post('/api/backup/restore', {
    multipart: { file: { name: 'notes.zip', mimeType: 'application/zip', buffer: Buffer.from('definitely not a zip') } },
  });
  expect(garbage.status()).toBe(400);
  expect(await garbage.text()).toContain('not a valid backup zip');

  const wrongType = await request.post('/api/backup/restore', {
    multipart: { file: { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('hi') } },
  });
  expect(wrongType.status()).toBe(400);

  expect(((await (await request.get('/api/manufacturers')).json()) as unknown[]).length).toBe(before);
});

test('a file address is unique to the file, so a reused id can never show a cached old picture', async ({ request }) => {
  const maker = await (await request.post('/api/manufacturers', { data: { name: 'Address Probe' } })).json();
  const upload = async () =>
    (await (
      await request.post('/api/attachments', {
        multipart: { owner: 'manufacturer', ownerId: String(maker.id), file: { name: 'a.png', mimeType: 'image/png', buffer: PNG } },
      })
    ).json()) as { id: number; url: string };

  const first = await upload();
  expect(first.url).toMatch(new RegExp(`^/api/attachments/${first.id}/file/[0-9a-f-]{36}$`));
  expect((await request.get(first.url)).ok()).toBe(true);
  expect((await request.get(`${first.url}?download`)).ok()).toBe(true);
  // The old id-only address still works, but a wrong token for the same id does not.
  expect((await request.get(`/api/attachments/${first.id}/file`)).ok()).toBe(true);
  expect((await request.get(`/api/attachments/${first.id}/file/00000000-0000-0000-0000-000000000000`)).status()).toBe(404);

  const second = await upload();
  expect(second.url).not.toBe(first.url);
});

test('data responses are never cached, files are cached for good', async ({ request }) => {
  expect((await request.get('/api/pickups')).headers()['cache-control']).toBe('no-store');
  expect((await request.get('/api/attachments?owner=pickup&ownerId=1')).headers()['cache-control']).toBe('no-store');
  const maker = await (await request.post('/api/manufacturers', { data: { name: 'Cache Probe' } })).json();
  const file = await (
    await request.post('/api/attachments', {
      multipart: { owner: 'manufacturer', ownerId: String(maker.id), file: { name: 'c.png', mimeType: 'image/png', buffer: PNG } },
    })
  ).json();
  expect((await request.get(file.url)).headers()['cache-control']).toContain('immutable');
});
