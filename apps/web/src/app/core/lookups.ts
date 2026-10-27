import { computed, inject, Injectable } from '@angular/core';
import type { FieldDef, FieldKind, LookupResolver } from '@emidb/shared';
import {
  ManufacturersStore,
  PickupsStore,
  PotentiometerTypesStore,
  SwitchTypesStore,
} from './store/stores';

type LookupKind = Extract<FieldKind, 'manufacturer' | 'pickup' | 'potentiometerType' | 'switchType'>;

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
  } satisfies Record<LookupKind, unknown>;

  /** Recomputed whenever any lookup collection changes. */
  readonly resolver = computed<LookupResolver>(() => {
    const maps = {
      manufacturer: this.stores.manufacturer.byId(),
      pickup: this.stores.pickup.byId(),
      potentiometerType: this.stores.potentiometerType.byId(),
      switchType: this.stores.switchType.byId(),
    };
    return (field, id) => maps[field.kind as LookupKind]?.get(id)?.name;
  });

  ensureLoaded(): Promise<void> {
    return Promise.all(Object.values(this.stores).map((store) => store.ensureLoaded())).then(() => undefined);
  }

  /** Select options for a lookup field, sorted by name. */
  options(field: FieldDef<any>): LookupOption[] {
    const store = this.stores[field.kind as LookupKind];
    if (!store) return [];
    return store
      .rows()
      .map((row) => ({ value: row.id, label: row.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  isLookup(field: FieldDef<any>): boolean {
    return field.kind in this.stores;
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
        const row = await this.stores.switchType.create({ name, description: null });
        return row.id;
      }
      default:
        throw new Error(`Cannot create ${field.kind} inline`);
    }
  }
}
