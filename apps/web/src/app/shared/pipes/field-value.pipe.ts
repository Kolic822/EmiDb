import { Pipe, type PipeTransform } from '@angular/core';
import { displayValue, type FieldDef, type LookupResolver } from '@emidb/shared';

/** `{{ row[field.key] | fieldValue: field : resolver }}` – pass the resolver so the pipe stays pure. */
@Pipe({ name: 'fieldValue' })
export class FieldValuePipe implements PipeTransform {
  transform(value: unknown, field: FieldDef<any>, resolver?: LookupResolver, withUnit = false): string {
    return displayValue(field, value, resolver, { withUnit });
  }
}
