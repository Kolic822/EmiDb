/**
 * Builds everything and assembles a ready-to-run copy in release/emidb:
 * the compiled API, the built UI, migrations and the start scripts.
 * Runtime dependencies are installed by the start script on the target
 * machine (the SQLite driver is a native binary, so it must match that
 * machine). The target needs Node.js 22+ and internet access for that first run.
 *
 *   npm run package
 */
import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'release', 'emidb');
const run = (cmd, cwd = root) => execSync(cmd, { cwd, stdio: 'inherit' });

console.log('Building…');
run('npm run build');

console.log(`Assembling ${path.relative(root, out)}…`);
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

const copy = (from, to = from) => cpSync(path.join(root, from), path.join(out, to), { recursive: true });
copy('apps/api/dist');
copy('apps/api/drizzle');
copy('apps/api/package.json');
copy('apps/web/dist');
copy('packages/shared/dist');
copy('packages/shared/package.json');
copy('.npmrc');
copy('start.bat');
copy('start.command');
copy('start.sh');
copy('README.md');

// Root manifest without the web workspace and dev tooling.
const pkg = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
writeFileSync(
  path.join(out, 'package.json'),
  JSON.stringify(
    {
      name: pkg.name,
      version: pkg.version,
      private: true,
      workspaces: ['apps/api', 'packages/shared'],
      scripts: { start: 'node apps/api/dist/main.js', seed: 'node apps/api/dist/seed.js' },
      engines: pkg.engines,
    },
    null,
    2,
  ),
);
// The API's devDependencies are not needed to run it.
const api = JSON.parse(readFileSync(path.join(root, 'apps/api/package.json'), 'utf8'));
delete api.devDependencies;
delete api.scripts;
writeFileSync(path.join(out, 'apps/api/package.json'), JSON.stringify(api, null, 2));

console.log(`\nDone. Copy ${path.relative(root, out)} to the target machine and double-click start.bat (Windows) or start.command (macOS).`);
