import { Controller, Get } from '@nestjs/common';
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { API_ROOT } from '../config.js';

export interface VersionInfo {
  version: string;
  commit: string | null;
}

/** Which build is running, so an update can be confirmed from Settings. */
@Controller('version')
export class VersionController {
  private readonly info: VersionInfo = {
    version: readVersion(),
    commit: readCommit(),
  };

  @Get()
  get(): VersionInfo {
    return this.info;
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
