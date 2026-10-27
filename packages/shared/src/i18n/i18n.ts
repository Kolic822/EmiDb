/**
 * Runtime translations. Source strings are English and double as keys, so a
 * missing translation falls back to the English text. The app sets the
 * dictionary once at startup; switching language reloads the page.
 */
export type Dictionary = Readonly<Record<string, string>>;

export const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'hr', label: 'Hrvatski' },
] as const;
export type LanguageId = (typeof LANGUAGES)[number]['id'];

let dictionary: Dictionary = {};

export function setDictionary(next: Dictionary): void {
  dictionary = next;
}

/** Translates a source string, interpolating `{name}` placeholders from `params`. */
export function t(source: string, params?: Record<string, string | number>): string {
  const text = dictionary[source] ?? source;
  if (!params) return text;
  return text.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

/** Plural helper: `plural(n, 'pickup', 'pickups')` → "1 pickup" / "3 pickups". */
export function plural(count: number, singular: string, pluralForm: string): string {
  return `${count} ${count === 1 ? t(singular) : t(pluralForm)}`;
}
