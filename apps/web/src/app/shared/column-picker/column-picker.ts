import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import type { FieldDef, FieldGroup } from '@emidb/shared';
import { ListState } from '../list-state/list-state';

/** "Columns" button + menu to show/hide table columns, grouped by section. */
@Component({
  selector: 'app-column-picker',
  imports: [MatButton, MatIcon, MatMenu, MatMenuTrigger, MatCheckbox],
  template: `
    <button mat-stroked-button [matMenuTriggerFor]="menu">
      <mat-icon>view_column</mat-icon>
      Columns
    </button>
    <mat-menu #menu="matMenu" class="column-picker-menu">
      <div class="picker" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()">
        <div class="picker-header">
          <span>{{ visible().size }} of {{ state().columnFields.length }} columns</span>
          <span class="picker-actions">
            <button type="button" class="link-btn" (click)="state().saveColumnsAsDefault()">Save as default</button>
            <button type="button" class="link-btn" (click)="state().resetColumns()">Reset to default</button>
          </span>
        </div>
        <div class="groups">
          @for (group of grouped(); track group.id) {
            <div class="group">
              <div class="group-title">{{ group.label }}</div>
              @for (field of group.fields; track field.key) {
                <mat-checkbox [checked]="visible().has(field.key)" (change)="toggle(field.key)">
                  {{ field.label }}
                </mat-checkbox>
              }
            </div>
          }
        </div>
      </div>
    </mat-menu>
  `,
  styles: `
    .picker {
      padding: 10px 14px 12px;
      min-width: 300px;
    }

    .picker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 8px;
    }

    .picker-actions {
      display: flex;
      gap: 14px;
    }

    .link-btn {
      background: none;
      border: 0;
      padding: 0;
      color: var(--mat-sys-primary);
      font: var(--mat-sys-label-large);
      cursor: pointer;
    }

    .groups {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 4px 20px;
      max-height: 60vh;
      overflow: auto;
    }

    .group-title {
      font: var(--mat-sys-label-small);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--mat-sys-on-surface-variant);
      margin: 8px 0 2px;
    }

    mat-checkbox {
      display: block;
      margin-left: -8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColumnPicker<T extends { id: number }> {
  readonly state = input.required<ListState<T>>();
  readonly groups = input.required<readonly FieldGroup[]>();

  protected readonly visible = computed(() => new Set(this.state().visibleKeys()));
  protected readonly grouped = computed(() =>
    this.groups()
      .map((group) => ({
        ...group,
        fields: this.state().columnFields.filter((field) => field.group === group.id) as FieldDef<T>[],
      }))
      .filter((group) => group.fields.length),
  );

  protected toggle(key: string): void {
    this.state().visibleKeys.update((keys) =>
      keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key],
    );
  }
}
