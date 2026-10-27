import { ChangeDetectionStrategy, Component, effect, ElementRef, input, signal, viewChild } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

/** Renders the first page of a PDF into a canvas; falls back to an icon. pdf.js is loaded on demand. */
@Component({
  selector: 'app-pdf-thumbnail',
  imports: [MatIcon],
  template: `
    <canvas #canvas [class.hidden]="state() !== 'ready'"></canvas>
    @if (state() !== 'ready') {
      <mat-icon>picture_as_pdf</mat-icon>
      <span class="ext">PDF</span>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: var(--mat-sys-surface-container);
    }

    canvas {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top;
      background: #fff;
    }

    .hidden {
      display: none;
    }

    mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }

    .ext {
      font: var(--mat-sys-label-small);
      letter-spacing: 0.06em;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfThumbnail {
  readonly src = input.required<string>();
  /** Render width in CSS pixels; the canvas is drawn at device resolution. */
  readonly width = input(240);

  protected readonly state = signal<'loading' | 'ready' | 'failed'>('loading');
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    effect((onCleanup) => {
      const src = this.src();
      let cancelled = false;
      onCleanup(() => (cancelled = true));
      this.state.set('loading');
      void this.render(src, () => cancelled).catch(() => this.state.set('failed'));
    });
  }

  private async render(src: string, isCancelled: () => boolean): Promise<void> {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc ||= '/pdf.worker.min.mjs';
    const pdf = await pdfjs.getDocument({ url: src }).promise;
    const page = await pdf.getPage(1);
    if (isCancelled()) return;

    const scale = (this.width() / page.getViewport({ scale: 1 }).width) * (window.devicePixelRatio || 1);
    const viewport = page.getViewport({ scale });
    const canvas = this.canvas().nativeElement;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvas, viewport }).promise;
    if (!isCancelled()) this.state.set('ready');
  }
}
