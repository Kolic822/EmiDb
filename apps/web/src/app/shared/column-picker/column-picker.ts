import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { type FieldDef, type FieldGroup, fieldLabel, groupLabel } from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';
import { ListState } from '../list-state/list-state';

/** "Columns" button + menu to show/hide table columns, grouped by section. */
@Component({
  selector: 'app-column-picker',
  imports: [MatButton, MatIconButton, MatTooltip, MatIcon, MatMenu, MatMenuTrigger, MatCheckbox, TranslatePipe],
  template: `
    <button mat-stroked-button [matMenuTriggerFor]="menu">
      <mat-icon>view_column</mat-icon>
      {{ 'Columns' | t }}
    </button>
    <mat-menu #menu="matMenu" class="column-picker-menu">
      <div class="picker" (click)="$event.stopPropagation()" (keydown)="$event.stopPropagation()">
        <div class="picker-header">
          <span>{{ '{visible} of {total} columns' | t: { visible: visible().size, total: state().columnFields.length } }}</span>
          <span class="picker-actions">
            <button mat-icon-button type="button" (click)="showAll()" [matTooltip]="'Show all' | t" [attr.aria-label]="'Show all' | t">
              <mat-icon>select_all</mat-icon>
            </button>
            <button mat-icon-button type="button" (click)="state().saveColumnsAsDefault()" [matTooltip]="'Save as default' | t" [attr.aria-label]="'Save as default' | t">
              <mat-icon>save</mat-icon>
            </button>
            <button mat-icon-button type="button" (click)="state().resetColumns()" [matTooltip]="'Reset to default' | t" [attr.aria-label]="'Reset to default' | t">
              <mat-icon>restart_alt</mat-icon>
            </button>
          </span>
        </div>
        <div class="groups">
          @for (group of grouped(); track group.id) {
            <div class="group">
              <div class="group-title">{{ groupName(group) }}</div>
              @for (field of group.fields; track field.key) {
                <mat-checkbox [checked]="visible().has(field.key)" (change)="toggle(field.key)">
                  {{ label(field) }}
                </mat-checkbox>
              }
            </div>
          }
          @if (hasFiles() || hasActions()) {
            <div class="group">
              <div class="group-title">{{ 'Side columns' | t }}</div>
              @if (hasFiles()) {
                <mat-checkbox [checked]="pinnedShown('files')" (change)="togglePinned('files')">{{ 'Files' | t }}</mat-checkbox>
              }
              @if (hasActions()) {
                <mat-checkbox [checked]="pinnedShown('actions')" (change)="togglePinned('actions')">{{ 'Edit and duplicate buttons' | t }}</mat-checkbox>
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
      gap: 2px;
      margin: -6px -8px -6px 0;

      .mat-mdc-icon-button {
        --mat-icon-button-state-layer-size: 36px;
        width: 36px;
        height: 36px;
        padding: 6px;
        color: var(--mat-sys-primary);
      }
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
  /** The table has a pinned files column that can be switched off. */
  readonly hasFiles = input(false);
  /** The table has pinned edit / duplicate buttons that can be switched off. */
  readonly hasActions = input(false);

  protected readonly visible = computed(() => new Set(this.state().visibleKeys()));
  protected readonly grouped = computed(() =>
    this.groups()
      .map((group) => ({
        ...group,
        fields: this.state().columnFields.filter((field) => field.group === group.id) as FieldDef<T>[],
      }))
      .filter((group) => group.fields.length),
  );

  protected label(field: FieldDef<T>): string {
    return fieldLabel(field);
  }

  protected groupName(group: FieldGroup): string {
    return groupLabel(group);
  }

  protected showAll(): void {
    this.state().visibleKeys.set(this.state().columnFields.map((field) => field.key));
    this.state().hiddenPinned.set([]);
  }

  protected pinnedShown(key: 'files' | 'actions'): boolean {
    return !this.state().hiddenPinned().includes(key);
  }

  protected togglePinned(key: 'files' | 'actions'): void {
    this.state().hiddenPinned.update((hidden) => (hidden.includes(key) ? hidden.filter((k) => k !== key) : [...hidden, key]));
  }

  protected toggle(key: string): void {
    this.state().visibleKeys.update((keys) =>
      keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key],
    );
  }
}
