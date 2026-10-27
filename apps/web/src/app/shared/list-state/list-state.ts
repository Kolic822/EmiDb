import { computed, inject, type Signal, signal, type WritableSignal } from '@angular/core';
import {
  applyCriteria,
  compareByField,
  countActiveCriteria,
  type Criteria,
  type Criterion,
  type FieldDef,
  isEmptyCriterion,
  type LookupResolver,
  matchesQuery,
} from '@emidb/shared';
import { ColumnDefaults } from '../../core/column-defaults';
import { storedSignal } from '../../core/storage';

export interface SortState {
  key: string;
  direction: 'asc' | 'desc';
}

/**
 * Everything a list page remembers about how the user looks at a collection:
 * quick search, per-column criteria, sort, visible columns and selection.
 * Column visibility is persisted; the rest lives for the session so the
 * table and the filter view share one set of criteria.
 */
export class ListState<T extends { id: number }> {
  readonly query = signal('');
  readonly criteria = signal<Criteria<T>>({});
  readonly sort = signal<SortState | null>(null);
  readonly selection = signal<ReadonlySet<number>>(new Set());
  readonly visibleKeys: WritableSignal<string[]>;
  readonly visibleFields: Signal<FieldDef<T>[]>;
  /** Pinned side columns the user switched off: `files` (attachments) and/or `actions` (edit / duplicate). */
  readonly hiddenPinned: WritableSignal<string[]>;
  /** Filter view sections the user has folded away. */
  readonly collapsedFilterGroups: WritableSignal<string[]>;
  readonly activeCriteriaCount = computed(() => countActiveCriteria(this.criteria()));
  private readonly defaults = inject(ColumnDefaults);

  constructor(
    readonly fields: readonly FieldDef<T>[],
    /** Identifies the table in local storage and in Settings › Default columns. */
    readonly storageKey: string,
    private readonly resolver: Signal<LookupResolver>,
  ) {
    this.visibleKeys = storedSignal<string[]>(`${storageKey}.columns`, this.defaultKeys());
    this.hiddenPinned = storedSignal<string[]>(`${storageKey}.hiddenPinned`, []);
    this.collapsedFilterGroups = storedSignal<string[]>(`${storageKey}.filterCollapsed`, []);
    this.visibleFields = computed(() => {
      const visible = new Set(this.visibleKeys());
      return this.columnFields.filter((field) => visible.has(field.key));
    });
  }

  /** Fields that can be shown as table columns. */
  get columnFields(): FieldDef<T>[] {
    return this.fields.filter((field) => field.column !== false && !field.transient);
  }

  get filterableFields(): FieldDef<T>[] {
    return this.fields.filter((field) => field.filterable !== false && !field.transient);
  }

  /** Rows filtered by criteria + quick search and sorted. */
  view(source: Signal<readonly T[]>): Signal<T[]> {
    const filtered = computed(() => {
      const resolve = this.resolver();
      const query = this.query();
      const rows = applyCriteria(source(), this.criteria());
      return query ? rows.filter((row) => matchesQuery(row, this.fields, query, resolve)) : rows;
    });
    return computed(() => {
      const sort = this.sort();
      const rows = filtered();
      if (!sort) return rows;
      const field = this.fields.find((f) => f.key === sort.key);
      return field ? rows.slice().sort(compareByField(field, sort.direction, this.resolver())) : rows;
    });
  }

  setCriterion(key: keyof T & string, criterion: Criterion | undefined): void {
    this.criteria.update((criteria) => {
      const next = { ...criteria };
      if (isEmptyCriterion(criterion)) delete next[key];
      else next[key] = criterion;
      // Fields that only apply up to a count (pot 3 needs at least 3 pots) lose their filter when the count drops.
      for (const field of this.fields) {
        if (field.showWhen?.key !== key || !(field.key in next)) continue;
        const count = next[key];
        if (count?.kind !== 'near' || count.value < field.showWhen.min) delete next[field.key as keyof T & string];
      }
      return next;
    });
  }

  clearCriteria(): void {
    this.criteria.set({});
    this.query.set('');
  }

  toggleSort(key: string): void {
    this.sort.update((sort) => {
      if (sort?.key !== key) return { key, direction: 'asc' };
      return sort.direction === 'asc' ? { key, direction: 'desc' } : null;
    });
  }

  toggleSelected(id: number): void {
    this.selection.update((selection) => {
      const next = new Set(selection);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  setSelection(ids: Iterable<number>): void {
    this.selection.set(new Set(ids));
  }

  clearSelection(): void {
    this.selection.set(new Set());
  }

  toggleFilterGroup(groupId: string): void {
    this.collapsedFilterGroups.update((ids) =>
      ids.includes(groupId) ? ids.filter((id) => id !== groupId) : [...ids, groupId],
    );
  }

  /** Back to the user's saved default (Settings), or the built-in one. */
  resetColumns(): void {
    this.visibleKeys.set(this.defaultKeys());
    this.hiddenPinned.set([]);
  }

  /** Remember the current columns as this table's default. */
  saveColumnsAsDefault(): void {
    this.defaults.set(this.storageKey, this.visibleKeys());
  }

  builtInKeys(): string[] {
    return this.fields.filter((field) => field.defaultColumn).map((field) => field.key);
  }

  private defaultKeys(): string[] {
    return this.defaults.resolve(this.storageKey, this.builtInKeys());
  }
}
