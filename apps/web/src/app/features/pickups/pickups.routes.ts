import type { Routes } from '@angular/router';
import { pageTitle } from '../../core/i18n';

export const PICKUP_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pickup-list').then((m) => m.PickupList), title: pageTitle('Pickups') },
  { path: 'new', loadComponent: () => import('./pickup-form').then((m) => m.PickupForm), title: pageTitle('New pickup') },
  { path: 'filter', loadComponent: () => import('./pickup-filter').then((m) => m.PickupFilter), title: pageTitle('Filter pickups') },
  { path: 'compare', loadComponent: () => import('./pickup-compare').then((m) => m.PickupCompare), title: pageTitle('Compare pickups') },
  { path: ':id', loadComponent: () => import('./pickup-detail').then((m) => m.PickupDetail), title: pageTitle('Pickup') },
  { path: ':id/edit', loadComponent: () => import('./pickup-form').then((m) => m.PickupForm), title: pageTitle('Edit pickup') },
];
