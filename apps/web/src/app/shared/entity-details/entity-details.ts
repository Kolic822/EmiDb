import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import type { FieldDef, FieldGroup } from '@emidb/shared';
import { LookupService } from '../../core/lookups';
import { FieldValuePipe } from '../pipes/field-value.pipe';

/** Read-only, grouped label/value view of one entity. */
@Component({
  selector: 'app-entity-details',
  imports: [FieldValuePipe, MatIcon],
  template: `
    @for (section of sections(); track section.id) {
      <section class="card">
        <h2>{{ section.label }}</h2>
        <dl>
          @for (field of section.fields; track field.key) {
            @let value = row()[field.key];
            <div class="item" [class.wide]="field.kind === 'textarea'">
              <dt>{{ field.label }}</dt>
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
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    section {
      padding: 18px 20px 14px;
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
  protected readonly sections = computed(() =>
    this.groups()
      .map((group) => ({ ...group, fields: this.fields().filter((field) => field.group === group.id) }))
      .filter((group) => group.fields.length),
  );
}
