import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { PICKUP_GROUPS, type Pickup } from '@emidb/shared';
import { LookupService } from '../../core/lookups';
import { PickupsStore } from '../../core/store/stores';
import { DataTable } from '../../shared/data-table/data-table';
import { FilterPanel } from '../../shared/filter-panel/filter-panel';
import { PageHeader } from '../../shared/page-header/page-header';
import { PickupListState } from './pickup-list-state';

/**
 * Filter view: a form on the left, live results on the right.
 * Criteria live in the shared PickupListState, so going back to the table
 * keeps the same filter (shown as chips there).
 */
@Component({
  selector: 'app-pickup-filter',
  imports: [PageHeader, FilterPanel, DataTable, MatButton, MatAnchor, MatIcon, RouterLink],
  templateUrl: './pickup-filter.html',
  styleUrl: './pickup-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickupFilter {
  protected readonly store = inject(PickupsStore);
  protected readonly state = inject(PickupListState);
  protected readonly groups = PICKUP_GROUPS;
  private readonly router = inject(Router);
  private readonly lookups = inject(LookupService);

  protected readonly rows = this.state.view(this.store.rows);
  protected readonly subtitle = computed(() => `${this.rows().length} of ${this.store.rows().length} pickups match`);
  protected readonly selectedIds = computed(() => [...this.state.selection()]);

  constructor() {
    void this.store.ensureLoaded();
    void this.lookups.ensureLoaded();
  }

  protected open(pickup: Pickup): void {
    void this.router.navigate(['/pickups', pickup.id]);
  }

  protected compare(): void {
    const ids = this.selectedIds().length >= 2 ? this.selectedIds() : this.rows().map((row) => row.id);
    void this.router.navigate(['/pickups/compare'], { queryParams: { ids: ids.join(',') } });
  }
}
