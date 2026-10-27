// Compiles the package on install when its sources are present (dev checkouts, CI, build stage).
// In a runtime-only install (Docker runtime stage) there are no sources and nothing to do.
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

if (existsSync(new URL('./src', import.meta.url))) {
  execSync('tsc -p tsconfig.json', { stdio: 'inherit', cwd: new URL('.', import.meta.url) });
}
