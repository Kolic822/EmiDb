import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { TranslatePipe } from '../../core/i18n';
import { PageHeader } from '../../shared/page-header/page-header';
import { PotentiometerTypeTable, SwitchTypeTable } from './component-type-table';

@Component({
  selector: 'app-component-type-list',
  imports: [PageHeader, MatTabGroup, MatTab, PotentiometerTypeTable, SwitchTypeTable, TranslatePipe],
  template: `
    <div class="page">
      <app-page-header [title]="'Pots & switches' | t" [subtitle]="'Component types used by wiring diagrams' | t" />
      <mat-tab-group class="page-body tabs" animationDuration="0ms">
        <mat-tab [label]="'Potentiometers' | t">
          <app-potentiometer-type-table />
        </mat-tab>
        <mat-tab [label]="'Switches' | t">
          <app-switch-type-table />
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: `
    .tabs {
      flex: 1;
      min-height: 0;
    }

    .tabs ::ng-deep .mat-mdc-tab-body-wrapper {
      flex: 1;
      min-height: 0;
    }

    .tabs ::ng-deep .mat-mdc-tab-body-content {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentTypeList {}
