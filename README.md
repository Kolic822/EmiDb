# emidb

A database for guitar luthiers: pickups, pickup sets and wiring diagrams, with the
measurements and construction details needed for repairs and rewinds. Everything is
filterable, sortable and comparable, and files (photos, PDFs, documents, CAD drawings)
can be attached to any entry.

## Stack

| Part | Technology |
| --- | --- |
| `apps/web` | Angular 22 (standalone, signals, zoneless), Angular Material 3 |
| `apps/api` | NestJS 12, SQLite via Drizzle ORM, multer uploads |
| `packages/shared` | Domain enums, models, field metadata and filter logic used by both apps |
| `e2e` | Playwright end-to-end tests |

The API serves the built Angular app in production, so a deployment is a single Node
process plus a data directory (`emidb.db` + `uploads/`).

## Getting started

```bash
npm install
npm run build -w @emidb/shared     # once, and after changing packages/shared
npm run dev                         # API on :3210, web on :4200 (proxied to the API)
```

Seed sample data (at least ten entries of every kind, varied so every filter has something to match) into a
database without pickups:

```bash
npm run build -w api && npm run seed -w api
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs API (watch) and Angular dev server together |
| `npm run build` | Production build of shared, web and api |
| `npm start` | Serves the production build on `PORT` (default 3210) |
| `npm test` | Unit tests for the shared filter/format logic |
| `npm run e2e` | Playwright tests against the production build (`npm run build` first) |
| `npm run lint` | oxlint for the API |
| `npm run db:generate -w api` | Generates a Drizzle migration after editing `apps/api/src/database/schema.ts` |

Migrations in `apps/api/drizzle` run automatically when the API starts.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3210` | API (and UI) port |
| `DATA_DIR` | `apps/api/data` | SQLite file and uploaded files |
| `WEB_DIST` | `apps/web/dist/web/browser` | Built UI to serve; skipped when missing |
| `MAX_UPLOAD_MB` | `25` | Largest single file that can be attached |
| `MAX_RESTORE_MB` | `4096` | Largest backup zip that Restore accepts |
| `APP_PASSWORD` | *(empty)* | When set, everything needs this password (see below) |
| `SESSION_SECRET` | derived from the password | Signs the sign-in cookie; set it to keep sessions across password changes |
| `TRUST_PROXY` | `false` (`true` on Railway/Render) | Use the proxy's client address, so sign-in attempts are throttled per person |

The database file and uploaded files are **not** part of the git repository (`apps/api/data` is
ignored); they live in `DATA_DIR` on whatever machine runs the API, so storage is limited only by
that disk.

### Password

Set `APP_PASSWORD` and the whole API (data, files, backups) refuses requests until someone has
signed in; the app then shows a password screen first. It is one shared password, not user
accounts: a correct password gives a sign-in cookie that lasts 90 days, five wrong attempts lock
that address out for a minute, and **Settings → About → Sign out** ends the session. Changing the
password signs everybody out. Use it for any server reachable from the internet, such as Railway.
On a hosted server the cookie is only sent over https.

### Backup and restore

**Settings → Backup** downloads one zip with a consistent copy of the database and every uploaded
file, and restores such a zip. A restore replaces *all* current data and is applied in one
transaction, so a damaged or unrelated zip is refused and nothing changes. Backups from older versions
of the app can be restored; ones from a newer version are refused. The server keeps no copies by itself,
so download one now and then and keep it away from the server.

### Photos and storage

On phones and tablets the file panel has a **Take photo** button that opens the camera. Large photos
are scaled to at most 2400 px on the longest side before they are uploaded. **Settings → Storage** shows
how much space the files and the database take and how much is free on the disk.

### Guide

**Guide** in the sidebar explains every page with screenshots, in English and Croatian. The text lives in
`packages/shared/src/guide.ts` (with its Croatian translation in `i18n/hr-guide.ts`, checked by a unit test)
and the pictures in `apps/web/public/guide/<language>/`. After changing how a page looks, regenerate the pictures
(they are taken from the sample data on a throw-away database):

