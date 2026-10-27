import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PICKUP_SET_GROUPS, type PickupSet, type PickupSetInput } from '@emidb/shared';
import { PickupSetsStore } from '../../core/store/stores';
import { ENTITY_LIST_IMPORTS } from '../../shared/entity-page/entity-list-imports';
import { EntityListBase } from '../../shared/entity-page/entity-list-base';
import { PickupSetListState } from './pickup-set-list-state';

@Component({
  selector: 'app-pickup-set-list',
  imports: ENTITY_LIST_IMPORTS,
  templateUrl: '../../shared/entity-page/entity-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickupSetList extends EntityListBase<PickupSet, PickupSetInput> {
  protected readonly store = inject(PickupSetsStore);
  protected readonly state = inject(PickupSetListState);
  protected readonly groups = PICKUP_SET_GROUPS;
  protected readonly noun = 'set';
  protected readonly nounPlural = 'sets';
  protected readonly title = 'Pickup sets';
  protected readonly createLabel = 'New set';
  protected override readonly supportsAttachments = true;
  protected readonly basePath = '/sets';

  constructor() {
    super();
    this.init();
  }
}
