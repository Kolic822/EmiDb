import { inject, Injectable } from '@angular/core';
import { PICKUP_SET_FIELDS, type PickupSet } from '@emidb/shared';
import { LookupService } from '../../core/lookups';
import { ListState } from '../../shared/list-state/list-state';

@Injectable({ providedIn: 'root' })
export class PickupSetListState extends ListState<PickupSet> {
  constructor() {
    super(PICKUP_SET_FIELDS, 'sets', inject(LookupService).resolver);
  }
}
