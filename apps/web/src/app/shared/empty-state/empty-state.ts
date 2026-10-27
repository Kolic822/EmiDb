import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe } from '../../core/i18n';

@Component({
  selector: 'app-empty-state',
  imports: [MatIcon, TranslatePipe],
  template: `
    <mat-icon>{{ icon() }}</mat-icon>
    <div class="title">{{ title() | t }}</div>
    @if (message()) {
      <div class="message">{{ message()! | t }}</div>
    }
    <div class="actions"><ng-content /></div>
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48px 24px;
      color: var(--mat-sys-on-surface-variant);
      gap: 6px;
    }

    mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      opacity: 0.6;
      margin-bottom: 6px;
    }

    .title {
      font: var(--mat-sys-title-medium);
      color: var(--mat-sys-on-surface);
    }

    .actions:not(:empty) {
      margin-top: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  readonly icon = input('inbox');
  readonly title = input.required<string>();
  readonly message = input<string>();
}
