import type { FieldDef } from './fields.js';
import { isNumericField } from './fields.js';

/**
 * Filter criteria. One criterion per field; a row matches when every criterion matches.
 * - text: case-insensitive "contains"
 * - enum / lookup: value must be one of the selected ones
 * - number: |row - value| <= tolerance (tolerance defaults to 0)
 * - range: min <= row <= max (either bound optional)
 * - boolean: exact match
 */
export type Criterion =
  | { kind: 'text'; value: string }
  | { kind: 'in'; values: readonly (string | number)[] }
  | { kind: 'near'; value: number; tolerance?: number }
  | { kind: 'range'; min?: number | null; max?: number | null }
  | { kind: 'boolean'; value: boolean };

export type Criteria<T> = Partial<Record<keyof T & string, Criterion>>;

export function isEmptyCriterion(criterion: Criterion | undefined): boolean {
  if (!criterion) return true;
  switch (criterion.kind) {
    case 'text':
      return criterion.value.trim() === '';
    case 'in':
      return criterion.values.length === 0;
    case 'near':
      return !Number.isFinite(criterion.value);
    case 'range':
      return criterion.min == null && criterion.max == null;
    case 'boolean':
      return false;
  }
}

export function matchesCriterion(value: unknown, criterion: Criterion): boolean {
  switch (criterion.kind) {
    case 'text':
      return typeof value === 'string' && value.toLowerCase().includes(criterion.value.trim().toLowerCase());
    case 'in':
      if (Array.isArray(value)) return value.some((v) => criterion.values.includes(v));
      return value != null && criterion.values.includes(value as string | number);
    case 'near': {
      if (typeof value !== 'number') return false;
      const tolerance = Math.abs(criterion.tolerance ?? 0);
      return Math.abs(value - criterion.value) <= tolerance + Number.EPSILON;
    }
    case 'range': {
      if (typeof value !== 'number') return false;
      if (criterion.min != null && value < criterion.min) return false;
      if (criterion.max != null && value > criterion.max) return false;
      return true;
    }
    case 'boolean':
      return value === criterion.value;
  }
}

export function matchesCriteria<T extends object>(row: T, criteria: Criteria<T>): boolean {
  for (const key of Object.keys(criteria) as (keyof T & string)[]) {
    const criterion = criteria[key];
    if (isEmptyCriterion(criterion)) continue;
    if (!matchesCriterion(row[key], criterion!)) return false;
  }
  return true;
}

export function applyCriteria<T extends object>(rows: readonly T[], criteria: Criteria<T>): T[] {
  return rows.filter((row) => matchesCriteria(row, criteria));
}

export function countActiveCriteria<T>(criteria: Criteria<T>): number {
  return Object.values(criteria as Record<string, Criterion | undefined>).filter(
    (c) => !isEmptyCriterion(c),
  ).length;
}

/** Resolves lookup ids (manufacturer, pickup, pot type…) to display names. */
export type LookupResolver = (field: FieldDef<any>, id: number) => string | undefined;

/** Human-readable value of a field, used in tables, cards, compare and quick search. */
export function displayValue(
  field: FieldDef<any>,
  value: unknown,
  resolve?: LookupResolver,
  options: { withUnit?: boolean } = {},
): string {
  if (value == null || value === '') return '';
  switch (field.kind) {
    case 'enum':
      return field.enumDef?.label(value as string) ?? String(value);
    case 'boolean':
      return value ? 'Yes' : 'No';
    case 'number':
    case 'integer': {
      const text = formatNumber(value as number);
      return options.withUnit && field.unit ? `${text} ${field.unit}` : text;
    }
    case 'manufacturer':
    case 'pickup':
    case 'potentiometerType':
    case 'switchType': {
      const ids = Array.isArray(value) ? (value as number[]) : [value as number];
      return ids.map((id) => resolve?.(field, id) ?? `#${id}`).join(', ');
    }
    default:
      return String(value);
  }
}

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '';
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
}

/** Case-insensitive quick search over every displayable field. */
export function matchesQuery<T extends object>(
  row: T,
  fields: readonly FieldDef<T>[],
  query: string,
  resolve?: LookupResolver,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return fields.some((field) =>
    displayValue(field, row[field.key], resolve).toLowerCase().includes(q),
  );
}

/** Sort comparator for a field; nulls sort last regardless of direction. */
export function compareByField<T extends object>(
  field: FieldDef<T>,
  direction: 'asc' | 'desc',
  resolve?: LookupResolver,
): (a: T, b: T) => number {
  const sign = direction === 'asc' ? 1 : -1;
  return (a, b) => {
    const av = a[field.key];
    const bv = b[field.key];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (isNumericField(field) || field.kind === 'boolean') {
      return (Number(av) - Number(bv)) * sign;
    }
    return displayValue(field, av, resolve).localeCompare(displayValue(field, bv, resolve)) * sign;
  };
}

/** Short human description of an active criterion, e.g. for filter chips. */
export function describeCriterion(
  field: FieldDef<any>,
  criterion: Criterion,
  resolve?: LookupResolver,
): string {
  switch (criterion.kind) {
    case 'text':
      return `${field.label} contains “${criterion.value.trim()}”`;
    case 'in': {
      const labels = criterion.values.map((v) => displayValue(field, v, resolve));
      return `${field.label}: ${labels.join(', ')}`;
    }
    case 'near': {
      const unit = field.unit ? ` ${field.unit}` : '';
      const tolerance = criterion.tolerance ? ` ± ${formatNumber(criterion.tolerance)}` : '';
      return `${field.label} ≈ ${formatNumber(criterion.value)}${tolerance}${unit}`;
    }
    case 'range': {
      const unit = field.unit ? ` ${field.unit}` : '';
      if (criterion.min != null && criterion.max != null)
        return `${field.label} ${formatNumber(criterion.min)}–${formatNumber(criterion.max)}${unit}`;
      if (criterion.min != null) return `${field.label} ≥ ${formatNumber(criterion.min)}${unit}`;
      return `${field.label} ≤ ${formatNumber(criterion.max ?? 0)}${unit}`;
    }
    case 'boolean':
      return `${field.label}: ${criterion.value ? 'Yes' : 'No'}`;
  }
}
