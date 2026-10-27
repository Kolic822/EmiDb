import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButton } from '@angular/material/button';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription } from '@angular/material/expansion';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { type FieldDef, type FieldGroup, fieldLabel, groupLabel, PICKUP_GROUPS, PICKUP_SET_GROUPS, WIRING_DIAGRAM_GROUPS } from '@emidb/shared';
import { LanguageService, TranslatePipe } from '../../core/i18n';
import { ColumnDefaults } from '../../core/column-defaults';
import { Updates } from '../../core/updates';
import { API_BASE } from '../../core/http/crud-api';
import { ACCENTS, THEME_MODES, ThemeService } from '../../core/theme';
import type { ListState } from '../../shared/list-state/list-state';
import { FileSizePipe } from '../../shared/pipes/file-size.pipe';
import { PageHeader } from '../../shared/page-header/page-header';
import { PickupSetListState } from '../pickup-sets/pickup-set-list-state';
import { PickupListState } from '../pickups/pickup-list-state';
import { WiringDiagramListState } from '../wiring-diagrams/wiring-diagram-list-state';

interface TableSettings {
  label: string;
  state: ListState<any>;
  groups: readonly FieldGroup[];
}

@Component({
  selector: 'app-settings',
  imports: [PageHeader, FileSizePipe, MatButton, MatButtonToggleGroup, MatButtonToggle, MatCheckbox, MatIcon, MatTooltip, TranslatePipe, MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle, MatExpansionPanelDescription],
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Settings {
  protected readonly theme = inject(ThemeService);
  protected readonly language = inject(LanguageService);
  protected readonly accents = ACCENTS;
  protected readonly modes = THEME_MODES;
  private readonly defaults = inject(ColumnDefaults);
  protected readonly updates = inject(Updates);
  protected readonly version = toSignal(
    inject(HttpClient).get<{ version: string; commit: string | null }>(`${API_BASE}/version`),
  );

  protected readonly storage = toSignal(
    inject(HttpClient).get<{
      fileCount: number;
      filesBytes: number;
      databaseBytes: number;
      freeBytes: number | null;
      totalBytes: number | null;
    }>(`${API_BASE}/storage`),
  );

  protected readonly tables: TableSettings[] = [
    { label: 'Pickups', state: inject(PickupListState), groups: PICKUP_GROUPS },
    { label: 'Sets', state: inject(PickupSetListState), groups: PICKUP_SET_GROUPS },
    { label: 'Wiring diagrams', state: inject(WiringDiagramListState), groups: WIRING_DIAGRAM_GROUPS },
  ];

  /** Current default columns per table, from the ListState's view of the saved defaults. */
  protected readonly selected = computed(() =>
    Object.fromEntries(
      this.tables.map((table) => [
        table.state.storageKey,
        new Set(this.defaults.resolve(table.state.storageKey, table.state.builtInKeys())),
      ]),
    ),
  );

  protected label(field: FieldDef<any>): string {
    return fieldLabel(field);
  }

  protected sections(table: TableSettings): { id: string; label: string; fields: FieldDef<any>[] }[] {
    return table.groups
      .map((group) => ({ ...group, label: groupLabel(group), fields: table.state.columnFields.filter((f) => f.group === group.id) }))
      .filter((group) => group.fields.length);
  }

  protected isCustom(table: TableSettings): boolean {
    return this.defaults.isCustom(table.state.storageKey);
  }

  protected toggle(table: TableSettings, key: string): void {
    const current = this.defaults.resolve(table.state.storageKey, table.state.builtInKeys());
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    this.apply(table, next);
  }

  protected useBuiltIn(table: TableSettings): void {
    this.defaults.set(table.state.storageKey, null);
    table.state.resetColumns();
  }

  /** Saves the default and applies it to the table right away. */
  private apply(table: TableSettings, keys: string[]): void {
    this.defaults.set(table.state.storageKey, keys);
    table.state.visibleKeys.set(keys);
  }
}
