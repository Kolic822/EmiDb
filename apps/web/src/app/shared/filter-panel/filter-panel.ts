import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { FieldGroup } from '@emidb/shared';
import { FilterField } from '../filter-field/filter-field';
import { ListState } from '../list-state/list-state';

/** All filterable fields of an entity, grouped, bound to the shared ListState criteria. */
@Component({
  selector: 'app-filter-panel',
  imports: [FilterField],
  template: `
    @for (section of sections(); track section.id) {
      <section>
        <h3>{{ section.label }}</h3>
        <div class="fields">
          @for (field of section.fields; track field.key) {
            <app-filter-field
              [field]="field"
              [criterion]="state().criteria()[field.key]"
              (criterionChange)="state().setCriterion(field.key, $event)"
            />
          }
        </div>
      </section>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    h3 {
      margin: 0 0 10px;
      font: var(--mat-sys-label-small);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--mat-sys-on-surface-variant);
    }

    .fields {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterPanel<T extends { id: number }> {
  readonly state = input.required<ListState<T>>();
  readonly groups = input.required<readonly FieldGroup[]>();

  protected readonly sections = computed(() =>
    this.groups()
      .map((group) => ({ ...group, fields: this.state().filterableFields.filter((f) => f.group === group.id) }))
      .filter((group) => group.fields.length),
  );
}
