import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutService } from '../layout.service';

interface NavItem {
  label: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MatIcon, MatIconButton, MatTooltip],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  host: { '[class.collapsed]': 'layout.collapsed()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  protected readonly layout = inject(LayoutService);

  protected readonly sections: { title: string; items: NavItem[] }[] = [
    {
      title: 'Database',
      items: [
        { label: 'Pickups', icon: 'graphic_eq', link: '/pickups' },
        { label: 'Sets', icon: 'view_agenda', link: '/sets' },
        { label: 'Wiring diagrams', icon: 'schema', link: '/wiring-diagrams' },
      ],
    },
    {
      title: 'Reference',
      items: [
        { label: 'Manufacturers', icon: 'factory', link: '/manufacturers' },
        { label: 'Pots & switches', icon: 'tune', link: '/components' },
      ],
    },
  ];

  protected readonly settings: NavItem = { label: 'Settings', icon: 'settings', link: '/settings' };
}
