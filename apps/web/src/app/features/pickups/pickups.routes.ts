import type { Routes } from '@angular/router';

export const PICKUP_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pickup-list').then((m) => m.PickupList), title: 'Pickups · emidb' },
  { path: 'new', loadComponent: () => import('./pickup-form').then((m) => m.PickupForm), title: 'New pickup · emidb' },
  { path: 'filter', loadComponent: () => import('./pickup-filter').then((m) => m.PickupFilter), title: 'Filter pickups · emidb' },
  { path: 'compare', loadComponent: () => import('./pickup-compare').then((m) => m.PickupCompare), title: 'Compare pickups · emidb' },
  { path: ':id', loadComponent: () => import('./pickup-detail').then((m) => m.PickupDetail), title: 'Pickup · emidb' },
  { path: ':id/edit', loadComponent: () => import('./pickup-form').then((m) => m.PickupForm), title: 'Edit pickup · emidb' },
];
