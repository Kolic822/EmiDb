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
  WiringDiagram,
  WiringDiagramInput,
  WiringPickupType,
  WiringPickupTypeInput,
} from '@emidb/shared';
import { CrudApi } from '../http/crud-api';
import { EntityStore } from './entity-store';

@Injectable({ providedIn: 'root' })
export class ManufacturersStore extends EntityStore<Manufacturer, ManufacturerInput> {
  protected readonly api = new CrudApi<Manufacturer, ManufacturerInput>('manufacturers');
}

@Injectable({ providedIn: 'root' })
export class PickupsStore extends EntityStore<Pickup, PickupInput> {
  protected readonly api = new CrudApi<Pickup, PickupInput>('pickups');

  /** Sets that include the given pickup. */
  setsOf(id: number): Promise<PickupSet[]> {
    return this.api.getRelated<PickupSet>(id, 'sets');
  }
}

@Injectable({ providedIn: 'root' })
export class PickupSetsStore extends EntityStore<PickupSet, PickupSetInput> {
  protected readonly api = new CrudApi<PickupSet, PickupSetInput>('pickup-sets');
}

@Injectable({ providedIn: 'root' })
export class WiringDiagramsStore extends EntityStore<WiringDiagram, WiringDiagramInput> {
  protected readonly api = new CrudApi<WiringDiagram, WiringDiagramInput>('wiring-diagrams');
}

@Injectable({ providedIn: 'root' })
export class WiringPickupTypesStore extends EntityStore<WiringPickupType, WiringPickupTypeInput> {
  protected readonly api = new CrudApi<WiringPickupType, WiringPickupTypeInput>('wiring-pickup-types');
}

@Injectable({ providedIn: 'root' })
export class PotentiometerTypesStore extends EntityStore<ComponentType, ComponentTypeInput> {
  protected readonly api = new CrudApi<ComponentType, ComponentTypeInput>('potentiometer-types');
}

@Injectable({ providedIn: 'root' })
export class SwitchTypesStore extends EntityStore<ComponentType, ComponentTypeInput> {
  protected readonly api = new CrudApi<ComponentType, ComponentTypeInput>('switch-types');
}
