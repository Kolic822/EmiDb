import type { Routes } from '@angular/router';
import { pageTitle } from '../../core/i18n';

export const PICKUP_SET_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pickup-set-list').then((m) => m.PickupSetList), title: pageTitle('Sets') },
  { path: 'new', loadComponent: () => import('./pickup-set-form').then((m) => m.PickupSetForm), title: pageTitle('New set') },
  { path: ':id', loadComponent: () => import('./pickup-set-detail').then((m) => m.PickupSetDetail), title: pageTitle('Set') },
  { path: ':id/edit', loadComponent: () => import('./pickup-set-form').then((m) => m.PickupSetForm), title: pageTitle('Edit set') },
];
