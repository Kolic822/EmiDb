import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { PageHeader } from '../../shared/page-header/page-header';
import { PotentiometerTypeTable, SwitchTypeTable } from './component-type-table';

@Component({
  selector: 'app-component-type-list',
  imports: [PageHeader, MatTabGroup, MatTab, PotentiometerTypeTable, SwitchTypeTable],
  template: `
    <div class="page">
      <app-page-header title="Pots & switches" subtitle="Component types used by wiring diagrams" />
      <mat-tab-group class="page-body tabs" animationDuration="0ms">
        <mat-tab label="Potentiometers">
          <app-potentiometer-type-table />
        </mat-tab>
        <mat-tab label="Switches">
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
