import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal, viewChild } from '@angular/core';
import { type FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { type FieldDef, fieldLabel, isNumericField, t } from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';
import { LookupService } from '../../core/lookups';
import { NotifyService } from '../../core/notify';
import { filterOptions, SEARCH_THRESHOLD, SelectSearch } from '../select-search/select-search';

type Control = 'text' | 'textarea' | 'number' | 'select' | 'select-multi' | 'boolean';

/** Sentinel option value that opens the inline "new entry" input. */
const ADD_NEW = '__add_new__';

/** Small bounded integers (1–3 pickups, 0–3 pots) are easier to pick from a list. */
const SELECT_MAX_RANGE = 6;

/** Renders the right Material control for a field definition bound to a FormControl. */
@Component({
  selector: 'app-entity-field',
  imports: [ReactiveFormsModule, MatFormField, MatLabel, MatError, MatSuffix, MatInput, MatSelect, MatOption, MatIcon, MatIconButton, TranslatePipe, SelectSearch],
  templateUrl: './entity-field.html',
  styleUrl: './entity-field.scss',
  host: { '[class.wide]': 'control() === "textarea" || control() === "select-multi"' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityField {
  private readonly lookups = inject(LookupService);
  private readonly notify = inject(NotifyService);
  protected readonly ADD_NEW = ADD_NEW;

  readonly field = input.required<FieldDef<any>>();
  readonly formControl = input.required<FormControl<unknown>>();

  protected readonly label = computed(() => fieldLabel(this.field()));

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

  // --- searchable panel ---
  protected readonly query = signal('');
  protected readonly searchable = computed(() => this.options().length >= SEARCH_THRESHOLD || this.creatable());
  protected readonly filteredOptions = computed(() =>
    filterOptions(this.options(), this.query(), this.formControl().value),
  );
  private readonly search = viewChild(SelectSearch);

  // --- inline "Add new…" for creatable lookups ---
  protected readonly creatable = computed(() => !!this.field().creatable && !this.field().multiple);
  protected readonly creating = signal(false);
  protected readonly newName = signal('');
  protected readonly saving = signal(false);
  private valueBeforeOpen: unknown = null;

  protected onOpened(opened: boolean): void {
    if (opened) {
      this.valueBeforeOpen = this.formControl().value;
      this.search()?.focus();
    } else {
      this.query.set('');
    }
  }

  /** Selecting the sentinel reverts the value and shows the inline name input instead. */
  protected onSelection(value: unknown): void {
    if (value !== ADD_NEW) return;
    this.formControl().setValue(this.valueBeforeOpen, { emitEvent: false });
    this.newName.set(this.query().trim());
    this.creating.set(true);
  }

  protected cancelCreate(): void {
    this.creating.set(false);
    this.newName.set('');
  }

  protected async saveNew(): Promise<void> {
    const name = this.newName().trim();
    if (!name || this.saving()) return;
    this.saving.set(true);
    try {
      const id = await this.lookups.create(this.field(), name);
      this.formControl().setValue(id);
      this.formControl().markAsDirty();
      this.notify.success(t('“{name}” added', { name }));
      this.cancelCreate();
    } catch {
      // Reported by the HTTP interceptor; keep the input so the name is not lost.
    } finally {
      this.saving.set(false);
    }
  }

  /** Values of a repeated lookup (one entry per volume pot…), mirrored from the control. */
  protected readonly items = linkedSignal<(number | null)[]>(
    () => (this.formControl().value as (number | null)[] | null) ?? [],
  );

  /** Singular label for the "add" button: "Volume pots" → "volume pot", "Switches" → "switch". */
  protected readonly singular = computed(() => singularise(this.label().toLowerCase()));

  protected readonly multiCreatable = computed(() => !!this.field().creatable && !!this.field().multiple);
  /** Index of the repeated row whose "Add new…" was chosen. */
  protected readonly creatingAt = signal<number | null>(null);

  protected onItemSelection(index: number, value: unknown): void {
    if (value === ADD_NEW) {
      this.newName.set(this.query().trim());
      this.creatingAt.set(index);
      return;
    }
    this.setItem(index, value as number | null);
  }

  protected async saveNewItem(): Promise<void> {
    const index = this.creatingAt();
    const name = this.newName().trim();
    if (index == null || !name || this.saving()) return;
    this.saving.set(true);
    try {
      const id = await this.lookups.create(this.field(), name);
      this.setItem(index, id);
      this.notify.success(t('“{name}” added', { name }));
      this.creatingAt.set(null);
      this.newName.set('');
    } catch {
      // Reported by the HTTP interceptor.
    } finally {
      this.saving.set(false);
    }
  }

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
    if (errors['required']) return t('Required');
    if (errors['min']) return t('Minimum {min}', { min: errors['min'].min });
    if (errors['max']) return t('Maximum {max}', { max: errors['max'].max });
    return t('Invalid value');
  }
}

function isSmallRange(field: FieldDef<any>): boolean {
  return field.kind === 'integer' && field.min != null && field.max != null && field.max - field.min < SELECT_MAX_RANGE;
}

function singularise(plural: string): string {
  if (/(ch|sh|x|s)es$/.test(plural)) return plural.slice(0, -2);
  return plural.replace(/s$/, '');
}
