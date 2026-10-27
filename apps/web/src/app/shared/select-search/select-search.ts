import { ChangeDetectionStrategy, Component, ElementRef, model, viewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '../../core/i18n';

/**
 * Search box rendered as the first row inside a mat-select panel.
 * Key and click events are kept away from the select so typing filters
 * instead of jumping between options.
 */
@Component({
  selector: 'app-select-search',
  imports: [MatIcon, TranslatePipe],
  template: `
    <div class="search" (click)="$event.stopPropagation()" (keydown)="onKeydown($event)">
      <mat-icon>search</mat-icon>
      <input
        #input
        type="text"
        [placeholder]="'Search…' | t"
        [value]="query()"
        (input)="query.set(input.value)"
        autocomplete="off"
        spellcheck="false"
      />
      @if (query()) {
        <button type="button" class="clear" (click)="clear()" [attr.aria-label]="'Clear search' | t">
          <mat-icon>close</mat-icon>
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--mat-sys-surface-container-lowest);
      margin: -6px -6px 4px;
      padding: 6px;
      border-bottom: var(--app-border);
    }

    .search {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 8px;
      height: 36px;
      border-radius: 8px;
      background: var(--mat-sys-surface-container-low);
      color: var(--mat-sys-on-surface-variant);
    }

    mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    input {
      flex: 1;
      min-width: 0;
      border: 0;
      background: transparent;
      outline: none;
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface);
    }

    .clear {
      display: grid;
      place-items: center;
      border: 0;
      background: none;
      padding: 0;
      color: inherit;
      cursor: pointer;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectSearch {
  readonly query = model('');
  private readonly input = viewChild.required<ElementRef<HTMLInputElement>>('input');

  /** Focuses the box for keyboard users; on touch devices the keyboard would cover the list. */
  focus(): void {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    setTimeout(() => this.input().nativeElement.focus());
  }

  protected clear(): void {
    this.query.set('');
    this.input().nativeElement.focus();
  }

  protected onKeydown(event: KeyboardEvent): void {
    // Let Escape close the panel; keep everything else (typing, space, arrows) in the box.
    if (event.key !== 'Escape') event.stopPropagation();
  }
}

/** Case-insensitive "contains" filter that always keeps the currently selected value visible. */
export function filterOptions<O extends { value: string | number; label: string }>(
  options: readonly O[],
  query: string,
  selected: unknown,
): O[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...options];
  return options.filter((option) => option.value === selected || option.label.toLowerCase().includes(q));
}

/** Dropdowns with this many options or more get a search box. */
export const SEARCH_THRESHOLD = 8;
