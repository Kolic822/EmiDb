import { signal, type WritableSignal } from '@angular/core';

/**
 * A writable signal persisted to localStorage under `key`.
 * Writes happen synchronously in `set`/`update`, so a value survives even when
 * the page navigates away right after it changed.
 */
export function storedSignal<T>(key: string, fallback: T): WritableSignal<T> {
  const fullKey = `emidb.${key}`;
  const value = signal<T>(read(fullKey, fallback));
  const set = value.set.bind(value);
  value.set = (next: T) => {
    set(next);
    write(fullKey, next);
  };
  value.update = (updater: (current: T) => T) => value.set(updater(value()));
  return value;
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable (private mode, quota) – the in-memory value still works.
  }
}