```bash
npm run build
GUIDE_SHOTS=1 npx playwright test e2e/guide-screenshots.spec.ts --project=chromium
```

## Workshop setup: one Windows laptop, tablets on the same Wi-Fi

The laptop runs emidb; everything else on the Wi-Fi uses it in a browser. Node.js 22+ must be
installed on the laptop (https://nodejs.org, default options).

1. On the laptop install Git (https://git-scm.com) and clone the repository, e.g. into
   `C:\emidb` (GitHub asks you to sign in once; the credentials are remembered).
   Alternative without Git: run `npm run package` on your machine and copy `release/emidb`
   over; that copy cannot update itself.
2. Double-click `start.bat`. The first run installs and builds (a few minutes) and opens the app.
   Every later start checks GitHub and, if there is a newer version, pulls and rebuilds it first
   (skipped when offline). `update.bat` does the same on demand. Settings shows the running
   version and commit. Open apps notice a new deploy on their own (every few minutes and when
   the tablet wakes) and offer a reload. Windows asks once whether Node.js may accept
   connections; allow it on **private** networks. `allow-firewall.bat` (run as administrator)
   does the same without the prompt.
3. The black window prints two addresses. On the tablet open the **"On this network"** one,
   e.g. `http://192.168.1.23:3210`, and use "Add to Home Screen" so it opens like an app.
   Keep the window open while the app is in use; closing it stops emidb.
4. Optional: double-click `install-autostart.bat` so emidb starts minimised whenever that
   Windows user logs in.

Data (the SQLite file and uploaded files) lives in `apps/api/data` inside the folder, so a
backup is a copy of that folder. Give the laptop a fixed IP in the router if the address keeps
changing. The same scripts work in a plain checkout: the first run installs and builds.

## Deploying

```bash
docker build -t emidb .
docker run -p 3210:3210 -v emidb-data:/data emidb
```

Any Node host works as well: `npm ci && npm run build && npm start`.

**Sample data on a hosted database:** set the variable `SEED_SAMPLE_DATA=true` and redeploy; on start the app
loads the sample data once, and only while there are no pickups. Remove the variable afterwards (otherwise
the sample data returns if every pickup is ever deleted).

**Railway:** the repository contains `railway.json` (Dockerfile build, health check on
`/api/version`). In Railway: *New Project → Deploy from GitHub repo → EmiDb*. Then on the service:
*Variables* → add `DATA_DIR=/data`; *Volume* → mount path `/data` (keeps the database and uploads);
*Settings → Networking → Generate Domain*. Railway injects `PORT` itself. Every push to `main`
redeploys; the volume survives deploys.

**Render:** the repository contains `render.yaml`. In Render choose *New → Blueprint*, pick this
repository, and it creates a Docker web service with a 1 GB persistent disk at `/data`. Every push to
`main` redeploys. Render provides `PORT` itself; the app reads it.
GitHub Actions (`.github/workflows/ci.yml`) lints, builds, unit-tests and runs the
Playwright suite on every push.

## Layout

```
apps/web/src/app
  core/        http client, signal stores, lookups, theme
  layout/      sidebar + appearance menu
  shared/      data table, filters, forms, details, attachments, dialogs
  features/    pickups · pickup-sets · wiring-diagrams · manufacturers · component-types
apps/api/src
  database/    Drizzle schema and connection
  <entity>/    controller · service · dto per entity
  attachments/ upload, streaming and cleanup of files
packages/shared/src
  enums.ts     domain enums (stored keys + labels)
  fields.ts    field metadata driving tables, forms, filters and compare
  filtering.ts criteria matching, quick search, sorting, display formatting
```

Fields are described once in `packages/shared/src/fields.ts`; adding a property to an
entity means adding a column to the schema, a line to the DTO and a field definition.
