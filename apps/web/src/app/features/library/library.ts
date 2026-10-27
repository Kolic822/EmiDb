import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { type LibraryItem } from '@emidb/shared';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '../../core/i18n';
import { API_BASE } from '../../core/http/crud-api';
import { AttachmentPreview } from '../../shared/attachments/attachment-preview';
import { PdfThumbnail } from '../../shared/attachments/pdf-thumbnail';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { PageHeader } from '../../shared/page-header/page-header';

type Kind = 'all' | 'image' | 'pdf';

/** Every reference file (manufacturer sheets, switch diagrams, pot layout sketches) in one place. */
@Component({
  selector: 'app-library',
  imports: [PageHeader, EmptyState, PdfThumbnail, MatIcon, MatButtonToggleGroup, MatButtonToggle, TranslatePipe],
  templateUrl: './library.html',
  styleUrl: './library.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Library {
  private readonly http = inject(HttpClient);
  private readonly dialog = inject(MatDialog);

  protected readonly items = signal<LibraryItem[]>([]);
  protected readonly loaded = signal(false);
  protected readonly query = signal('');
  protected readonly kind = signal<Kind>('all');

  protected readonly visible = computed(() => {
    const query = this.query().trim().toLowerCase();
    const kind = this.kind();
    return this.items().filter((item) => {
      if (kind === 'image' && !item.mimeType.startsWith('image/')) return false;
      if (kind === 'pdf' && item.mimeType !== 'application/pdf') return false;
      return !query || `${item.ownerName} ${item.fileName} ${item.caption ?? ''}`.toLowerCase().includes(query);
    });
  });

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    this.items.set(await firstValueFrom(this.http.get<LibraryItem[]>(`${API_BASE}/library`)));
    this.loaded.set(true);
  }

  protected isImage(item: LibraryItem): boolean {
    return item.mimeType.startsWith('image/');
  }

  protected isPdf(item: LibraryItem): boolean {
    return item.mimeType === 'application/pdf';
  }

  protected open(item: LibraryItem): void {
    if (this.isImage(item) || this.isPdf(item)) {
      this.dialog.open(AttachmentPreview, { data: item, maxWidth: '96vw', width: '1100px', height: '90vh' });
    } else {
      window.open(`${item.url}?download`, '_blank', 'noopener');
    }
  }
}
