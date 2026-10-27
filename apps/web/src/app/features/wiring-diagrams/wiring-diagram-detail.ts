import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatAnchor, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { WIRING_DIAGRAM_FIELDS, WIRING_DIAGRAM_GROUPS, WiringType } from '@emidb/shared';
import { LookupService } from '../../core/lookups';
import { NotifyService } from '../../core/notify';
import { WiringDiagramsStore } from '../../core/store/stores';
import { AttachmentsPanel } from '../../shared/attachments/attachments-panel';
import { ConfirmService } from '../../shared/confirm/confirm';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { EntityDetails } from '../../shared/entity-details/entity-details';
import { PageHeader } from '../../shared/page-header/page-header';

@Component({
  selector: 'app-wiring-diagram-detail',
  imports: [PageHeader, EntityDetails, AttachmentsPanel, EmptyState, MatAnchor, MatIconButton, MatIcon, MatTooltip, RouterLink],
  templateUrl: './wiring-diagram-detail.html',
  styleUrl: './wiring-diagram-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WiringDiagramDetail {
  private readonly store = inject(WiringDiagramsStore);
  private readonly lookups = inject(LookupService);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmService);
  private readonly notify = inject(NotifyService);

  readonly id = input.required<string>();

  protected readonly fields = WIRING_DIAGRAM_FIELDS;
  protected readonly groups = WIRING_DIAGRAM_GROUPS;
  protected readonly numericId = computed(() => Number(this.id()));
  protected readonly diagram = computed(() => this.store.byId().get(this.numericId()));
  protected readonly missing = computed(() => this.store.loaded() && !this.diagram());
  protected readonly subtitle = computed(() => {
    const diagram = this.diagram();
    if (!diagram) return '';
    const manufacturer = diagram.manufacturerId
      ? this.lookups.resolver()(WIRING_DIAGRAM_FIELDS[1], diagram.manufacturerId)
      : null;
    return [manufacturer, WiringType.label(diagram.wiringType)].filter(Boolean).join(' · ');
  });

  constructor() {
    void this.store.ensureLoaded();
    void this.lookups.ensureLoaded();
  }

  protected async remove(): Promise<void> {
    const diagram = this.diagram();
    if (!diagram || !(await this.confirm.confirmDelete(1, 'wiring diagram'))) return;
    await this.store.remove([diagram.id]);
    this.notify.success('Wiring diagram deleted');
    void this.router.navigate(['/wiring-diagrams']);
  }
}
