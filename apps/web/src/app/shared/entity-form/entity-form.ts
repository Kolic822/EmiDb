import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { FormControl } from '@angular/forms';
import type { FieldDef, FieldGroup } from '@emidb/shared';
import { EntityField } from '../entity-field/entity-field';
import type { EntityFormGroup } from './form-builder';

/** Lays a built entity form out as grouped sections. */
@Component({
  selector: 'app-entity-form',
  imports: [EntityField],
  template: `
    @for (section of sections(); track section.id) {
      <section class="card">
        <h2>{{ section.label }}</h2>
        <div class="grid">
          @for (field of section.fields; track field.key) {
            <app-entity-field [field]="field" [formControl]="controlFor(field.key)" />
          }
        </div>
      </section>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    section {
      padding: 18px 20px 6px;
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

  protected readonly sections = computed(() =>
    this.groups()
      .map((group) => ({ ...group, fields: this.fields().filter((field) => field.group === group.id) }))
      .filter((group) => group.fields.length),
  );

  protected controlFor(key: string): FormControl<unknown> {
    return this.form().controls[key];
  }
}
