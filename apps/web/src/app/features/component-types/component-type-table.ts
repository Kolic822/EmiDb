import { ChangeDetectionStrategy, Component, Directive, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {
  COMPONENT_TYPE_FIELDS,
  COMPONENT_TYPE_GROUPS,
  type ComponentType,
  type ComponentTypeInput,
} from '@emidb/shared';
import { t } from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';
import { LookupService } from '../../core/lookups';
import { PotentiometerTypesStore, SwitchTypesStore } from '../../core/store/stores';
import { DataTable } from '../../shared/data-table/data-table';
import { EntityDialogService } from '../../shared/entity-dialog/entity-dialog';
import { capitalise, EntityListBase } from '../../shared/entity-page/entity-list-base';
import { ListState } from '../../shared/list-state/list-state';
import { ListToolbar } from '../../shared/list-toolbar/list-toolbar';

/** Lookup tables are edited inline through a dialog instead of dedicated pages. */
@Directive()
abstract class ComponentTypeTableBase extends EntityListBase<ComponentType, ComponentTypeInput> {
  protected readonly groups = COMPONENT_TYPE_GROUPS;
  protected readonly basePath = '/components';
  private readonly dialogs = inject(EntityDialogService);

  protected override async create(): Promise<void> {
    const saved = await this.dialogs.open<ComponentType, ComponentTypeInput>({
      title: t(this.createLabel),
      fields: COMPONENT_TYPE_FIELDS,
      groups: COMPONENT_TYPE_GROUPS,
      submitLabel: 'Create',
      save: (input) => this.store.create(input),
    });
    if (saved) this.notify.success(t('{noun} created', { noun: capitalise(t(this.noun)) }));
  }

  protected override async open(row: ComponentType): Promise<void> {
    const saved = await this.dialogs.open<ComponentType, ComponentTypeInput>({
      title: t('Edit {name}', { name: row.name }),
      fields: COMPONENT_TYPE_FIELDS,
      groups: COMPONENT_TYPE_GROUPS,
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
export class SwitchTypeTable extends ComponentTypeTableBase {
  protected readonly store = inject(SwitchTypesStore);
  protected readonly state = new ListState<ComponentType>(COMPONENT_TYPE_FIELDS, 'switch-types', inject(LookupService).resolver);
  protected readonly noun = 'switch type';
  protected readonly nounPlural = 'switch types';
  protected readonly title = 'Switch types';
  protected readonly createLabel = 'New switch type';

  constructor() {
    super();
    this.init();
  }
}
