import { Controller, Get } from '@nestjs/common';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { API_ROOT, config } from '../config.js';

export interface VersionInfo {
  version: string;
  commit: string | null;
  /** Identifies the web build being served; changes with every deploy, so open apps can offer a reload. */
  build: string | null;
}

/** Which build is running, so an update can be confirmed from Settings. */
@Controller('version')
export class VersionController {
  private readonly version = readVersion();
  private readonly commit = readCommit();

  @Get()
  get(): VersionInfo {
    return { version: this.version, commit: this.commit, build: readBuild() };
  }
}

function readVersion(): string {
  try {
    const pkg = JSON.parse(readFileSync(path.join(API_ROOT, '..', '..', 'package.json'), 'utf8')) as { version?: string };
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

function readCommit(): string | null {
  const repo = path.resolve(API_ROOT, '..', '..');
  if (!existsSync(path.join(repo, '.git'))) {
    // Hosted builds have no .git; Railway and Render expose the commit through an env variable.
    const sha = process.env.GIT_COMMIT ?? process.env.RAILWAY_GIT_COMMIT_SHA ?? process.env.RENDER_GIT_COMMIT;
    return sha ? sha.slice(0, 7) : null;
  }
  try {
    return execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: repo, encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

/** Hash of the served index.html: it names the hashed bundles, so it changes whenever the app does. */
function readBuild(): string | null {
  try {
    return createHash('sha1').update(readFileSync(path.join(config.webDist, 'index.html'))).digest('hex').slice(0, 10);
  } catch {
    return null;
  }
}
