import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MANUFACTURER_FIELDS,
  MANUFACTURER_GROUPS,
  type Manufacturer,
  type ManufacturerInput,
} from '@emidb/shared';
import { t } from '@emidb/shared';
import { LookupService } from '../../core/lookups';
import { ManufacturersStore } from '../../core/store/stores';
import { EntityDialogService } from '../../shared/entity-dialog/entity-dialog';
import { ENTITY_LIST_IMPORTS } from '../../shared/entity-page/entity-list-imports';
import { EntityListBase } from '../../shared/entity-page/entity-list-base';
import { ListState } from '../../shared/list-state/list-state';

@Component({
  selector: 'app-manufacturer-list',
  imports: ENTITY_LIST_IMPORTS,
  templateUrl: '../../shared/entity-page/entity-list-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManufacturerList extends EntityListBase<Manufacturer, ManufacturerInput> {
  protected readonly store = inject(ManufacturersStore);
  protected readonly state = new ListState<Manufacturer>(MANUFACTURER_FIELDS, 'manufacturers', inject(LookupService).resolver);
  protected readonly groups = MANUFACTURER_GROUPS;
  protected readonly noun = 'manufacturer';
  protected readonly nounPlural = 'manufacturers';
  protected readonly title = 'Manufacturers';
  protected readonly createLabel = 'New manufacturer';
  protected readonly basePath = '/manufacturers';
  protected override readonly supportsAttachments = true;
  private readonly dialogs = inject(EntityDialogService);

  constructor() {
    super();
    this.init();
  }

  protected override async create(): Promise<void> {
    const saved = await this.dialogs.open<Manufacturer, ManufacturerInput>({
      title: t('New manufacturer'),
      fields: MANUFACTURER_FIELDS,
      groups: MANUFACTURER_GROUPS,
      submitLabel: 'Create',
      save: (input) => this.store.create(input),
      attachmentOwner: 'manufacturer',
    });
    if (!saved) return;
    this.notify.success(t('{noun} created', { noun: t('Manufacturer') }));
    void this.store.load();
  }

  protected override async open(row: Manufacturer): Promise<void> {
    const saved = await this.dialogs.open<Manufacturer, ManufacturerInput>({
      title: t('Edit {name}', { name: row.name }),
      fields: MANUFACTURER_FIELDS,
      groups: MANUFACTURER_GROUPS,
      value: row,
      save: (input) => this.store.update(row.id, input),
      attachmentOwner: 'manufacturer',
      ownerId: row.id,
    });
    if (!saved) return;
    this.notify.success(t('{noun} saved', { noun: t('Manufacturer') }));
    void this.store.load();
  }
}
