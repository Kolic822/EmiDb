import { inject, Injectable } from '@angular/core';
import { PICKUP_FIELDS, type Pickup } from '@emidb/shared';
import { LookupService } from '../../core/lookups';
import { ListState } from '../../shared/list-state/list-state';

/** Shared between the pickup table and the filter view. */
@Injectable({ providedIn: 'root' })
export class PickupListState extends ListState<Pickup> {
  constructor() {
    super(PICKUP_FIELDS, 'pickups', inject(LookupService).resolver);
  }
}
