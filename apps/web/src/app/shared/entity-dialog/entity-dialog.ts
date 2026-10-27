import { ChangeDetectionStrategy, Component, inject, Injectable, signal } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import type { FieldDef, FieldGroup } from '@emidb/shared';
import { firstValueFrom } from 'rxjs';
import { TranslatePipe } from '../../core/i18n';
import { EntityForm } from '../entity-form/entity-form';
import { buildEntityForm, formToInput } from '../entity-form/form-builder';

export interface EntityDialogData<T, TInput> {
  title: string;
  fields: readonly FieldDef<T>[];
  groups: readonly FieldGroup[];
  value?: Partial<T>;
  submitLabel?: string;
  /** Persists the input; the dialog stays open (with the user's values) when this rejects. */
  save: (input: TInput) => Promise<unknown>;
}

/** Small create/edit dialog for simple entities (manufacturers, pot and switch types). */
@Component({
  selector: 'app-entity-dialog',
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, MatButton, EntityForm, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>
      <form (ngSubmit)="submit()">
        <app-entity-form [fields]="data.fields" [groups]="data.groups" [form]="form" />
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>{{ 'Cancel' | t }}</button>
      <button mat-flat-button (click)="submit()" [disabled]="saving()">{{ (data.submitLabel ?? 'Save') | t }}</button>
    </mat-dialog-actions>
  `,
  styles: `
    mat-dialog-content {
      padding-top: 8px;
    }

    app-entity-form ::ng-deep section {
      border: 0;
      padding: 0;
      background: transparent;
    }

    app-entity-form ::ng-deep h2 {
      display: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityDialog<T extends object, TInput> {
  protected readonly data = inject<EntityDialogData<T, TInput>>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<EntityDialog<T, TInput>, boolean>>(MatDialogRef);
  protected readonly form = buildEntityForm(this.data.fields, this.data.value);
  protected readonly saving = signal(false);

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    try {
      await this.data.save(formToInput<TInput>(this.data.fields, this.form));
      this.ref.close(true);
    } catch {
      // Reported by the HTTP interceptor; keep the dialog open so nothing is lost.
    } finally {
      this.saving.set(false);
    }
  }
}

@Injectable({ providedIn: 'root' })
export class EntityDialogService {
  private readonly dialog = inject(MatDialog);

  /** Resolves with true once saved, false when cancelled. */
  async open<T extends object, TInput>(data: EntityDialogData<T, TInput>): Promise<boolean> {
    const ref = this.dialog.open<EntityDialog<T, TInput>, EntityDialogData<T, TInput>, boolean>(EntityDialog, {
      data,
      width: '520px',
      autoFocus: 'first-tabbable',
    });
    return (await firstValueFrom(ref.afterClosed())) === true;
  }
}
