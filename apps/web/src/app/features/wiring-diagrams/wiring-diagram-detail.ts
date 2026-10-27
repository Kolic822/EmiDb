import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { MatAnchor, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { t, WIRING_DIAGRAM_FIELDS, WIRING_DIAGRAM_GROUPS, WiringType } from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';
import { LookupService } from '../../core/lookups';
import { NotifyService } from '../../core/notify';
import { storedSignal } from '../../core/storage';
import { WiringDiagramsStore } from '../../core/store/stores';
import { AttachmentsPanel } from '../../shared/attachments/attachments-panel';
import { ConfirmService } from '../../shared/confirm/confirm';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { EntityDetails } from '../../shared/entity-details/entity-details';
import { PageHeader } from '../../shared/page-header/page-header';

@Component({
  selector: 'app-wiring-diagram-detail',
  imports: [PageHeader, EntityDetails, AttachmentsPanel, EmptyState, MatAnchor, MatIconButton, MatIcon, MatTooltip, RouterLink, TranslatePipe],
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

  /** Share of the width taken by the details, in percent; the rest is the diagram. */
  protected readonly split = storedSignal('wiring.detailSplit', 66);
  protected readonly dragging = signal(false);
  private static readonly MIN_SPLIT = 30;
  private static readonly MAX_SPLIT = 78;
  private static readonly DEFAULT_SPLIT = 66;
  private static readonly HANDLE_WIDTH = 16;

  /** Drag the divider with a mouse, pen or finger. */
  protected startDrag(event: PointerEvent, container: HTMLElement): void {
    event.preventDefault();
    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);
    this.dragging.set(true);
    const rect = container.getBoundingClientRect();
    const usable = rect.width - WiringDiagramDetail.HANDLE_WIDTH;

    const move = (e: PointerEvent): void => {
      const ratio = ((e.clientX - rect.left - WiringDiagramDetail.HANDLE_WIDTH / 2) / usable) * 100;
      this.setSplit(ratio);
    };
    const end = (): void => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
      this.dragging.set(false);
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  }

  protected onSplitKey(event: KeyboardEvent): void {
    const step = event.shiftKey ? 8 : 2;
    if (event.key === 'ArrowLeft') this.setSplit(this.split() - step);
    else if (event.key === 'ArrowRight') this.setSplit(this.split() + step);
    else if (event.key === 'Home') this.resetSplit();
    else return;
    event.preventDefault();
  }

  protected resetSplit(): void {
    this.split.set(WiringDiagramDetail.DEFAULT_SPLIT);
  }

  private setSplit(value: number): void {
    const clamped = Math.min(WiringDiagramDetail.MAX_SPLIT, Math.max(WiringDiagramDetail.MIN_SPLIT, value));
    this.split.set(Math.round(clamped * 10) / 10);
  }

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
    return [manufacturer, diagram.wiringType && t(WiringType.label(diagram.wiringType))].filter(Boolean).join(' · ');
  });

  constructor() {
    void this.store.ensureLoaded();
    void this.lookups.ensureLoaded();
  }

  protected async remove(): Promise<void> {
    const diagram = this.diagram();
    if (!diagram || !(await this.confirm.confirmDelete(1, 'wiring diagram'))) return;
    await this.store.remove([diagram.id]);
    this.notify.undoable(t('{noun} deleted', { noun: t('Wiring diagram') }), () => this.store.restore([diagram.id]));
    void this.router.navigate(['/wiring-diagrams']);
  }
}
