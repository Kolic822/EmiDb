import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { storedSignal } from './storage';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface Accent {
  id: string;
  label: string;
  /** Swatch colour shown in the picker. */
  color: string;
}

export const ACCENTS: readonly Accent[] = [
  { id: 'coral', label: 'Coral', color: '#f2673d' },
  { id: 'mint', label: 'Mint', color: '#17a87a' },
  { id: 'sky', label: 'Sky', color: '#3b82f6' },
  { id: 'lavender', label: 'Lavender', color: '#8b5cf6' },
  { id: 'rose', label: 'Rose', color: '#ec4f8a' },
];

export const THEME_MODES: readonly { id: ThemeMode; label: string; icon: string }[] = [
  { id: 'system', label: 'Follow device', icon: 'devices' },
  { id: 'light', label: 'Light', icon: 'light_mode' },
  { id: 'dark', label: 'Dark', icon: 'dark_mode' },
];

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = window.matchMedia('(prefers-color-scheme: dark)');
  private readonly deviceDark = signal(this.media.matches);

  readonly mode = storedSignal<ThemeMode>('theme.mode', 'system');
  readonly accent = storedSignal<string>('theme.accent', ACCENTS[0].id);
  readonly isDark = computed(() => (this.mode() === 'system' ? this.deviceDark() : this.mode() === 'dark'));

  init(): void {
    this.media.addEventListener('change', (event) => this.deviceDark.set(event.matches));
    effect(() => {
      const root = this.document.documentElement;
      root.dataset['theme'] = this.isDark() ? 'dark' : 'light';
      root.dataset['accent'] = ACCENTS.some((a) => a.id === this.accent()) ? this.accent() : ACCENTS[0].id;
    });
  }
}
