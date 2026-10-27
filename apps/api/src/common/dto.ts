import { Transform } from 'class-transformer';
import { registerDecorator, type ValidationOptions } from 'class-validator';

/** Trims strings and turns empty strings into null so optional text fields stay clean. */
export const Trimmed = () =>
  Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  });

/** Validates a comma separated id list query parameter, e.g. `?ids=1,2,3`. */
export function parseIdList(raw: string | undefined): number[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((part) => Number(part.trim()))
    .filter((n) => Number.isInteger(n) && n > 0);
}

/** Every element must be a positive integer. */
export function IsIdArray(options?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'isIdArray',
      target: object.constructor,
      propertyName,
      options: { message: `${propertyName} must be an array of positive integers`, ...options },
      validator: {
        validate: (value: unknown) =>
          Array.isArray(value) && value.every((v) => Number.isInteger(v) && v > 0),
      },
    });
}
