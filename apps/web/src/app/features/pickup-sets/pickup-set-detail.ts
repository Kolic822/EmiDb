import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatAnchor, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { displayValue, PICKUP_FIELDS, type Pickup, PickupType } from '@emidb/shared';
import { LookupService } from '../../core/lookups';
import { NotifyService } from '../../core/notify';
import { PickupSetsStore, PickupsStore } from '../../core/store/stores';
import { AttachmentsPanel } from '../../shared/attachments/attachments-panel';
import { ConfirmService } from '../../shared/confirm/confirm';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { PageHeader } from '../../shared/page-header/page-header';

interface Slot {
  position: 'Neck' | 'Middle' | 'Bridge';
  pickup: Pickup | undefined;
}

const SPEC_KEYS: (keyof Pickup)[] = ['type', 'resistance', 'inductance', 'output', 'magnetType'];

@Component({
  selector: 'app-pickup-set-detail',
  imports: [PageHeader, AttachmentsPanel, EmptyState, MatAnchor, MatIconButton, MatIcon, MatTooltip, RouterLink],
  templateUrl: './pickup-set-detail.html',
  styleUrl: './pickup-set-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickupSetDetail {
  private readonly store = inject(PickupSetsStore);
  private readonly pickups = inject(PickupsStore);
  private readonly lookups = inject(LookupService);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);
  private readonly notify = inject(NotifyService);

  readonly id = input.required<string>();

  protected readonly numericId = computed(() => Number(this.id()));
  protected readonly set = computed(() => this.store.byId().get(this.numericId()));
  protected readonly missing = computed(() => this.store.loaded() && !this.set());
  protected readonly manufacturer = computed(() => {
    const set = this.set();
    return set?.manufacturerId ? this.lookups.resolver()(PICKUP_FIELDS[1], set.manufacturerId) ?? '' : '';
  });
  protected readonly slots = computed<Slot[]>(() => {
    const set = this.set();
    const byId = this.pickups.byId();
    if (!set) return [];
    return [
      { position: 'Neck', pickup: set.neckId ? byId.get(set.neckId) : undefined },
      { position: 'Middle', pickup: set.middleId ? byId.get(set.middleId) : undefined },
      { position: 'Bridge', pickup: set.bridgeId ? byId.get(set.bridgeId) : undefined },
    ];
  });
  protected readonly specFields = PICKUP_FIELDS.filter((f) => SPEC_KEYS.includes(f.key));
  protected readonly compareIds = computed(() =>
    this.slots()
      .map((slot) => slot.pickup?.id)
      .filter((id): id is number => id != null),
  );

  constructor() {
    void this.store.ensureLoaded();
    void this.pickups.ensureLoaded();
    void this.lookups.ensureLoaded();
  }

  protected spec(pickup: Pickup, key: keyof Pickup): string {
    const field = PICKUP_FIELDS.find((f) => f.key === key)!;
    return displayValue(field, pickup[key], this.lookups.resolver(), { withUnit: true }) || '—';
  }

  protected typeLabel(pickup: Pickup): string {
    return PickupType.label(pickup.type);
  }

  protected async remove(): Promise<void> {
    const set = this.set();
    if (!set || !(await this.confirm.confirmDelete(1, 'set'))) return;
    await this.store.remove([set.id]);
    this.notify.success('Set deleted');
    void this.router.navigate(['/sets']);
  }
}
