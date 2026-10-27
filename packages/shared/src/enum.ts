/**
 * A domain enum: stable keys stored in the database, human labels for the UI.
 * Defined as plain objects so the syntax stays erasable (no TS `enum`).
 */
export interface EnumOption<K extends string = string> {
  readonly value: K;
  readonly label: string;
}

export interface EnumDef<K extends string = string> {
  readonly values: readonly K[];
  readonly labels: Readonly<Record<K, string>>;
  readonly options: readonly EnumOption<K>[];
  label(value: K | null | undefined): string;
  is(value: unknown): value is K;
}

export type EnumValue<T extends EnumDef<string>> = T['values'][number];

export function defineEnum<const K extends string>(labels: Record<K, string>): EnumDef<K> {
  const values = Object.keys(labels) as K[];
  const options = values.map((value) => ({ value, label: labels[value] }));
  return {
    values,
    labels,
    options,
    label: (value) => (value == null ? '' : labels[value] ?? value),
    is: (value): value is K => typeof value === 'string' && value in labels,
  };
}
