import { ChangeDetectionStrategy, Component, computed, inject, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { type Criterion, type FieldDef, fieldLabel, isNumericField } from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';
import { LookupService } from '../../core/lookups';

/**
 * One filter control for a field, chosen by field kind:
 * text contains · enum/lookup "any of" · number ± tolerance · yes/no.
 */
@Component({
  selector: 'app-filter-field',
  imports: [FormsModule, MatFormField, MatLabel, MatPrefix, MatSuffix, MatInput, MatSelect, MatOption, TranslatePipe],
  templateUrl: './filter-field.html',
  styleUrl: './filter-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterField {
  private readonly lookups = inject(LookupService);

  readonly field = input.required<FieldDef<any>>();
  readonly criterion = model<Criterion | undefined>();
  /** Compact layout for header menus (no floating label). */
  readonly compact = input(false);

  protected readonly label = computed(() => fieldLabel(this.field()));

  protected readonly kind = computed(() => {
    const field = this.field();
    if (isNumericField(field)) return 'number';
    if (field.kind === 'enum' || this.lookups.isLookup(field)) return 'in';
    if (field.kind === 'boolean') return 'boolean';
    return 'text';
  });

  protected readonly options = computed<readonly { value: string | number; label: string }[]>(() => {
    const field = this.field();
    if (field.kind === 'enum') return field.enumDef?.options ?? [];
    return this.lookups.options(field);
  });

  protected readonly text = computed(() => {
    const c = this.criterion();
    return c?.kind === 'text' ? c.value : '';
  });
  protected readonly selected = computed(() => {
    const c = this.criterion();
    return c?.kind === 'in' ? [...c.values] : [];
  });
  protected readonly near = computed(() => {
    const c = this.criterion();
    return c?.kind === 'near' ? c.value : null;
  });
  protected readonly tolerance = computed(() => {
    const c = this.criterion();
    return c?.kind === 'near' ? (c.tolerance ?? null) : null;
  });
  protected readonly bool = computed(() => {
    const c = this.criterion();
    return c?.kind === 'boolean' ? c.value : null;
  });

  protected setText(value: string): void {
    this.criterion.set(value.trim() ? { kind: 'text', value } : undefined);
  }

  protected setSelected(values: (string | number)[]): void {
    this.criterion.set(values.length ? { kind: 'in', values } : undefined);
  }

  protected setNear(value: number | null, tolerance: number | null): void {
    if (value == null || Number.isNaN(value)) {
      this.criterion.set(undefined);
      return;
    }
    this.criterion.set({ kind: 'near', value, tolerance: tolerance ?? undefined });
  }

  protected setBool(value: boolean | null | undefined): void {
    this.criterion.set(value == null ? undefined : { kind: 'boolean', value });
  }
}
