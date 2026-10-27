import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAnchor, MatIconButton } from '@angular/material/button';
import { MatAutocomplete, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatFormField, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatOption } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { displayValue, type FieldDef, fieldLabel, groupLabel, isNumericField, PICKUP_FIELDS, PICKUP_GROUPS, type Pickup } from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';
import { LookupService } from '../../core/lookups';
import { storedSignal } from '../../core/storage';
import { PickupsStore } from '../../core/store/stores';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { PageHeader } from '../../shared/page-header/page-header';
import { Truncate } from '../../shared/truncate/truncate';

interface CompareCell {
  text: string;
  /** Highest / lowest numeric value in the row. */
  extreme: 'high' | 'low' | null;
}

interface CompareRow {
  field: FieldDef<Pickup>;
  label: string;
  cells: CompareCell[];
  differs: boolean;
}

interface CompareSection {
  id: string;
  label: string;
  rows: CompareRow[];
}

const MAX_COMPARED = 8;

@Component({
  selector: 'app-pickup-compare',
  imports: [FormsModule, PageHeader, EmptyState, MatAnchor, MatIconButton, MatIcon, MatTooltip, MatSlideToggle, MatFormField, MatPrefix, MatInput, MatAutocomplete, MatAutocompleteTrigger, MatOption, RouterLink, Truncate, TranslatePipe],
  templateUrl: './pickup-compare.html',
  styleUrl: './pickup-compare.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickupCompare {
  private readonly store = inject(PickupsStore);
  private readonly lookups = inject(LookupService);
  private readonly router = inject(Router);

  /** Query parameter: comma separated pickup ids. */
  readonly ids = input<string>();

  protected readonly onlyDifferences = storedSignal('compare.onlyDifferences', false);
  protected readonly maxCompared = MAX_COMPARED;

  protected readonly idList = computed(() =>
    (this.ids() ?? '')
      .split(',')
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0)
      .slice(0, MAX_COMPARED),
  );
  protected readonly pickups = computed(() => {
    const byId = this.store.byId();
    return this.idList().map((id) => byId.get(id)).filter((p): p is Pickup => !!p);
  });
  /** Text typed into the "add pickup" box. */
  protected readonly addQuery = signal('');
  protected readonly addable = computed(() => {
    const chosen = new Set(this.idList());
    const query = this.addQuery().trim().toLowerCase();
    return this.store
      .rows()
      .filter((p) => !chosen.has(p.id))
      .filter((p) => !query || `${p.name} ${this.manufacturer(p)}`.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 30);
  });

  protected readonly sections = computed<CompareSection[]>(() => {
    const pickups = this.pickups();
    const resolve = this.lookups.resolver();
    const onlyDifferences = this.onlyDifferences();
    return PICKUP_GROUPS.map((group) => ({
      ...group,
      label: groupLabel(group),
      rows: PICKUP_FIELDS.filter((field) => field.group === group.id && field.key !== 'name')
        .map((field) => buildRow(field, pickups, resolve))
        .filter((row) => !onlyDifferences || row.differs),
    })).filter((section) => section.rows.length);
  });

  constructor() {
    void this.store.ensureLoaded();
    void this.lookups.ensureLoaded();
  }

  protected manufacturer(pickup: Pickup): string {
    return displayValue(PICKUP_FIELDS[1], pickup.manufacturerId, this.lookups.resolver());
  }

  protected remove(id: number): void {
    this.setIds(this.idList().filter((x) => x !== id));
  }

  protected add(id: number | null): void {
    this.addQuery.set('');
    if (id != null) this.setIds([...this.idList(), id]);
  }

  /** Keeps the input empty after choosing an option. */
  protected readonly displayNothing = (): string => '';

  private setIds(ids: number[]): void {
    void this.router.navigate([], { queryParams: { ids: ids.join(',') }, replaceUrl: true });
  }
}

function buildRow(
  field: FieldDef<Pickup>,
  pickups: Pickup[],
  resolve: ReturnType<LookupService['resolver']>,
): CompareRow {
  const values = pickups.map((pickup) => pickup[field.key]);
  const texts = values.map((value) => displayValue(field, value, resolve, { withUnit: false }));
  const differs = new Set(texts).size > 1;

  let extremes: ('high' | 'low' | null)[] = values.map(() => null);
  if (isNumericField(field)) {
    const numbers = values.filter((v): v is number => typeof v === 'number');
    const max = Math.max(...numbers);
    const min = Math.min(...numbers);
    if (numbers.length >= 2 && max !== min) {
      extremes = values.map((v) => (v === max ? 'high' : v === min ? 'low' : null));
    }
  }
  return {
    field,
    label: fieldLabel(field),
    differs,
    cells: texts.map((text, i) => ({ text, extreme: extremes[i] })),
  };
}
