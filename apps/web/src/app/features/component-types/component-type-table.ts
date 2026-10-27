import { ChangeDetectionStrategy, Component, Directive, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  COMPONENT_TYPE_FIELDS,
  COMPONENT_TYPE_GROUPS,
  type ComponentType,
  type ComponentTypeInput,
  type FieldDef,
  type FieldGroup,
  POT_LAYOUT_FIELDS,
  POT_LAYOUT_GROUPS,
  type PotLayout,
  type PotLayoutInput,
  SWITCH_TYPE_FIELDS,
  type SwitchType,
  type SwitchTypeInput,
  t,
  WIRING_PICKUP_TYPE_FIELDS,
  WIRING_PICKUP_TYPE_GROUPS,
  type WiringPickupType,
  type WiringPickupTypeInput,
} from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';
import { LookupService } from '../../core/lookups';
import { PotentiometerTypesStore, PotLayoutsStore, SwitchTypesStore, WiringPickupTypesStore } from '../../core/store/stores';
import { DataTable } from '../../shared/data-table/data-table';
import { EntityDialogService } from '../../shared/entity-dialog/entity-dialog';
import { capitalise, EntityListBase } from '../../shared/entity-page/entity-list-base';
import { ListState } from '../../shared/list-state/list-state';
import { ListToolbar } from '../../shared/list-toolbar/list-toolbar';

/** Lookup tables are edited inline through a dialog instead of dedicated pages. */
@Directive()
abstract class ComponentTypeTableBase<
  T extends { id: number; name: string } = ComponentType,
  TInput = ComponentTypeInput,
> extends EntityListBase<T, TInput> {
  protected readonly fields: readonly FieldDef<T>[] = COMPONENT_TYPE_FIELDS as unknown as FieldDef<T>[];
  protected readonly groups: readonly FieldGroup[] = COMPONENT_TYPE_GROUPS;
  protected readonly basePath = '/components';
  private readonly dialogs = inject(EntityDialogService);

  protected override async create(): Promise<void> {
    const saved = await this.dialogs.open<T, TInput>({
      title: t(this.createLabel),
      fields: this.fields,
      groups: this.groups,
      submitLabel: 'Create',
      save: (input) => this.store.create(input),
    });
    if (saved) this.notify.success(t('{noun} created', { noun: capitalise(t(this.noun)) }));
  }

  protected override async open(row: T): Promise<void> {
    const saved = await this.dialogs.open<T, TInput>({
      title: t('Edit {name}', { name: row.name }),
      fields: this.fields,
      groups: this.groups,
      value: row,
      save: (input) => this.store.update(row.id, input),
    });
    if (saved) this.notify.success(t('{noun} saved', { noun: capitalise(t(this.noun)) }));
  }
}

const IMPORTS = [ListToolbar, DataTable, MatButton, MatIcon, TranslatePipe];

@Component({
  selector: 'app-potentiometer-type-table',
  imports: IMPORTS,
  templateUrl: './component-type-table.html',
  styleUrl: './component-type-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PotentiometerTypeTable extends ComponentTypeTableBase {
  protected readonly store = inject(PotentiometerTypesStore);
  protected readonly state = new ListState<ComponentType>(COMPONENT_TYPE_FIELDS, 'pot-types', inject(LookupService).resolver);
  protected readonly noun = 'potentiometer type';
  protected readonly nounPlural = 'potentiometer types';
  protected readonly title = 'Potentiometer types';
  protected readonly createLabel = 'New potentiometer type';

  constructor() {
    super();
    this.init();
  }
}

@Component({
  selector: 'app-switch-type-table',
  imports: IMPORTS,
  templateUrl: './component-type-table.html',
  styleUrl: './component-type-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchTypeTable extends ComponentTypeTableBase<SwitchType, SwitchTypeInput> {
  protected readonly store = inject(SwitchTypesStore);
  protected override readonly fields = SWITCH_TYPE_FIELDS;
  protected readonly state = new ListState<SwitchType>(SWITCH_TYPE_FIELDS, 'switch-types', inject(LookupService).resolver);
  protected readonly noun = 'switch type';
  protected readonly nounPlural = 'switch types';
  protected readonly title = 'Switch types';
  protected readonly createLabel = 'New switch type';

  constructor() {
    super();
    this.init();
  }
}

@Component({
  selector: 'app-wiring-pickup-type-table',
  imports: IMPORTS,
  templateUrl: './component-type-table.html',
  styleUrl: './component-type-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WiringPickupTypeTable extends ComponentTypeTableBase<WiringPickupType, WiringPickupTypeInput> {
  protected readonly store = inject(WiringPickupTypesStore);
  protected override readonly fields = WIRING_PICKUP_TYPE_FIELDS;
  protected override readonly groups = WIRING_PICKUP_TYPE_GROUPS;
  protected readonly state = new ListState<WiringPickupType>(
    WIRING_PICKUP_TYPE_FIELDS,
    'wiring-pickup-types',
    inject(LookupService).resolver,
  );
  protected readonly noun = 'pickup type';
  protected readonly nounPlural = 'pickup types';
  protected readonly title = 'Pickup types';
  protected readonly createLabel = 'New pickup type';

  constructor() {
    super();
    this.init();
  }
}

@Component({
  selector: 'app-pot-layout-table',
  imports: IMPORTS,
  templateUrl: './component-type-table.html',
  styleUrl: './component-type-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PotLayoutTable extends ComponentTypeTableBase<PotLayout, PotLayoutInput> {
  protected readonly store = inject(PotLayoutsStore);
  protected override readonly fields = POT_LAYOUT_FIELDS;
  protected override readonly groups = POT_LAYOUT_GROUPS;
  protected readonly state = new ListState<PotLayout>(POT_LAYOUT_FIELDS, 'pot-layouts', inject(LookupService).resolver);
  protected readonly noun = 'pot layout';
  protected readonly nounPlural = 'pot layouts';
  protected readonly title = 'Pot layouts';
  protected readonly createLabel = 'New pot layout';

  constructor() {
    super();
    this.init();
  }
}
