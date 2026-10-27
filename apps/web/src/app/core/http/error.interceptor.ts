import { HttpErrorResponse, type HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { t } from '@emidb/shared';
import { catchError, throwError } from 'rxjs';
import { NotifyService } from '../notify';

/** Surfaces API errors as a snackbar and rethrows a readable Error. */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotifyService);
  return next(req).pipe(
    catchError((error: unknown) => {
      const message = describe(error);
      notify.error(message);
      return throwError(() => new Error(message));
    }),
  );
};

function describe(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return t('Unexpected error');
  if (error.status === 0) return t('Cannot reach the server');
  const body = error.error as { message?: string | string[] } | undefined;
  const message = body?.message;
  if (Array.isArray(message)) return message.join('. ');
  return message ? t(message) : error.message;
}
