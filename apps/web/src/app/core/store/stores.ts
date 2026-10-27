import { Injectable } from '@angular/core';
import type {
  ComponentType,
  ComponentTypeInput,
  Manufacturer,
  ManufacturerInput,
  Pickup,
  PickupInput,
  PickupSet,
  PickupSetInput,
  PotLayout,
  PotLayoutInput,
  SwitchType,
  SwitchTypeInput,
  WiringDiagram,
  WiringDiagramInput,
  WiringPickupType,
  WiringPickupTypeInput,
} from '@emidb/shared';
import { CrudApi } from '../http/crud-api';
import { EntityStore } from './entity-store';

@Injectable({ providedIn: 'root' })
export class ManufacturersStore extends EntityStore<Manufacturer, ManufacturerInput> {
  readonly trashKind = 'manufacturer' as const;
  protected readonly api = new CrudApi<Manufacturer, ManufacturerInput>('manufacturers');
}

@Injectable({ providedIn: 'root' })
export class PickupsStore extends EntityStore<Pickup, PickupInput> {
  readonly trashKind = 'pickup' as const;
  protected readonly api = new CrudApi<Pickup, PickupInput>('pickups');

  /** Sets that include the given pickup. */
  setsOf(id: number): Promise<PickupSet[]> {
    return this.api.getRelated<PickupSet>(id, 'sets');
  }
}

@Injectable({ providedIn: 'root' })
export class PickupSetsStore extends EntityStore<PickupSet, PickupSetInput> {
  readonly trashKind = 'pickupSet' as const;
  protected readonly api = new CrudApi<PickupSet, PickupSetInput>('pickup-sets');
}

@Injectable({ providedIn: 'root' })
export class WiringDiagramsStore extends EntityStore<WiringDiagram, WiringDiagramInput> {
  readonly trashKind = 'wiringDiagram' as const;
  protected readonly api = new CrudApi<WiringDiagram, WiringDiagramInput>('wiring-diagrams');
}

@Injectable({ providedIn: 'root' })
export class WiringPickupTypesStore extends EntityStore<WiringPickupType, WiringPickupTypeInput> {
  readonly trashKind = 'wiringPickupType' as const;
  protected readonly api = new CrudApi<WiringPickupType, WiringPickupTypeInput>('wiring-pickup-types');
}

@Injectable({ providedIn: 'root' })
export class PotentiometerTypesStore extends EntityStore<ComponentType, ComponentTypeInput> {
  readonly trashKind = 'potentiometerType' as const;
  protected readonly api = new CrudApi<ComponentType, ComponentTypeInput>('potentiometer-types');
}

@Injectable({ providedIn: 'root' })
export class SwitchTypesStore extends EntityStore<SwitchType, SwitchTypeInput> {
  readonly trashKind = 'switchType' as const;
  protected readonly api = new CrudApi<SwitchType, SwitchTypeInput>('switch-types');
}

@Injectable({ providedIn: 'root' })
export class PotLayoutsStore extends EntityStore<PotLayout, PotLayoutInput> {
  readonly trashKind = 'potLayout' as const;
  protected readonly api = new CrudApi<PotLayout, PotLayoutInput>('pot-layouts');
}
