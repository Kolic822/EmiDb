import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { type FieldDef, type FieldGroup, fieldLabel, groupLabel, isFieldRelevant } from '@emidb/shared';
import { LookupService } from '../../core/lookups';
import { FieldValuePipe } from '../pipes/field-value.pipe';

/** Read-only, grouped label/value view of one entity. */
@Component({
  selector: 'app-entity-details',
  imports: [FieldValuePipe, MatIcon],
  template: `
    @for (section of sections(); track section.id) {
      <section class="card" [class.half]="section.width === 'half'">
        <h2>{{ groupName(section) }}</h2>
        <dl [style.grid-template-columns]="columnsOf(section)">
          @for (field of section.fields; track field.key) {
            @let value = row()[field.key];
            <div class="item" [class.wide]="field.kind === 'textarea' || field.fullWidth">
              <dt>{{ label(field) }}</dt>
              <dd [class.empty]="value == null || value === '' || value?.length === 0">
                @switch (field.kind) {
                  @case ('url') {
                    @if (value) {
                      <a [href]="value" target="_blank" rel="noopener">{{ value }} <mat-icon>open_in_new</mat-icon></a>
                    } @else {
                      —
                    }
                  }
                  @case ('textarea') {
                    {{ value || '—' }}
                  }
                  @default {
                    {{ (value | fieldValue: field : resolver() : true) || '—' }}
                  }
                }
              </dd>
            </div>
          }
        </dl>
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
      padding: 18px 20px 14px;
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
      margin: 0 0 12px;
      font: var(--mat-sys-title-medium);
      font-weight: 600;
    }

    dl {
      margin: 0;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 12px 24px;
    }

    .item.wide {
      grid-column: 1 / -1;
    }

    dt {
      font: var(--mat-sys-label-medium);
      color: var(--mat-sys-on-surface-variant);
      margin-bottom: 2px;
    }

    dd {
      margin: 0;
      font: var(--mat-sys-body-large);
      white-space: pre-wrap;
      overflow-wrap: anywhere;

      &.empty {
        color: var(--mat-sys-outline);
      }

      mat-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        vertical-align: -3px;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityDetails {
  private readonly lookups = inject(LookupService);

  readonly fields = input.required<readonly FieldDef<any>[]>();
  readonly groups = input.required<readonly FieldGroup[]>();
  readonly row = input.required<Record<string, any>>();

  protected readonly resolver = computed(() => this.lookups.resolver());

  protected label(field: FieldDef<any>): string {
    return fieldLabel(field);
  }

  protected groupName(section: FieldGroup): string {
    return groupLabel(section);
  }

  protected columnsOf(section: FieldGroup): string | null {
    return section.columns ? `repeat(${section.columns}, minmax(0, 1fr))` : null;
  }
  protected readonly sections = computed(() => {
    const row = this.row();
    return this.groups()
      .map((group) => ({
        ...group,
        fields: this.fields().filter((field) => field.group === group.id && isFieldRelevant(field, row)),
      }))
      .filter((group) => group.fields.length);
  });
}
