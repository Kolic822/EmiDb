import { ChangeDetectionStrategy, Component, inject, Injectable } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { t } from '@emidb/shared';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '../../core/i18n';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  danger?: boolean;
}

@Component({
  selector: 'app-confirm-dialog',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    @if (data.message) {
      <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    }
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{ 'Cancel' | t }}</button>
      <button mat-flat-button [mat-dialog-close]="true" [class.danger]="data.danger" cdkFocusInitial>
        {{ (data.confirmLabel ?? 'Confirm') | t }}
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    h2[mat-dialog-title] {
      font: var(--mat-sys-title-large);
      font-weight: 600;
      overflow-wrap: anywhere;
    }

    mat-dialog-content {
      overflow-wrap: anywhere;
    }

    .danger {
      --mat-button-filled-container-color: var(--mat-sys-error);
      --mat-button-filled-label-text-color: var(--mat-sys-on-error);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialog {
  protected readonly data = inject<ConfirmOptions>(MAT_DIALOG_DATA);
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly dialog = inject(MatDialog);

  async confirm(options: ConfirmOptions): Promise<boolean> {
    const ref = this.dialog.open<ConfirmDialog, ConfirmOptions, boolean>(ConfirmDialog, {
      data: options,
      width: '420px',
    });
    return (await firstValueFrom(ref.afterClosed())) === true;
  }

  /** Standard "delete N things" prompt. */
  confirmDelete(count: number, noun: string): Promise<boolean> {
    return this.confirm({
      title: count === 1 ? t('Delete this {noun}?', { noun: t(noun) }) : t('Delete {count} {noun}s?', { count, noun: t(noun) }),
      message: t('It moves to the Trash, where you can restore it for 30 days.'),
      confirmLabel: t('Delete'),
      danger: true,
    });
  }
}
