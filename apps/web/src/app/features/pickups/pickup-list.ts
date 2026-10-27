import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PICKUP_GROUPS, type Pickup, type PickupInput } from '@emidb/shared';
import { PickupsStore } from '../../core/store/stores';
import { ENTITY_LIST_IMPORTS } from '../../shared/entity-page/entity-list-imports';
import { EntityListBase } from '../../shared/entity-page/entity-list-base';
import { PickupListState } from './pickup-list-state';

@Component({
  selector: 'app-pickup-list',
  imports: ENTITY_LIST_IMPORTS,
  templateUrl: '../../shared/entity-page/entity-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickupList extends EntityListBase<Pickup, PickupInput> {
  protected readonly store = inject(PickupsStore);
  protected readonly state = inject(PickupListState);
  protected readonly groups = PICKUP_GROUPS;
  protected readonly noun = 'pickup';
  protected readonly nounPlural = 'pickups';
  protected readonly title = 'Pickups';
  protected readonly createLabel = 'New pickup';
  protected override readonly supportsAttachments = true;
  protected readonly basePath = '/pickups';
  protected override readonly supportsFilter = true;
  protected override readonly supportsCompare = true;

  constructor() {
    super();
    this.init();
  }
}
