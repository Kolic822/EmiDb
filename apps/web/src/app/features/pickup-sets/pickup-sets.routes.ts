import type { Routes } from '@angular/router';

export const PICKUP_SET_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pickup-set-list').then((m) => m.PickupSetList), title: 'Sets · emidb' },
  { path: 'new', loadComponent: () => import('./pickup-set-form').then((m) => m.PickupSetForm), title: 'New set · emidb' },
  { path: ':id', loadComponent: () => import('./pickup-set-detail').then((m) => m.PickupSetDetail), title: 'Set · emidb' },
  { path: ':id/edit', loadComponent: () => import('./pickup-set-form').then((m) => m.PickupSetForm), title: 'Edit set · emidb' },
];
