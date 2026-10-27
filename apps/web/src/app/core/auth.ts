import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE } from './http/crud-api';

interface AuthStatus {
  required: boolean;
  authenticated: boolean;
}

/** Whether the server wants a password, and whether this browser has signed in. */
@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);

  /** `checking` until the server has answered; `login` shows the password screen. */
  readonly state = signal<'checking' | 'login' | 'ready'>('checking');
  /** A password is configured on the server (so a sign-out button makes sense). */
  readonly required = signal(false);

  async init(): Promise<void> {
    try {
      const status = await firstValueFrom(this.http.get<AuthStatus>(`${API_BASE}/auth`));
      this.required.set(status.required);
      this.state.set(status.authenticated ? 'ready' : 'login');
    } catch {
      // Offline or the server is down: let the app show its own errors.
      this.state.set('ready');
    }
  }

  /** Resolves true on success, false on a wrong password; other failures are reported by the interceptor. */
  async login(password: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.post<AuthStatus>(`${API_BASE}/auth/login`, { password }));
      this.state.set('ready');
      return true;
    } catch {
      return false;
    }
  }

  async logout(): Promise<void> {
    await firstValueFrom(this.http.post<void>(`${API_BASE}/auth/logout`, {}));
    // A fresh start makes sure no data from the signed-in session stays in memory.
    window.location.assign('/');
  }

  /** The server answered 401: the session expired or the password changed. */
  expire(): void {
    if (this.state() === 'ready') this.state.set('login');
  }
}

export function isUnauthorized(error: unknown): boolean {
  return error instanceof HttpErrorResponse && error.status === 401;
}
