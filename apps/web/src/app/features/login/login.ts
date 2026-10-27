import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Auth } from '../../core/auth';
import { TranslatePipe } from '../../core/i18n';

@Component({
  selector: 'app-login',
  imports: [FormsModule, MatButton, MatFormField, MatLabel, MatIcon, MatInput, TranslatePipe],
  template: `
    <form class="card" (ngSubmit)="submit()">
      <div class="brand"><mat-icon>graphic_eq</mat-icon> emidb</div>
      <p class="muted">{{ 'Enter the password to open the database.' | t }}</p>
      <mat-form-field>
        <mat-label>{{ 'Password' | t }}</mat-label>
        <input matInput type="password" name="password" autocomplete="current-password" autofocus required [(ngModel)]="password" />
      </mat-form-field>
      <button mat-flat-button type="submit" [disabled]="busy() || !password">{{ 'Sign in' | t }}</button>
    </form>
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      height: 100%;
      padding: 16px;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: min(380px, 100%);
      padding: 28px 28px 24px;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 8px;
      font: var(--mat-sys-headline-small);
      font-weight: 600;
    }

    p {
      margin: 0 0 4px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private readonly auth = inject(Auth);
  protected password = '';
  protected readonly busy = signal(false);

  protected async submit(): Promise<void> {
    if (!this.password) return;
    this.busy.set(true);
    const ok = await this.auth.login(this.password);
    this.busy.set(false);
    if (!ok) this.password = '';
  }
}
