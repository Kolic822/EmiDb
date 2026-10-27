import { Injectable } from '@angular/core';
import { storedSignal } from '../core/storage';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  /** Sidebar collapsed to an icon rail. */
  readonly collapsed = storedSignal('sidebar.collapsed', false);

  toggleSidebar(): void {
    this.collapsed.update((value) => !value);
  }
}
