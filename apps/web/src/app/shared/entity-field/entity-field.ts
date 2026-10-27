import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal } from '@angular/core';
import { type FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { type FieldDef, isNumericField } from '@emidb/shared';
import { LookupService } from '../../core/lookups';

type Control = 'text' | 'textarea' | 'number' | 'select' | 'select-multi' | 'boolean';

/** Small bounded integers (1–3 pickups, 0–3 pots) are easier to pick from a list. */
const SELECT_MAX_RANGE = 6;

/** Renders the right Material control for a field definition bound to a FormControl. */
@Component({
  selector: 'app-entity-field',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatError, MatSuffix, MatInput, MatSelect, MatOption, MatIcon, MatIconButton],
  templateUrl: './entity-field.html',
  styleUrl: './entity-field.scss',
  host: { '[class.wide]': 'control() === "textarea" || control() === "select-multi"' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityField {
  private readonly lookups = inject(LookupService);

  readonly field = input.required<FieldDef<any>>();
  readonly formControl = input.required<FormControl<unknown>>();

  protected readonly control = computed<Control>(() => {
    const field = this.field();
    if (field.multiple) return 'select-multi';
    if (field.kind === 'textarea') return 'textarea';
    if (field.kind === 'boolean') return 'boolean';
    if (isSmallRange(field)) return 'select';
    if (isNumericField(field)) return 'number';
    if (field.kind === 'enum' || this.lookups.isLookup(field)) return 'select';
    return 'text';
  });

  protected readonly options = computed<readonly { value: string | number; label: string }[]>(() => {
    const field = this.field();
    if (field.kind === 'enum') return field.enumDef?.options ?? [];
    if (isSmallRange(field)) {
      return Array.from({ length: field.max! - field.min! + 1 }, (_, i) => ({ value: field.min! + i, label: String(field.min! + i) }));
    }
    return this.lookups.options(field);
  });

  protected readonly inputType = computed(() => (this.field().kind === 'url' ? 'url' : 'text'));

  /** Values of a repeated lookup (one entry per volume pot…), mirrored from the control. */
  protected readonly items = linkedSignal<(number | null)[]>(
    () => (this.formControl().value as (number | null)[] | null) ?? [],
  );

  /** Singular label for the "add" button: "Volume pots" → "volume pot", "Switches" → "switch". */
  protected readonly singular = computed(() => singularise(this.field().label.toLowerCase()));

  protected addItem(): void {
    this.setItems([...this.items(), null]);
  }

  protected setItem(index: number, value: number | null): void {
    const next = this.items().slice();
    next[index] = value;
    this.setItems(next);
  }

  protected removeItem(index: number): void {
    this.setItems(this.items().filter((_, i) => i !== index));
  }

  private setItems(items: (number | null)[]): void {
    this.items.set(items);
    this.formControl().setValue(items);
    this.formControl().markAsDirty();
  }

  protected errorText(): string {
    const errors = this.formControl().errors;
    if (!errors) return '';
    if (errors['required']) return 'Required';
    if (errors['min']) return `Minimum ${errors['min'].min}`;
    if (errors['max']) return `Maximum ${errors['max'].max}`;
    return 'Invalid value';
  }
}

function isSmallRange(field: FieldDef<any>): boolean {
  return field.kind === 'integer' && field.min != null && field.max != null && field.max - field.min < SELECT_MAX_RANGE;
}

function singularise(plural: string): string {
  if (/(ch|sh|x|s)es$/.test(plural)) return plural.slice(0, -2);
  return plural.replace(/s$/, '');
}
