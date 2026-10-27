import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatAnchor, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { PICKUP_FIELDS, PICKUP_GROUPS, PickupType, t } from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';
import { LookupService } from '../../core/lookups';
import { NotifyService } from '../../core/notify';
import { PickupSetsStore, PickupsStore } from '../../core/store/stores';
import { AttachmentsPanel } from '../../shared/attachments/attachments-panel';
import { ConfirmService } from '../../shared/confirm/confirm';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { EntityDetails } from '../../shared/entity-details/entity-details';
import { PageHeader } from '../../shared/page-header/page-header';

@Component({
  selector: 'app-pickup-detail',
  imports: [PageHeader, EntityDetails, AttachmentsPanel, EmptyState, MatAnchor, MatIconButton, MatIcon, MatTooltip, RouterLink, TranslatePipe],
  templateUrl: './pickup-detail.html',
  styleUrl: './pickup-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickupDetail {
  private readonly store = inject(PickupsStore);
  private readonly sets = inject(PickupSetsStore);
  private readonly lookups = inject(LookupService);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);
  private readonly notify = inject(NotifyService);

  /** Route parameter. */
  readonly id = input.required<string>();

  protected readonly fields = PICKUP_FIELDS;
  protected readonly groups = PICKUP_GROUPS;
  protected readonly numericId = computed(() => Number(this.id()));
  protected readonly pickup = computed(() => this.store.byId().get(this.numericId()));
  protected readonly missing = computed(() => this.store.loaded() && !this.pickup());

  protected readonly subtitle = computed(() => {
    const pickup = this.pickup();
    if (!pickup) return '';
    const manufacturer = pickup.manufacturerId ? this.lookups.resolver()(this.fields[1], pickup.manufacturerId) : null;
    return [manufacturer, pickup.type && t(PickupType.label(pickup.type)), pickup.year].filter(Boolean).join(' · ');
  });

  protected readonly memberOf = computed(() => {
    const id = this.numericId();
    return this.sets.rows().filter((set) => set.neckId === id || set.middleId === id || set.bridgeId === id);
  });

  constructor() {
    void this.store.ensureLoaded();
    void this.sets.ensureLoaded();
    void this.lookups.ensureLoaded();
  }

  protected async remove(): Promise<void> {
    const pickup = this.pickup();
    if (!pickup || !(await this.confirm.confirmDelete(1, 'pickup'))) return;
    await this.store.remove([pickup.id]);
    this.notify.undoable(t('{noun} deleted', { noun: t('Pickup') }), () => this.store.restore([pickup.id]));
    void this.router.navigate(['/pickups']);
  }
}
