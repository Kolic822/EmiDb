import type { Routes } from '@angular/router';
import { pageTitle } from '../../core/i18n';

export const WIRING_DIAGRAM_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./wiring-diagram-list').then((m) => m.WiringDiagramList), title: pageTitle('Wiring diagrams') },
  { path: 'new', loadComponent: () => import('./wiring-diagram-form').then((m) => m.WiringDiagramForm), title: pageTitle('New wiring diagram') },
  { path: 'filter', loadComponent: () => import('./wiring-diagram-filter').then((m) => m.WiringDiagramFilter), title: pageTitle('Filter wiring diagrams') },
  { path: ':id', loadComponent: () => import('./wiring-diagram-detail').then((m) => m.WiringDiagramDetail), title: pageTitle('Wiring diagram') },
  { path: ':id/edit', loadComponent: () => import('./wiring-diagram-form').then((m) => m.WiringDiagramForm), title: pageTitle('Edit wiring diagram') },
];
