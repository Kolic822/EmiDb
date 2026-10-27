import { ChangeDetectionStrategy, Component, effect, ElementRef, input, signal, viewChild } from '@angular/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { TranslatePipe } from '../../core/i18n';

const MAX_PAGES = 40;

/**
 * Renders a PDF's pages with pdf.js so previews work everywhere, including
 * Android tablets where browsers cannot show PDFs inside a page.
 */
@Component({
  selector: 'app-pdf-viewer',
  imports: [MatProgressBar, TranslatePipe],
  template: `
    @if (state() === 'loading') {
      <mat-progress-bar mode="indeterminate" />
    }
    @if (state() === 'failed') {
      <p class="muted">{{ 'This PDF could not be displayed. Use Download to open it.' | t }}</p>
    }
    <div #pages class="pages"></div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      height: 100%;
      overflow: auto;
      -webkit-overflow-scrolling: touch;
    }

    .pages {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 12px;
    }

    .pages canvas {
      max-width: 100%;
      height: auto;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    }

    p {
      padding: 24px;
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PdfViewer {
  readonly src = input.required<string>();
  protected readonly state = signal<'loading' | 'ready' | 'failed'>('loading');
  private readonly pages = viewChild.required<ElementRef<HTMLDivElement>>('pages');

  constructor() {
    effect((onCleanup) => {
      const src = this.src();
      let cancelled = false;
      onCleanup(() => (cancelled = true));
      this.state.set('loading');
      void this.render(src, () => cancelled).catch((error: unknown) => {
        console.error('PDF preview failed', error);
        this.state.set('failed');
      });
    });
  }

  private async render(src: string, isCancelled: () => boolean): Promise<void> {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc ||= '/pdf.worker.min.mjs';
    const pdf = await pdfjs.getDocument({ url: src }).promise;
    const container = this.pages().nativeElement;
    container.replaceChildren();
    // The dialog may not be laid out yet when the effect runs; measure after a frame.
    await new Promise((resolve) => requestAnimationFrame(resolve));
    const available = container.clientWidth || container.parentElement?.clientWidth || 800;
    const width = Math.max(320, Math.min(available - 24, 1200));
    const ratio = window.devicePixelRatio || 1;

    for (let n = 1; n <= Math.min(pdf.numPages, MAX_PAGES); n++) {
      if (isCancelled()) return;
      const page = await pdf.getPage(n);
      const scale = width / page.getViewport({ scale: 1 }).width;
      const viewport = page.getViewport({ scale: scale * ratio });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${width}px`;
      container.append(canvas);
      await page.render({ canvas, viewport }).promise;
      if (n === 1) this.state.set('ready');
    }
  }
}
