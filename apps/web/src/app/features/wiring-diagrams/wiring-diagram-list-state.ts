import { inject, Injectable } from '@angular/core';
import { WIRING_DIAGRAM_FIELDS, type WiringDiagram } from '@emidb/shared';
import { LookupService } from '../../core/lookups';
import { ListState } from '../../shared/list-state/list-state';

@Injectable({ providedIn: 'root' })
export class WiringDiagramListState extends ListState<WiringDiagram> {
  constructor() {
    super(WIRING_DIAGRAM_FIELDS, 'wiring-diagrams', inject(LookupService).resolver);
  }
}
