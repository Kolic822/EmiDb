import { FormControl, FormGroup, Validators, type ValidatorFn } from '@angular/forms';
import { type FieldDef, isNumericField } from '@emidb/shared';

export type EntityFormGroup = FormGroup<Record<string, FormControl<unknown>>>;

/** Builds a reactive form with one control per field, pre-filled from `value`. */
export function buildEntityForm<T extends object>(
  fields: readonly FieldDef<T>[],
  value?: Partial<T> | null,
): EntityFormGroup {
  const controls: Record<string, FormControl<unknown>> = {};
  for (const field of fields) {
    const initial = value?.[field.key] ?? (field.multiple ? [] : null);
    controls[field.key] = new FormControl<unknown>(initial, validatorsFor(field));
  }
  return new FormGroup(controls);
}

function validatorsFor(field: FieldDef<any>): ValidatorFn[] {
  const validators: ValidatorFn[] = [];
  if (field.required) validators.push(Validators.required);
  if (isNumericField(field)) {
    if (field.min != null) validators.push(Validators.min(field.min));
    if (field.max != null) validators.push(Validators.max(field.max));
  }
  return validators;
}

/** Normalises raw form values into the API input shape (empty → null, numeric strings → numbers). */
export function formToInput<TInput>(fields: readonly FieldDef<any>[], form: EntityFormGroup): TInput {
  const raw = form.getRawValue();
  const input: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.transient) continue;
    input[field.key] = normalise(field, raw[field.key]);
  }
  return input as TInput;
}

function normalise(field: FieldDef<any>, value: unknown): unknown {
  if (field.multiple) return Array.isArray(value) ? value.filter((v) => v != null) : [];
  if (value === '' || value === undefined) return null;
  if (typeof value === 'string' && field.kind !== 'boolean') {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    if (isNumericField(field) || field.kind === 'manufacturer' || field.kind === 'pickup') return Number(trimmed);
    return trimmed;
  }
  return value;
}
