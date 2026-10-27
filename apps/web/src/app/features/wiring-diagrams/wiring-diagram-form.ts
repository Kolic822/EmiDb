import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CONTROL_LAYOUTS,
  type ControlLayout,
  WIRING_DIAGRAM_FIELDS,
  WIRING_DIAGRAM_GROUPS,
  type WiringDiagram,
  type WiringDiagramInput,
} from '@emidb/shared';
import { WiringDiagramsStore } from '../../core/store/stores';
import type { EntityFormGroup } from '../../shared/entity-form/form-builder';
import { ENTITY_FORM_IMPORTS } from '../../shared/entity-page/entity-form-imports';
import { EntityFormBase } from '../../shared/entity-page/entity-form-base';

@Component({
  selector: 'app-wiring-diagram-form',
  imports: ENTITY_FORM_IMPORTS,
  templateUrl: '../../shared/entity-page/entity-form-page.html',
  styleUrl: '../../shared/entity-page/entity-form-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WiringDiagramForm extends EntityFormBase<WiringDiagram, WiringDiagramInput> {
  protected readonly store = inject(WiringDiagramsStore);
  protected readonly fields = WIRING_DIAGRAM_FIELDS;
  protected readonly groups = WIRING_DIAGRAM_GROUPS;
  protected readonly noun = 'wiring diagram';
  protected readonly createLabel = 'New wiring diagram';
  protected readonly submitLabel = 'Create wiring diagram';
  protected override readonly attachmentOwner = 'wiringDiagram' as const;
  protected readonly basePath = '/wiring-diagrams';
  private readonly destroyRef = inject(DestroyRef);

  /** Choosing a layout preset sets the pot count and the role of each position. */
  protected override onFormCreated(form: EntityFormGroup): void {
    form.controls['layout'].valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((layout) => {
      const roles = CONTROL_LAYOUTS[layout as ControlLayout];
      if (!roles) return;
      form.controls['controlCount'].setValue(roles.length);
      roles.forEach((role, i) => form.controls[`control${i + 1}Role`].setValue(role));
      form.markAsDirty();
    });
  }
}
