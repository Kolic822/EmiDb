import { Injectable } from '@nestjs/common';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { config } from '../config.js';

export const SESSION_COOKIE = 'emidb_session';
const SESSION_DAYS = 90;
const MAX_FAILURES = 5;
const FAILURE_WINDOW_MS = 60_000;

/**
 * One shared password for the whole app (set with APP_PASSWORD). A correct password gets a
 * signed, expiring cookie; changing the password or SESSION_SECRET signs everyone out.
 */
@Injectable()
export class AuthService {
  private readonly failures = new Map<string, { count: number; resetAt: number }>();

  get required(): boolean {
    return config.appPassword.length > 0;
  }

  get sessionSeconds(): number {
    return SESSION_DAYS * 86_400;
  }

  checkPassword(candidate: string): boolean {
    return timingSafeEqual(digest(candidate), digest(config.appPassword));
  }

  /** True when this client has failed too often recently and must wait. */
  isLockedOut(client: string): boolean {
    const entry = this.failures.get(client);
    if (!entry || entry.resetAt < Date.now()) return false;
    return entry.count >= MAX_FAILURES;
  }

  recordFailure(client: string): void {
    const now = Date.now();
    const entry = this.failures.get(client);
    if (!entry || entry.resetAt < now) this.failures.set(client, { count: 1, resetAt: now + FAILURE_WINDOW_MS });
    else entry.count += 1;
  }

  clearFailures(client: string): void {
    this.failures.delete(client);
  }

  issueToken(): string {
    const expires = String(Date.now() + this.sessionSeconds * 1000);
    return `${expires}.${this.sign(expires)}`;
  }

  verifyToken(token: string | undefined): boolean {
    if (!token) return false;
    const [expires, signature] = token.split('.');
    if (!expires || !signature || Number(expires) < Date.now()) return false;
    const expected = Buffer.from(this.sign(expires));
    const actual = Buffer.from(signature);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  private sign(value: string): string {
    return createHmac('sha256', config.sessionSecret).update(value).digest('hex');
  }
}

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

/** Reads one cookie from a raw Cookie header. */
export function readCookie(header: string | undefined, name: string): string | undefined {
  for (const part of header?.split(';') ?? []) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return undefined;
}
