import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatChip, MatChipRemove, MatChipSet } from '@angular/material/chips';
import { MatFormField, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatTooltip } from '@angular/material/tooltip';
import { type Criterion, describeCriterion, type FieldDef, fieldLabel, isEmptyCriterion } from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';
import { LookupService } from '../../core/lookups';
import { ListState } from '../list-state/list-state';

/** Quick search, active filter chips and bulk actions for a list page. */
@Component({
  selector: 'app-list-toolbar',
  imports: [FormsModule, MatFormField, MatPrefix, MatSuffix, MatInput, MatIcon, MatIconButton, MatButton, MatChipSet, MatChip, MatChipRemove, MatTooltip, TranslatePipe],
  templateUrl: './list-toolbar.html',
  styleUrl: './list-toolbar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListToolbar<T extends { id: number }> {
  private readonly lookups = inject(LookupService);

  readonly state = input.required<ListState<T>>();
  /** Translated placeholder, e.g. "Search pickups…". */
  readonly searchPlaceholder = input.required<string>();
  readonly delete = output<void>();

  protected readonly selectionCount = computed(() => this.state().selection().size);

  protected readonly chips = computed(() => {
    const state = this.state();
    const resolve = this.lookups.resolver();
    const criteria = state.criteria() as Record<string, Criterion | undefined>;
    return state.fields
      .filter((field) => !isEmptyCriterion(criteria[field.key]))
      .map((field) => ({
        field: field as FieldDef<T>,
        name: fieldLabel(field),
        label: describeCriterion(field, criteria[field.key]!, resolve),
      }));
  });
}
