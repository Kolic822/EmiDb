import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC = 'isPublic';
/** Reachable without signing in (login, status, version). */
export const Public = () => SetMetadata(IS_PUBLIC, true);
