import { ChangeDetectionStrategy, Component, computed, effect, inject, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { type Attachment, type AttachmentOwner, t } from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';
import { AttachmentsApi } from '../../core/http/attachments-api';
import { NotifyService } from '../../core/notify';
import { ConfirmService } from '../confirm/confirm';
import { FileSizePipe } from '../pipes/file-size.pipe';
import { AttachmentPreview } from './attachment-preview';
import { PdfThumbnail } from './pdf-thumbnail';
import { PdfViewer } from './pdf-viewer';

/** One card in the grid: a stored attachment, or a file waiting for the first save. */
interface Tile {
  key: string;
  name: string;
  size: number;
  caption: string | null;
  isImage: boolean;
  isPdf: boolean;
  /** Source for an image or PDF thumbnail (API url or object URL). */
  src: string | null;
  attachment?: Attachment;
  file?: File;
}

/**
 * Files linked to one entity: upload (click or drop), preview, caption, delete.
 * Without an `ownerId` (creating a new entity) files are collected in `pending`
 * and the owner uploads them once it has an id.
 */
@Component({
  selector: 'app-attachments-panel',
  imports: [FormsModule, MatButton, MatIconButton, MatIcon, MatProgressBar, MatTooltip, FileSizePipe, PdfThumbnail, PdfViewer, TranslatePipe],
  templateUrl: './attachments-panel.html',
  styleUrl: './attachments-panel.scss',
  host: {
    '[class.dragging]': 'dragging()',
    '[class.inline]': 'inlinePreview()',
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'dragging.set(false)',
    '(drop)': 'onDrop($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachmentsPanel {
  private readonly api = inject(AttachmentsApi);
  private readonly notify = inject(NotifyService);
  private readonly confirm = inject(ConfirmService);
  private readonly dialog = inject(MatDialog);

  readonly owner = input.required<AttachmentOwner>();
  readonly ownerId = input<number | null>();
  /** Files chosen before the owner exists. */
  readonly pending = model<File[]>([]);
  /** Shows the selected image or PDF large inside the panel instead of only as thumbnails. */
  readonly inlinePreview = input(false);
  private readonly selectedKey = signal<string | null>(null);

  protected readonly items = signal<Attachment[]>([]);
  protected readonly busy = signal(false);
  protected readonly dragging = signal(false);
  protected readonly editingId = signal<number | null>(null);
  protected captionDraft = '';

  protected readonly isPending = computed(() => this.ownerId() == null);
  private readonly objectUrls = new Map<File, string>();

  protected readonly tiles = computed<Tile[]>(() =>
    this.isPending()
      ? this.pending().map((file, index) => this.fileTile(file, index))
      : this.items().map((item) => this.attachmentTile(item)),
  );

  /** The tile shown large: the chosen one, else the first image or PDF. */
  protected readonly selected = computed<Tile | null>(() => {
    if (!this.inlinePreview()) return null;
    const previewable = this.tiles().filter((tile) => tile.attachment && (tile.isImage || tile.isPdf));
    return previewable.find((tile) => tile.key === this.selectedKey()) ?? previewable[0] ?? null;
  });

  constructor() {
    effect(() => {
      const owner = this.owner();
      const ownerId = this.ownerId();
      if (ownerId == null) {
        this.items.set([]);
        return;
      }
      void this.api.list(owner, ownerId).then((items) => this.items.set(items));
    });
  }

  protected icon(tile: Tile): string {
    if (tile.isPdf) return 'picture_as_pdf';
    if (/\.(docx?|odt|rtf)$/i.test(tile.name)) return 'description';
    if (/\.(xlsx?|ods|csv)$/i.test(tile.name)) return 'table';
    if (/\.(dxf|dwg)$/i.test(tile.name)) return 'architecture';
    return 'draft';
  }

  protected onFilesPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    void this.add(Array.from(input.files ?? []));
    input.value = '';
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    void this.add(Array.from(event.dataTransfer?.files ?? []));
  }

  protected open(tile: Tile): void {
    const item = tile.attachment;
    if (!item) return;
    if (this.inlinePreview() && (tile.isImage || tile.isPdf)) {
      this.selectedKey.set(tile.key);
      return;
    }
    this.expand(tile);
  }

  /** Full-size preview in a dialog. */
  protected expand(tile: Tile): void {
    const item = tile.attachment;
    if (!item) return;
    if (tile.isImage || tile.isPdf) {
      this.dialog.open(AttachmentPreview, { data: item, maxWidth: '96vw', width: '1100px', height: '90vh' });
      return;
    }
    window.open(`${item.url}?download`, '_blank', 'noopener');
  }

  protected startEdit(item: Attachment): void {
    this.captionDraft = item.caption ?? '';
    this.editingId.set(item.id);
  }

  protected async saveCaption(item: Attachment): Promise<void> {
    const caption = this.captionDraft.trim() || null;
    this.editingId.set(null);
    if (caption === item.caption) return;
    const updated = await this.api.updateCaption(item.id, caption);
    this.items.update((items) => items.map((i) => (i.id === updated.id ? updated : i)));
  }

  protected async remove(tile: Tile): Promise<void> {
    if (tile.file) {
      this.releaseUrl(tile.file);
      this.pending.update((files) => files.filter((f) => f !== tile.file));
      return;
    }
    const item = tile.attachment!;
    const ok = await this.confirm.confirm({
      title: t('Delete file?'),
      message: t('“{name}” will be removed permanently.', { name: item.fileName }),
      confirmLabel: t('Delete'),
      danger: true,
    });
    if (!ok) return;
    await this.api.remove(item.id);
    this.items.update((items) => items.filter((i) => i.id !== item.id));
  }

  private async add(files: File[]): Promise<void> {
    if (!files.length) return;
    if (this.isPending()) {
      this.pending.update((current) => [...current, ...files]);
      return;
    }
    this.busy.set(true);
    try {
      for (const file of files) {
        const created = await this.api.upload(this.owner(), this.ownerId()!, file);
        this.items.update((items) => [created, ...items]);
      }
      this.notify.success(files.length === 1 ? t('File uploaded') : t('{count} files uploaded', { count: files.length }));
    } catch {
      // The HTTP interceptor already reported the error.
    } finally {
      this.busy.set(false);
    }
  }

  private attachmentTile(item: Attachment): Tile {
    const isImage = item.mimeType.startsWith('image/');
    const isPdf = item.mimeType === 'application/pdf';
    return {
      key: `a${item.id}`,
      name: item.fileName,
      size: item.size,
      caption: item.caption,
      isImage,
      isPdf,
      src: isImage || isPdf ? item.url : null,
      attachment: item,
    };
  }

  private fileTile(file: File, index: number): Tile {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';
    return {
      key: `f${index}-${file.name}`,
      name: file.name,
      size: file.size,
      caption: null,
      isImage,
      isPdf,
      src: isImage || isPdf ? this.objectUrl(file) : null,
      file,
    };
  }

  private objectUrl(file: File): string {
    let url = this.objectUrls.get(file);
    if (!url) {
      url = URL.createObjectURL(file);
      this.objectUrls.set(file, url);
    }
    return url;
  }

  private releaseUrl(file: File): void {
    const url = this.objectUrls.get(file);
    if (url) URL.revokeObjectURL(url);
    this.objectUrls.delete(file);
  }
}
