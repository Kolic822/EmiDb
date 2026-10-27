import { computed, Directive, inject } from '@angular/core';
import { Router } from '@angular/router';
import { type FieldGroup, t } from '@emidb/shared';
import { LookupService } from '../../core/lookups';
import { NotifyService } from '../../core/notify';
import type { EntityStore } from '../../core/store/entity-store';
import { ConfirmService } from '../confirm/confirm';
import type { ListState } from '../list-state/list-state';

/**
 * Common behaviour of every list page (table + toolbar + bulk delete).
 * Subclasses provide the store, list state and groups and reuse `entity-list-page.html`.
 */
@Directive()
export abstract class EntityListBase<T extends { id: number }, TInput> {
  protected abstract readonly store: EntityStore<T, TInput>;
  protected abstract readonly state: ListState<T>;
  protected abstract readonly groups: readonly FieldGroup[];
  /** English source strings; translated at render time. */
  protected abstract readonly noun: string;
  protected abstract readonly nounPlural: string;
  protected abstract readonly title: string;
  protected abstract readonly createLabel: string;
  protected abstract readonly basePath: string;
  protected readonly supportsFilter: boolean = false;
  protected readonly supportsCompare: boolean = false;
  /** Entities that can have files attached get a pinned files column. */
  protected readonly supportsAttachments: boolean = false;

  protected readonly router = inject(Router);
  protected readonly confirm = inject(ConfirmService);
  protected readonly notify = inject(NotifyService);
  private readonly lookups = inject(LookupService);

  // Lazily created so the abstract members exist by the time they are read.
  private _rows?: ReturnType<ListState<T>['view']>;
  protected get rows() {
    return (this._rows ??= this.state.view(this.store.rows));
  }

  protected readonly subtitle = computed(() => {
    const total = this.store.rows().length;
    const shown = this.rows().length;
    const noun = t(this.nounPlural);
    return shown === total ? `${total} ${noun}` : t('{shown} of {total} {noun}', { shown, total, noun });
  });
  protected readonly searchPlaceholder = computed(() => t('Search {noun}…', { noun: t(this.nounPlural) }));
  protected readonly selectedIds = computed(() => [...this.state.selection()]);
  protected readonly canCompare = computed(() => this.selectedIds().length >= 2);

  /** Call from the subclass constructor. */
  protected init(): void {
    void this.store.load();
    void this.lookups.ensureLoaded();
  }

  protected create(): void {
    void this.router.navigate([this.basePath, 'new']);
  }

  protected open(row: T): void {
    void this.router.navigate([this.basePath, row.id]);
  }

  protected compare(): void {
    void this.router.navigate([this.basePath, 'compare'], { queryParams: { ids: this.selectedIds().join(',') } });
  }

  protected async deleteSelected(): Promise<void> {
    const ids = this.selectedIds();
    if (!(await this.confirm.confirmDelete(ids.length, this.noun))) return;
    await this.store.remove(ids);
    this.state.clearSelection();
    this.notify.success(
      ids.length === 1
        ? t('{noun} deleted', { noun: capitalise(t(this.noun)) })
        : t('{count} {noun}s deleted', { count: ids.length, noun: t(this.nounPlural) }),
    );
  }
}

export function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
