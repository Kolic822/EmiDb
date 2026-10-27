// Copies the pdf.js worker next to the app so it is served as a static file
// (the Angular builder cannot pull assets from the hoisted node_modules).
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const packageJson = require.resolve('pdfjs-dist/package.json');
const worker = path.join(path.dirname(packageJson), 'build', 'pdf.worker.min.mjs');
const target = path.join(here, '..', 'public', 'pdf.worker.min.mjs');

if (!existsSync(worker)) throw new Error(`pdf.js worker not found at ${worker}`);
mkdirSync(path.dirname(target), { recursive: true });
copyFileSync(worker, target);
