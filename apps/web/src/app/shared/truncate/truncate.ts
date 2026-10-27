import { Directive, ElementRef, inject, input } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';

/**
 * Clips overflowing text with an ellipsis and shows the full text in a tooltip,
 * but only when the text really is cut off.
 *
 *   <td appTruncate [truncateText]="cell.text">{{ cell.text }}</td>
 */
@Directive({
  selector: '[appTruncate]',
  hostDirectives: [{ directive: MatTooltip, inputs: ['matTooltip: truncateText', 'matTooltipShowDelay'] }],
  host: { class: 'truncate', '(mouseenter)': 'updateTooltip()' },
})
export class Truncate {
  private readonly tooltip = inject(MatTooltip);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly truncateText = input<string>();

  protected updateTooltip(): void {
    const el = this.element.nativeElement;
    this.tooltip.disabled = el.scrollWidth <= el.clientWidth;
  }
}
