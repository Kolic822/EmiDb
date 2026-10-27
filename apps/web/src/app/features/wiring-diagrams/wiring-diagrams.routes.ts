import type { Routes } from '@angular/router';

export const WIRING_DIAGRAM_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./wiring-diagram-list').then((m) => m.WiringDiagramList), title: 'Wiring diagrams · emidb' },
  { path: 'new', loadComponent: () => import('./wiring-diagram-form').then((m) => m.WiringDiagramForm), title: 'New wiring diagram · emidb' },
  { path: 'filter', loadComponent: () => import('./wiring-diagram-filter').then((m) => m.WiringDiagramFilter), title: 'Filter wiring diagrams · emidb' },
  { path: ':id', loadComponent: () => import('./wiring-diagram-detail').then((m) => m.WiringDiagramDetail), title: 'Wiring diagram · emidb' },
  { path: ':id/edit', loadComponent: () => import('./wiring-diagram-form').then((m) => m.WiringDiagramForm), title: 'Edit wiring diagram · emidb' },
];
