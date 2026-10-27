import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import type { Attachment } from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';
import { AttachmentPreview } from './attachment-preview';

/** Icon button that opens a row's attachment directly (menu when there are several). */
@Component({
  selector: 'app-attachment-button',
  imports: [MatIconButton, MatIcon, MatMenu, MatMenuItem, MatMenuTrigger, MatTooltip, TranslatePipe],
  template: `
    @if (items().length === 1) {
      <button mat-icon-button (click)="open(items()[0]); $event.stopPropagation()" [matTooltip]="items()[0].caption || items()[0].fileName" [attr.aria-label]="'Open {name}' | t: { name: items()[0].fileName }">
        <mat-icon>{{ icon(items()[0]) }}</mat-icon>
      </button>
    } @else if (items().length > 1) {
      <button mat-icon-button [matMenuTriggerFor]="menu" (click)="$event.stopPropagation()" [matTooltip]="'{count} files' | t: { count: items().length }" [attr.aria-label]="'{count} attachments' | t: { count: items().length }">
        <mat-icon>attach_file</mat-icon>
        <span class="count">{{ items().length }}</span>
      </button>
      <mat-menu #menu="matMenu">
        @for (item of items(); track item.id) {
          <button mat-menu-item (click)="open(item)">
            <mat-icon>{{ icon(item) }}</mat-icon>
            <span>{{ item.caption || item.fileName }}</span>
          </button>
        }
      </mat-menu>
    }
  `,
  styles: `
    :host {
      display: inline-block;
    }

    button[mat-icon-button] {
      position: relative;
      --mat-icon-button-state-layer-size: 32px;
      width: 32px;
      height: 32px;
      padding: 4px;
      color: var(--mat-sys-primary);
    }

    .count {
      position: absolute;
      right: 0;
      bottom: 0;
      min-width: 14px;
      height: 14px;
      border-radius: 7px;
      background: var(--mat-sys-primary);
      color: var(--mat-sys-on-primary);
      font-size: 9px;
      font-weight: 600;
      line-height: 14px;
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentButton {
  private readonly dialog = inject(MatDialog);

  readonly attachments = input<Attachment[] | undefined>();
  protected readonly items = computed(() => this.attachments() ?? []);

  protected icon(item: Attachment): string {
    if (item.mimeType.startsWith('image/')) return 'image';
    if (item.mimeType === 'application/pdf') return 'picture_as_pdf';
    return 'description';
  }

  protected open(item: Attachment): void {
    if (item.mimeType.startsWith('image/') || item.mimeType === 'application/pdf') {
      this.dialog.open(AttachmentPreview, { data: item, maxWidth: '96vw', width: '1100px', height: '90vh' });
      return;
    }
    window.open(`${item.url}?download`, '_blank', 'noopener');
  }
}
