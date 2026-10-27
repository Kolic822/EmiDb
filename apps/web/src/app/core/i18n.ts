import { DOCUMENT } from '@angular/common';
import { inject, Injectable, Pipe, type PipeTransform } from '@angular/core';
import { hr, type LanguageId, LANGUAGES, setDictionary, t } from '@emidb/shared';
import { storedSignal } from './storage';

const DICTIONARIES: Partial<Record<LanguageId, Parameters<typeof setDictionary>[0]>> = { hr };

/**
 * UI language. The dictionary is installed once before the first render;
 * changing the language reloads the page so every label picks it up.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  readonly languages = LANGUAGES;
  readonly current = storedSignal<LanguageId>('lang', 'en');

  init(): void {
    const lang = this.current();
    setDictionary(DICTIONARIES[lang] ?? {});
    this.document.documentElement.lang = lang;
  }

  change(lang: LanguageId): void {
    if (lang === this.current()) return;
    this.current.set(lang);
    this.document.location.reload();
  }
}

/** `{{ 'Save changes' | t }}` or `{{ '{count} selected' | t: { count: 3 } }}` */
@Pipe({ name: 't' })
export class TranslatePipe implements PipeTransform {
  transform(source: string, params?: Record<string, string | number>): string {
    return t(source, params);
  }
}

/** Route title resolver: `title: pageTitle('Pickups')`. */
export function pageTitle(source: string): () => string {
  return () => `${t(source)} · emidb`;
}
