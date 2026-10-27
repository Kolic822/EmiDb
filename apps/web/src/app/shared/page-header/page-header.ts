import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n';

@Component({
  selector: 'app-page-header',
  imports: [MatIcon, MatIconButton, RouterLink, TranslatePipe],
  template: `
    <div class="header">
      @if (backLink(); as link) {
        <a mat-icon-button [routerLink]="link" class="back" [attr.aria-label]="'Back' | t">
          <mat-icon>arrow_back</mat-icon>
        </a>
      }
      <div class="titles">
        <h1>{{ title() }}</h1>
        @if (subtitle()) {
          <div class="subtitle">{{ subtitle() }}</div>
        }
      </div>
      <div class="actions"><ng-content /></div>
    </div>
    <ng-content select="[toolbar]" />
  `,
  styles: `
    :host {
      display: block;
      padding: 18px var(--app-page-padding) 12px;
    }

    .header {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 40px;
    }

    .back {
      margin-left: -10px;
    }

    .titles {
      min-width: 0;
      flex: 1;
    }

    h1 {
      margin: 0;
      font: var(--mat-sys-headline-small);
      font-weight: 600;
      letter-spacing: -0.01em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .subtitle {
      font: var(--mat-sys-body-medium);
      color: var(--mat-sys-on-surface-variant);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
  readonly backLink = input<string | any[]>();
}
