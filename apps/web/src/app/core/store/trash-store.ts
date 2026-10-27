import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import type { TrashItem, TrashKind } from '@emidb/shared';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from '../http/crud-api';
import {
  ManufacturersStore,
  PickupSetsStore,
  PickupsStore,
  PotentiometerTypesStore,
  PotLayoutsStore,
  SwitchTypesStore,
  WiringDiagramsStore,
  WiringPickupTypesStore,
} from './stores';

/** Entries are removed for good after this many days in the trash. */
export const TRASH_RETENTION_DAYS = 30;

@Injectable({ providedIn: 'root' })
export class TrashStore {
  private readonly http = inject(HttpClient);
  private readonly url = `${API_BASE}/trash`;
  private readonly stores = {
    pickup: inject(PickupsStore),
    pickupSet: inject(PickupSetsStore),
    wiringDiagram: inject(WiringDiagramsStore),
    manufacturer: inject(ManufacturersStore),
    potentiometerType: inject(PotentiometerTypesStore),
    switchType: inject(SwitchTypesStore),
    wiringPickupType: inject(WiringPickupTypesStore),
    potLayout: inject(PotLayoutsStore),
  } satisfies Record<TrashKind, { load(): Promise<void> }>;

  readonly items = signal<TrashItem[]>([]);
  readonly loaded = signal(false);

  async load(): Promise<void> {
    this.items.set(await firstValueFrom(this.http.get<TrashItem[]>(this.url)));
    this.loaded.set(true);
  }

  async restore(item: TrashItem): Promise<void> {
    await firstValueFrom(this.http.post<void>(`${this.url}/${item.kind}/${item.id}/restore`, {}));
    this.drop(item);
    await this.stores[item.kind].load();
  }

  async purge(item: TrashItem): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.url}/${item.kind}/${item.id}`));
    this.drop(item);
  }

  async empty(): Promise<void> {
    await firstValueFrom(this.http.delete<void>(this.url));
    this.items.set([]);
  }

  private drop(item: TrashItem): void {
    this.items.update((items) => items.filter((i) => !(i.kind === item.kind && i.id === item.id)));
  }
}
