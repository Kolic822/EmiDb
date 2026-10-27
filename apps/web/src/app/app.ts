import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth } from './core/auth';
import { Login } from './features/login/login';
import { Sidebar } from './layout/sidebar/sidebar';
import { LayoutService } from './layout/layout.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Login],
  template: `
    @switch (auth.state()) {
      @case ('ready') {
        <app-sidebar />
        <main class="content">
          <router-outlet />
        </main>
      }
      @case ('login') {
        <app-login class="login" />
      }
    }
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: auto 1fr;
      height: 100%;
    }

    .login {
      grid-column: 1 / -1;
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
  protected readonly auth = inject(Auth);

  constructor() {
    void this.auth.init();
  }
}
