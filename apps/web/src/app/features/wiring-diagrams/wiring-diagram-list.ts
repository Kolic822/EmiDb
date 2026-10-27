import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WIRING_DIAGRAM_GROUPS, type WiringDiagram, type WiringDiagramInput } from '@emidb/shared';
import { WiringDiagramsStore } from '../../core/store/stores';
import { ENTITY_LIST_IMPORTS } from '../../shared/entity-page/entity-list-imports';
import { EntityListBase } from '../../shared/entity-page/entity-list-base';
import { WiringDiagramListState } from './wiring-diagram-list-state';

@Component({
  selector: 'app-wiring-diagram-list',
  imports: ENTITY_LIST_IMPORTS,
  templateUrl: '../../shared/entity-page/entity-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WiringDiagramList extends EntityListBase<WiringDiagram, WiringDiagramInput> {
  protected readonly store = inject(WiringDiagramsStore);
  protected readonly state = inject(WiringDiagramListState);
  protected readonly groups = WIRING_DIAGRAM_GROUPS;
  protected readonly noun = 'wiring diagram';
  protected readonly nounPlural = 'wiring diagrams';
  protected readonly title = 'Wiring diagrams';
  protected readonly createLabel = 'New wiring diagram';
  protected override readonly supportsAttachments = true;
  protected readonly basePath = '/wiring-diagrams';
  protected override readonly supportsFilter = true;

  constructor() {
    super();
    this.init();
  }
}
