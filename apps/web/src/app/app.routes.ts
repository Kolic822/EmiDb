import type { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'pickups' },
  {
    path: 'pickups',
    loadChildren: () => import('./features/pickups/pickups.routes').then((m) => m.PICKUP_ROUTES),
  },
  {
    path: 'sets',
    loadChildren: () => import('./features/pickup-sets/pickup-sets.routes').then((m) => m.PICKUP_SET_ROUTES),
  },
  {
    path: 'wiring-diagrams',
    loadChildren: () =>
      import('./features/wiring-diagrams/wiring-diagrams.routes').then((m) => m.WIRING_DIAGRAM_ROUTES),
  },
  {
    path: 'manufacturers',
    loadComponent: () => import('./features/manufacturers/manufacturer-list').then((m) => m.ManufacturerList),
    title: 'Manufacturers · emidb',
  },
  {
    path: 'components',
    loadComponent: () => import('./features/component-types/component-type-list').then((m) => m.ComponentTypeList),
    title: 'Pots & switches · emidb',
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings').then((m) => m.Settings),
    title: 'Settings · emidb',
  },
  { path: '**', redirectTo: 'pickups' },
];
