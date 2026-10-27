import { ChangeDetectionStrategy, Component, computed, input, type Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import type { FormControl } from '@angular/forms';
import { type FieldDef, type FieldGroup, groupLabel, isFieldRelevant } from '@emidb/shared';
import { map, startWith, switchMap } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { EntityField } from '../entity-field/entity-field';
import type { EntityFormGroup } from './form-builder';

/** Lays a built entity form out as grouped sections. */
@Component({
  selector: 'app-entity-form',
  imports: [EntityField],
  template: `
    @for (section of sections(); track section.id) {
      <section class="card" [class.half]="section.width === 'half'">
        <h2>{{ groupName(section) }}</h2>
        <div class="grid" [style.grid-template-columns]="columnsOf(section)">
          @for (field of section.fields; track field.key) {
            <app-entity-field [field]="field" [formControl]="controlFor(field.key)" [record]="value()" [class.wide]="field.fullWidth" />
          }
        </div>
      </section>
    }
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    section {
      grid-column: 1 / -1;
      padding: 18px 20px 6px;
      min-width: 0;

      &.half {
        grid-column: auto;
      }
    }

    @media (max-width: 900px) {
      section.half {
        grid-column: 1 / -1;
      }
    }

    h2 {
      margin: 0 0 14px;
      font: var(--mat-sys-title-medium);
      font-weight: 600;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 4px 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityForm {
  readonly fields = input.required<readonly FieldDef<any>[]>();
  readonly groups = input.required<readonly FieldGroup[]>();
  readonly form = input.required<EntityFormGroup>();

  /** Current raw form value, so conditional fields (`showWhen`) appear and disappear as the user types. */
  protected readonly value: Signal<Record<string, unknown>> = toSignal(
    toObservable(this.form).pipe(
      switchMap((form) => form.valueChanges.pipe(startWith(form.getRawValue()), map(() => form.getRawValue()))),
    ),
    { initialValue: {} },
  );

  protected readonly sections = computed(() => {
    const value = this.value();
    return this.groups()
      .map((group) => ({
        ...group,
        fields: this.fields().filter((field) => field.group === group.id && isFieldRelevant(field, value)),
      }))
      .filter((group) => group.fields.length);
  });

  protected controlFor(key: string): FormControl<unknown> {
    return this.form().controls[key];
  }

  protected groupName(section: FieldGroup): string {
    return groupLabel(section);
  }

  protected columnsOf(section: FieldGroup): string | null {
    return section.columns ? `repeat(${section.columns}, minmax(0, 1fr))` : null;
  }
}
