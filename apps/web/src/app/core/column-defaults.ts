import { Injectable } from '@angular/core';
import { storedSignal } from './storage';

/** User-chosen default columns per table, used by "Reset to default". */
@Injectable({ providedIn: 'root' })
export class ColumnDefaults {
  private readonly saved = storedSignal<Record<string, string[]>>('columns.defaults', {});

  resolve(tableKey: string, builtIn: string[]): string[] {
    return this.saved()[tableKey] ?? builtIn;
  }

  isCustom(tableKey: string): boolean {
    return tableKey in this.saved();
  }

  set(tableKey: string, keys: string[] | null): void {
    this.saved.update((all) => {
      const next = { ...all };
      if (keys) next[tableKey] = keys;
      else delete next[tableKey];
      return next;
    });
  }
}
