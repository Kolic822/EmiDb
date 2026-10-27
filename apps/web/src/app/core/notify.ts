import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { t } from '@emidb/shared';

@Injectable({ providedIn: 'root' })
export class NotifyService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.snackBar.open(message, undefined, { duration: 2500 });
  }

  /** A confirmation with an Undo button that stays for a few seconds. */
  undoable(message: string, undo: () => Promise<unknown>): void {
    this.snackBar
      .open(message, t('Undo'), { duration: 8000 })
      .onAction()
      .subscribe(() => {
        // Failures are reported by the HTTP interceptor.
        void undo().then(() => this.success(t('Restored')), () => undefined);
      });
  }

  error(message: string): void {
    this.snackBar.open(message, t('Dismiss'), { duration: 6000 });
  }
}
