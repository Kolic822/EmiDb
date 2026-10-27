import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PICKUP_FIELDS, PICKUP_GROUPS, type Pickup, type PickupInput } from '@emidb/shared';
import { PickupsStore } from '../../core/store/stores';
import type { EntityFormGroup } from '../../shared/entity-form/form-builder';
import { ENTITY_FORM_IMPORTS } from '../../shared/entity-page/entity-form-imports';
import { EntityFormBase } from '../../shared/entity-page/entity-form-base';

const GAUSS_PER_TESLA = 10_000;

@Component({
  selector: 'app-pickup-form',
  imports: ENTITY_FORM_IMPORTS,
  templateUrl: '../../shared/entity-page/entity-form-page.html',
  styleUrl: '../../shared/entity-page/entity-form-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickupForm extends EntityFormBase<Pickup, PickupInput> {
  protected readonly store = inject(PickupsStore);
  protected readonly fields = PICKUP_FIELDS;
  protected readonly groups = PICKUP_GROUPS;
  protected readonly noun = 'pickup';
  protected override readonly attachmentOwner = 'pickup' as const;
  protected readonly basePath = '/pickups';
  private readonly destroyRef = inject(DestroyRef);

  /** Gauss and tesla describe the same field strength, so keep them in sync. */
  protected override onFormCreated(form: EntityFormGroup): void {
    const gauss = form.controls['gauss'];
    const tesla = form.controls['tesla'];
    gauss.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      const n = Number(value);
      tesla.setValue(value == null || value === '' || Number.isNaN(n) ? null : round(n / GAUSS_PER_TESLA, 4), {
        emitEvent: false,
      });
    });
    tesla.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      const n = Number(value);
      gauss.setValue(value == null || value === '' || Number.isNaN(n) ? null : round(n * GAUSS_PER_TESLA, 1), {
        emitEvent: false,
      });
    });
  }
}

function round(value: number, decimals: number): number {
  return Number(value.toFixed(decimals));
}
