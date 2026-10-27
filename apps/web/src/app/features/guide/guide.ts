import { ChangeDetectionStrategy, Component, DestroyRef, effect, ElementRef, inject, signal, viewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { GUIDE_SECTIONS, GUIDE_TEXT, type GuideImage } from '@emidb/shared';
import { LanguageService, TranslatePipe } from '../../core/i18n';
import { AttachmentPreview } from '../../shared/attachments/attachment-preview';
import { PageHeader } from '../../shared/page-header/page-header';

/** Step-by-step explanation of every page, with a screenshot of each. */
@Component({
  selector: 'app-guide',
  imports: [PageHeader, MatIcon, TranslatePipe],
  templateUrl: './guide.html',
  styleUrl: './guide.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Guide {
  private readonly dialog = inject(MatDialog);
  private readonly language = inject(LanguageService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly text = GUIDE_TEXT;
  protected readonly sections = GUIDE_SECTIONS;
  /** The section the reader is currently in, for highlighting in the contents. */
  protected readonly current = signal(GUIDE_SECTIONS[0].id);
  private readonly sectionElements = viewChildren<ElementRef<HTMLElement>>('section');

  constructor() {
    effect(() => {
      const elements = this.sectionElements();
      if (!elements.length || typeof IntersectionObserver === 'undefined') return;
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((entry) => entry.isIntersecting);
          if (visible.length) this.current.set(visible[0].target.id);
        },
        { rootMargin: '-10% 0px -75% 0px' },
      );
      for (const element of elements) observer.observe(element.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  protected imageUrl(image: GuideImage): string {
    return `/guide/${this.language.current()}/${image.file}.jpg`;
  }

  protected goTo(id: string): void {
    this.current.set(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected enlarge(image: GuideImage): void {
    this.dialog.open(AttachmentPreview, {
      data: { url: this.imageUrl(image), mimeType: 'image/jpeg', fileName: `${image.file}.jpg`, caption: image.caption },
      maxWidth: '96vw',
      width: '1280px',
      height: '90vh',
    });
  }
}
