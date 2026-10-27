import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './layout/sidebar/sidebar';
import { LayoutService } from './layout/layout.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar],
  template: `
    <app-sidebar />
    <main class="content">
      <router-outlet />
    </main>
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: auto 1fr;
      height: 100%;
    }

    .content {
      min-width: 0;
      min-height: 0;
      height: 100%;
      overflow: hidden;
    }
  `,
  host: { '[class.rail]': 'layout.collapsed()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly layout = inject(LayoutService);
}
