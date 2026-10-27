import { inject, Injectable, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { t } from '@emidb/shared';
import { API_BASE } from './http/crud-api';

export type UpdateStatus = 'idle' | 'checking' | 'uptodate' | 'ready' | 'error';

const CHECK_EVERY_MS = 5 * 60_000;

/**
 * Notices when the server serves a newer build than the page was loaded with and offers a reload.
 *
 * The server reports an id of the web build it serves (it changes with every deploy). The app
 * remembers the id it started with and compares on launch, whenever it returns to the foreground,
 * when the network comes back, every few minutes and on demand from Settings. No service worker:
 * it works over plain http (a tablet using the workshop laptop) and can never serve stale files.
 */
@Injectable({ providedIn: 'root' })
export class Updates {
  private readonly snackBar = inject(MatSnackBar);

  readonly status = signal<UpdateStatus>('idle');
  /** Build id when this page loaded; undefined until the first successful check. */
  private loadedBuild: string | null | undefined;
  private offered = false;

  init(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void this.check();
    });
    window.addEventListener('online', () => void this.check());
    setInterval(() => void this.check(), CHECK_EVERY_MS);
    void this.check();
  }

  /** Looks for a new build. Resolves true when one is available. */
  async check(): Promise<boolean> {
    if (this.status() === 'ready') return true;
    this.status.set('checking');
    try {
      const response = await fetch(`${API_BASE}/version`, { cache: 'no-store' });
      if (!response.ok) throw new Error('version check failed');
      const { build } = (await response.json()) as { build: string | null };
      if (build != null && this.loadedBuild === undefined) this.loadedBuild = build;
      const found = build != null && build !== this.loadedBuild;
      if (found) this.offerReload();
      else this.status.set('uptodate');
      return found;
    } catch {
      // Offline or the server is restarting: try again later.
      this.status.set('error');
      return false;
    }
  }

  /** Reloads the page; also how a home-screen app, which has no browser reload button, picks up a new version. */
  reload(): void {
    location.reload();
  }

  private offerReload(): void {
    this.status.set('ready');
    if (this.offered) return;
    this.offered = true;
    this.snackBar
      .open(t('A new version of emidb is available'), t('Reload'), { duration: 0 })
      .onAction()
      .subscribe(() => this.reload());
  }
}
