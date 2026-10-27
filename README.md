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
npm run dev                         # API on :3000, web on :4200 (proxied to the API)
```

Seed sample data into an empty database:

```bash
npm run build -w api && npm run seed -w api
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs API (watch) and Angular dev server together |
| `npm run build` | Production build of shared, web and api |
| `npm start` | Serves the production build on `PORT` (default 3000) |
| `npm test` | Unit tests for the shared filter/format logic |
| `npm run e2e` | Playwright tests against the production build (`npm run build` first) |
| `npm run lint` | oxlint for the API |
| `npm run db:generate -w api` | Generates a Drizzle migration after editing `apps/api/src/database/schema.ts` |

Migrations in `apps/api/drizzle` run automatically when the API starts.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3000` | API (and UI) port |
| `DATA_DIR` | `apps/api/data` | SQLite file and uploaded files |
| `WEB_DIST` | `apps/web/dist/web/browser` | Built UI to serve; skipped when missing |
| `MAX_UPLOAD_MB` | `25` | Largest single file that can be attached |

The database file and uploaded files are **not** part of the git repository (`apps/api/data` is
ignored); they live in `DATA_DIR` on whatever machine runs the API, so storage is limited only by
that disk. Back them up by copying `DATA_DIR`.

## Running it on a workshop computer

The simplest deployment is a folder and a double-click, with Node.js 22+ installed on that machine:

```bash
npm run package          # builds and assembles release/emidb (API, UI, runtime deps, start scripts)
```

Copy `release/emidb` anywhere on the target machine and double-click `start.bat` (Windows) or
`start.command` (macOS). The first run downloads the runtime dependencies (internet needed once);
after that it starts the server on port 3000 and opens the app in the browser. Closing the
window stops it. Data lives in `apps/api/data` inside that folder, so backing up
means copying the folder. Other devices on the same network can use it at `http://<that-pc>:3000`.

Double-clicking `start.bat` / `start.command` in a plain checkout works too: the first run
installs and builds (a few minutes), later runs start immediately.

## Deploying

```bash
docker build -t emidb .
docker run -p 3000:3000 -v emidb-data:/data emidb
```

Any Node host works as well: `npm ci && npm run build && npm start`.
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
