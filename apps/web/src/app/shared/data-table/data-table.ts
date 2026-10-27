import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuContent, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { type Criterion, type FieldDef, isEmptyCriterion, isNumericField } from '@emidb/shared';
import { LookupService } from '../../core/lookups';
import { EmptyState } from '../empty-state/empty-state';
import { FilterField } from '../filter-field/filter-field';
import { ListState } from '../list-state/list-state';
import { FieldValuePipe } from '../pipes/field-value.pipe';

/**
 * Dense data table driven by field metadata and a ListState:
 * sortable headers, per-column filter popovers, row selection, sticky header.
 */
@Component({
  selector: 'app-data-table',
  imports: [
    MatCheckbox,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuContent,
    MatMenuTrigger,
    MatProgressBar,
    MatTooltip,
    FilterField,
    FieldValuePipe,
    EmptyState,
  ],
  templateUrl: './data-table.html',
  styleUrl: './data-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTable<T extends { id: number }> {
  protected readonly lookups = inject(LookupService);

  readonly state = input.required<ListState<T>>();
  readonly rows = input.required<readonly T[]>();
  readonly totalCount = input<number>();
  readonly loading = input(false);
  readonly selectable = input(true);
  readonly emptyTitle = input('Nothing here yet');
  readonly emptyMessage = input<string>();
  readonly rowClick = output<T>();

  protected readonly fields = computed(() => this.state().visibleFields());
  protected readonly selection = computed(() => this.state().selection());
  protected readonly sort = computed(() => this.state().sort());
  protected readonly criteria = computed(() => this.state().criteria());
  protected readonly resolver = computed(() => this.lookups.resolver());

  protected readonly allSelected = computed(() => {
    const rows = this.rows();
    const selection = this.selection();
    return rows.length > 0 && rows.every((row) => selection.has(row.id));
  });
  protected readonly someSelected = computed(() => {
    const selection = this.selection();
    return !this.allSelected() && this.rows().some((row) => selection.has(row.id));
  });

  protected isNumeric(field: FieldDef<T>): boolean {
    return isNumericField(field);
  }

  protected criterionFor(field: FieldDef<T>): Criterion | undefined {
    return this.criteria()[field.key];
  }

  protected hasFilter(field: FieldDef<T>): boolean {
    return !isEmptyCriterion(this.criterionFor(field));
  }

  protected setCriterion(field: FieldDef<T>, criterion: Criterion | undefined): void {
    this.state().setCriterion(field.key, criterion);
  }

  protected toggleAll(): void {
    const state = this.state();
    if (this.allSelected()) state.clearSelection();
    else state.setSelection(this.rows().map((row) => row.id));
  }

  protected cellClass(field: FieldDef<T>, value: unknown): string {
    if (this.isNumeric(field)) return 'num';
    if (field.kind === 'boolean') return `bool ${value == null ? 'unknown' : value ? 'yes' : 'no'}`;
    return '';
  }
}
