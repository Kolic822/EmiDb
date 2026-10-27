import { computed, inject, Injectable } from '@angular/core';
import { type FieldDef, type FieldKind, type LookupResolver, lookupMatches } from '@emidb/shared';
import {
  ManufacturersStore,
  PickupsStore,
  PotentiometerTypesStore,
  PotLayoutsStore,
  SwitchTypesStore,
  WiringPickupTypesStore,
} from './store/stores';

type LookupKind = Extract<
  FieldKind,
  'manufacturer' | 'pickup' | 'potentiometerType' | 'switchType' | 'wiringPickupType' | 'potLayout'
>;

export interface LookupOption {
  value: number;
  label: string;
}

/** Resolves ids of referenced entities (manufacturer, pickup, pot/switch types) to names. */
@Injectable({ providedIn: 'root' })
export class LookupService {
  private readonly stores = {
    manufacturer: inject(ManufacturersStore),
    pickup: inject(PickupsStore),
    potentiometerType: inject(PotentiometerTypesStore),
    switchType: inject(SwitchTypesStore),
    wiringPickupType: inject(WiringPickupTypesStore),
    potLayout: inject(PotLayoutsStore),
  } satisfies Record<LookupKind, unknown>;

  /** Recomputed whenever any lookup collection changes. */
  readonly resolver = computed<LookupResolver>(() => {
    const maps = {
      manufacturer: this.stores.manufacturer.byId(),
      pickup: this.stores.pickup.byId(),
      potentiometerType: this.stores.potentiometerType.byId(),
      switchType: this.stores.switchType.byId(),
      wiringPickupType: this.stores.wiringPickupType.byId(),
      potLayout: this.stores.potLayout.byId(),
    };
    return (field, id) => maps[field.kind as LookupKind]?.get(id)?.name;
  });

  ensureLoaded(): Promise<void> {
    return Promise.all(Object.values(this.stores).map((store) => store.ensureLoaded())).then(() => undefined);
  }

  /**
   * Select options for a lookup field, sorted by name. `record` (the row being
   * edited) narrows dependent lookups, e.g. pickup types to the diagram's instrument.
   */
  options(field: FieldDef<any>, record?: Partial<Record<string, unknown>> | null): LookupOption[] {
    const store = this.stores[field.kind as LookupKind];
    if (!store) return [];
    return (store.rows() as { id: number; name: string; instrument?: any }[])
      .filter((row) => lookupMatches(field, row, record))
      .map((row) => ({ value: row.id, label: row.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  isLookup(field: FieldDef<any>): boolean {
    return field.kind in this.stores;
  }

  /** Pot layout by id, for the "Layout" quick-fill in the wiring diagram form. */
  potLayout(id: number) {
    return this.stores.potLayout.byId().get(id);
  }

  /** Creates a lookup entry with just a name (for "Add new…" in dropdowns) and returns its id. */
  async create(field: FieldDef<any>, name: string): Promise<number> {
    switch (field.kind as LookupKind) {
      case 'manufacturer': {
        const row = await this.stores.manufacturer.create({ name, country: null, website: null, notes: null });
        return row.id;
      }
      case 'potentiometerType': {
        const row = await this.stores.potentiometerType.create({ name, description: null });
        return row.id;
      }
      case 'switchType': {
        const row = await this.stores.switchType.create({ name, manufacturerId: null, description: null });
        return row.id;
      }
      case 'wiringPickupType': {
        const row = await this.stores.wiringPickupType.create({ name, instrument: null, description: null });
        return row.id;
      }
      default:
        throw new Error(`Cannot create ${field.kind} inline`);
    }
  }
}
