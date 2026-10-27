import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import type { Attachment } from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';
import { PdfViewer } from './pdf-viewer';

@Component({
  selector: 'app-attachment-preview',
  imports: [MatIcon, MatIconButton, MatDialogClose, TranslatePipe, PdfViewer],
  template: `
    <header>
      <span class="title">{{ data.caption || data.fileName }}</span>
      <a mat-icon-button [href]="data.url + '?download'" target="_blank" rel="noopener" [attr.aria-label]="'Download' | t">
        <mat-icon>download</mat-icon>
      </a>
      <button mat-icon-button mat-dialog-close [aria-label]="'Close' | t"><mat-icon>close</mat-icon></button>
    </header>
    <div class="body">
      @if (data.mimeType === 'application/pdf') {
        <app-pdf-viewer [src]="data.url" />
      } @else {
        <img [src]="data.url" [alt]="data.caption || data.fileName" />
      }
    </div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
    }

    header {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 8px 8px 16px;
      border-bottom: var(--app-border);
    }

    .title {
      flex: 1;
      font: var(--mat-sys-title-medium);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    // The picture fills an absolutely positioned box instead of using percentage max-sizes:
    // iOS Safari does not resolve those inside a flex layout and lets the image overflow the dialog.
    .body {
      position: relative;
      flex: 1;
      min-height: 0;
      overflow: hidden;
      background: var(--mat-sys-surface-container);
    }

    .body > img,
    .body > app-pdf-viewer {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    img {
      object-fit: contain;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentPreview {
  protected readonly data = inject<Attachment>(MAT_DIALOG_DATA);
}
