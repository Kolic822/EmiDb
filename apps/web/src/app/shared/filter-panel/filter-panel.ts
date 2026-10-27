import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { type Criterion, type FieldDef, type FieldGroup, groupLabel, isEmptyCriterion } from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';
import { FilterField } from '../filter-field/filter-field';
import { ListState } from '../list-state/list-state';

interface Section {
  id: string;
  label: string;
  fields: FieldDef<any>[];
  /** Fields in this section with an active criterion. */
  active: number;
  collapsed: boolean;
}

/**
 * All filterable fields of an entity, grouped into collapsible sections,
 * bound to the shared ListState criteria. Collapsed state is remembered per table.
 */
@Component({
  selector: 'app-filter-panel',
  imports: [FilterField, MatIcon, TranslatePipe],
  template: `
    @for (section of sections(); track section.id) {
      <section [class.collapsed]="section.collapsed">
        <button
          type="button"
          class="head"
          (click)="state().toggleFilterGroup(section.id)"
          [attr.aria-expanded]="!section.collapsed"
        >
          <span class="title">{{ section.label }}</span>
          @if (section.active) {
            <span class="badge" [attr.aria-label]="'{count} active' | t: { count: section.active }">{{ section.active }}</span>
          }
          <mat-icon>{{ section.collapsed ? 'expand_more' : 'expand_less' }}</mat-icon>
        </button>
        @if (!section.collapsed) {
          <div class="fields">
            @for (field of section.fields; track field.key) {
              <app-filter-field
                [field]="field"
                [criterion]="criterionFor(field)"
                (criterionChange)="setCriterion(field, $event)"
              />
            }
          </div>
        }
      </section>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    section {
      border-bottom: 1px solid var(--mat-sys-surface-container-high);
      padding-bottom: 10px;

      &:last-child {
        border-bottom: 0;
      }

      &.collapsed {
        padding-bottom: 0;
      }
    }

    .head {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 8px 2px;
      border: 0;
      background: none;
      cursor: pointer;
      color: var(--mat-sys-on-surface-variant);
      font: var(--mat-sys-label-small);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-align: left;

      &:hover {
        color: var(--mat-sys-on-surface);
      }

      .title {
        flex: 1;
      }

      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
    }

    .badge {
      display: inline-grid;
      place-items: center;
      min-width: 18px;
      height: 18px;
      padding: 0 5px;
      border-radius: 9px;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      font: var(--mat-sys-label-small);
      font-weight: 600;
      letter-spacing: 0;
    }

    .fields {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 2px 0 4px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterPanel<T extends { id: number }> {
  readonly state = input.required<ListState<T>>();
  readonly groups = input.required<readonly FieldGroup[]>();

  protected criterionFor(field: FieldDef<any>): Criterion | undefined {
    return (this.state().criteria() as Record<string, Criterion | undefined>)[field.key];
  }

  protected setCriterion(field: FieldDef<any>, criterion: Criterion | undefined): void {
    this.state().setCriterion(field.key as keyof T & string, criterion);
  }

  /** Position fields (Pot 3 …) are offered only for as many positions as the count filter asks for. */
  private applies(field: FieldDef<any>, criteria: Record<string, Criterion | undefined>): boolean {
    if (!field.showWhen) return true;
    const count = criteria[field.showWhen.key];
    return count?.kind === 'near' && count.value >= field.showWhen.min;
  }

  protected readonly sections = computed<Section[]>(() => {
    const state = this.state();
    const criteria = state.criteria() as Record<string, Criterion | undefined>;
    const collapsed = new Set(state.collapsedFilterGroups());
    return this.groups()
      .map((group) => {
        const fields = state.filterableFields.filter((f) => f.group === group.id && this.applies(f, criteria));
        return {
          id: group.id,
          label: groupLabel(group),
          fields,
          active: fields.filter((f) => !isEmptyCriterion(criteria[f.key])).length,
          collapsed: collapsed.has(group.id),
        };
      })
      .filter((section) => section.fields.length);
  });
}
