import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  WIRING_DIAGRAM_FIELDS,
  WIRING_DIAGRAM_GROUPS,
  type WiringDiagram,
  type WiringDiagramInput,
} from '@emidb/shared';
import { WiringDiagramsStore } from '../../core/store/stores';
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
}
