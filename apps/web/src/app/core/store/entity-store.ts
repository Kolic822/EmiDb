import { HttpClient } from '@angular/common/http';
import { computed, inject, signal } from '@angular/core';
import type { TrashKind } from '@emidb/shared';
import { firstValueFrom } from 'rxjs';
import { API_BASE, type CrudApi } from '../http/crud-api';

export interface Identified {
  id: number;
}

/**
 * Signal-based cache of one entity collection.
 * Lists are small (a luthier's database, not a warehouse), so every page
 * loads the whole collection once and filters/sorts locally; mutations patch
 * the cache so the UI updates instantly.
 */
export abstract class EntityStore<T extends Identified, TInput> {
  protected abstract readonly api: CrudApi<T, TInput>;
  /** Which trash category deleted entries of this store belong to. */
  abstract readonly trashKind: TrashKind;
  private readonly http = inject(HttpClient);

  private readonly _rows = signal<T[]>([]);
  private readonly _loading = signal(false);
  private readonly _loaded = signal(false);
  private inflight: Promise<void> | null = null;

  readonly rows = this._rows.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  readonly byId = computed(() => new Map(this._rows().map((row) => [row.id, row])));

  /** Refreshes from the server, keeping stale rows visible meanwhile. */
  load(): Promise<void> {
    if (this.inflight) return this.inflight;
    this._loading.set(true);
    this.inflight = this.api
      .list()
      .then((rows) => {
        this._rows.set(rows);
        this._loaded.set(true);
      })
      .finally(() => {
        this._loading.set(false);
        this.inflight = null;
      });
    return this.inflight;
  }

  ensureLoaded(): Promise<void> {
    return this._loaded() ? Promise.resolve() : this.load();
  }

  async get(id: number): Promise<T> {
    const cached = this.byId().get(id);
    if (cached) return cached;
    const row = await this.api.get(id);
    this.upsert(row);
    return row;
  }

  async create(input: TInput): Promise<T> {
    const row = await this.api.create(input);
    this.upsert(row);
    return row;
  }

  async update(id: number, input: TInput): Promise<T> {
    const row = await this.api.update(id, input);
    this.upsert(row);
    return row;
  }

  async remove(ids: number[]): Promise<void> {
    if (!ids.length) return;
    await this.api.remove(ids);
    const gone = new Set(ids);
    this._rows.update((rows) => rows.filter((row) => !gone.has(row.id)));
  }

  /** Takes entries back out of the trash and refreshes the list. */
  async restore(ids: number[]): Promise<void> {
    for (const id of ids) {
      await firstValueFrom(this.http.post<void>(`${API_BASE}/trash/${this.trashKind}/${id}/restore`, {}));
    }
    await this.load();
  }

  protected upsert(row: T): void {
    this._rows.update((rows) => {
      const index = rows.findIndex((r) => r.id === row.id);
      if (index === -1) return [...rows, row];
      const next = rows.slice();
      next[index] = row;
      return next;
    });
  }
}
