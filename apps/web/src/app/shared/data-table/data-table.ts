import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuContent, MatMenuTrigger } from '@angular/material/menu';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { type Attachment, type Criterion, type FieldDef, fieldLabel, isEmptyCriterion, isNumericField } from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';
import { LookupService } from '../../core/lookups';
import { AttachmentButton } from '../attachments/attachment-button';
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
    AttachmentButton,
    TranslatePipe,
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
  /** Shows a pinned column with a button that opens the row's attached files. */
  readonly showAttachments = input(false);
  /** Shows edit / duplicate buttons on hover. */
  readonly showActions = input(false);
  readonly rowClick = output<T>();
  readonly edit = output<T>();
  readonly duplicate = output<T>();

  protected readonly hasAttachmentColumn = computed(() => this.showAttachments());
  protected readonly columnCount = computed(
    () =>
      this.fields().length +
      (this.selectable() ? 1 : 0) +
      (this.hasAttachmentColumn() ? 1 : 0) +
      (this.showActions() ? 1 : 0),
  );

  protected attachmentsOf(row: T): Attachment[] | undefined {
    return (row as { attachments?: Attachment[] }).attachments;
  }

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

  protected label(field: FieldDef<T>): string {
    return fieldLabel(field);
  }

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
