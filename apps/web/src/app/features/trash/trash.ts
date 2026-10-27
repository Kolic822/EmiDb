import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { type TrashItem, TrashKind, t } from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';
import { NotifyService } from '../../core/notify';
import { TRASH_RETENTION_DAYS, TrashStore } from '../../core/store/trash-store';
import { ConfirmService } from '../../shared/confirm/confirm';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { PageHeader } from '../../shared/page-header/page-header';

@Component({
  selector: 'app-trash',
  imports: [PageHeader, EmptyState, MatButton, MatIcon, TranslatePipe],
  templateUrl: './trash.html',
  styleUrl: './trash.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Trash {
  protected readonly store = inject(TrashStore);
  private readonly confirm = inject(ConfirmService);
  private readonly notify = inject(NotifyService);
  protected readonly retention = TRASH_RETENTION_DAYS;

  constructor() {
    void this.store.load();
  }

  protected kindLabel(item: TrashItem): string {
    return TrashKind.label(item.kind);
  }

  protected deletedOn(item: TrashItem): string {
    return new Date(item.deletedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
  }

  /** Whole days left before the entry disappears for good. */
  protected daysLeft(item: TrashItem): number {
    const age = (Date.now() - new Date(item.deletedAt).getTime()) / 86_400_000;
    return Math.max(0, Math.ceil(TRASH_RETENTION_DAYS - age));
  }

  protected async restore(item: TrashItem): Promise<void> {
    await this.store.restore(item);
    this.notify.success(t('Restored'));
  }

  protected async purge(item: TrashItem): Promise<void> {
    const ok = await this.confirm.confirm({
      title: t('Delete permanently?'),
      message: t('“{name}” and its files will be removed for good.', { name: item.name }),
      confirmLabel: t('Delete permanently'),
      danger: true,
    });
    if (ok) await this.store.purge(item);
  }

  protected async empty(): Promise<void> {
    const ok = await this.confirm.confirm({
      title: t('Empty the trash?'),
      message: t('Everything in the trash and its files will be removed for good.'),
      confirmLabel: t('Empty trash'),
      danger: true,
    });
    if (ok) await this.store.empty();
  }
}
