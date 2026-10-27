import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PICKUP_SET_FIELDS, PICKUP_SET_GROUPS, type PickupSet, type PickupSetInput } from '@emidb/shared';
import { PickupSetsStore } from '../../core/store/stores';
import { ENTITY_FORM_IMPORTS } from '../../shared/entity-page/entity-form-imports';
import { EntityFormBase } from '../../shared/entity-page/entity-form-base';

@Component({
  selector: 'app-pickup-set-form',
  imports: ENTITY_FORM_IMPORTS,
  templateUrl: '../../shared/entity-page/entity-form-page.html',
  styleUrl: '../../shared/entity-page/entity-form-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickupSetForm extends EntityFormBase<PickupSet, PickupSetInput> {
  protected readonly store = inject(PickupSetsStore);
  protected readonly fields = PICKUP_SET_FIELDS;
  protected readonly groups = PICKUP_SET_GROUPS;
  protected readonly noun = 'set';
  protected readonly createLabel = 'New set';
  protected override readonly attachmentOwner = 'pickupSet' as const;
  protected readonly basePath = '/sets';
}
