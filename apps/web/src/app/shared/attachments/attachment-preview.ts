import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogClose } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import type { Attachment } from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';

@Component({
  selector: 'app-attachment-preview',
  imports: [MatIcon, MatIconButton, MatDialogClose, TranslatePipe],
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
        <iframe [src]="pdfUrl" [title]="'PDF preview' | t"></iframe>
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

    .body {
      flex: 1;
      min-height: 0;
      display: grid;
      place-items: center;
      background: var(--mat-sys-surface-container);
    }

    iframe {
      width: 100%;
      height: 100%;
      border: 0;
    }

    img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentPreview {
  protected readonly data = inject<Attachment>(MAT_DIALOG_DATA);
  /** Same-origin API URL, so it is safe to embed. */
  protected readonly pdfUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(`${this.data.url}#toolbar=1`);
}
