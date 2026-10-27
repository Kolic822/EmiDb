import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { t, WIRING_DIAGRAM_GROUPS, type WiringDiagram } from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';
import { LookupService } from '../../core/lookups';
import { WiringDiagramsStore } from '../../core/store/stores';
import { DataTable } from '../../shared/data-table/data-table';
import { FilterPanel } from '../../shared/filter-panel/filter-panel';
import { PageHeader } from '../../shared/page-header/page-header';
import { WiringDiagramListState } from './wiring-diagram-list-state';

@Component({
  selector: 'app-wiring-diagram-filter',
  imports: [PageHeader, FilterPanel, DataTable, MatButton, MatAnchor, MatIcon, RouterLink, TranslatePipe],
  templateUrl: './wiring-diagram-filter.html',
  styleUrl: '../pickups/pickup-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WiringDiagramFilter {
  protected readonly store = inject(WiringDiagramsStore);
  protected readonly state = inject(WiringDiagramListState);
  protected readonly groups = WIRING_DIAGRAM_GROUPS;
  private readonly router = inject(Router);
  private readonly lookups = inject(LookupService);

  protected readonly rows = this.state.view(this.store.rows);
  protected readonly subtitle = computed(() =>
    t('{shown} of {total} diagrams match', { shown: this.rows().length, total: this.store.rows().length }),
  );

  constructor() {
    void this.store.ensureLoaded();
    void this.lookups.ensureLoaded();
  }

  protected open(diagram: WiringDiagram): void {
    void this.router.navigate(['/wiring-diagrams', diagram.id]);
  }
}
