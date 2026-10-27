import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatAnchor, MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatSuffix } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import {
  MATCH_MEASURES,
  type MatchMeasureKey,
  type MatchResult,
  type MatchTargets,
  rankByMeasurements,
  t,
} from '@emidb/shared';
import { TranslatePipe } from '../../core/i18n';
import { LookupService } from '../../core/lookups';
import { PickupsStore } from '../../core/store/stores';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { PageHeader } from '../../shared/page-header/page-header';

const MAX_RESULTS = 25;

/**
 * "What is this pickup?": enter what you measured on the bench and get the
 * pickups in the database ranked by how close they are.
 */
@Component({
  selector: 'app-pickup-match',
  imports: [
    PageHeader,
    EmptyState,
    DecimalPipe,
    MatAnchor,
    MatButton,
    MatFormField,
    MatLabel,
    MatSuffix,
    MatIcon,
    MatInput,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './pickup-match.html',
  styleUrl: './pickup-match.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PickupMatch {
  protected readonly store = inject(PickupsStore);
  private readonly router = inject(Router);
  private readonly lookups = inject(LookupService);

  protected readonly measures = MATCH_MEASURES;
  protected readonly targets = signal<MatchTargets>({});

  protected readonly entered = computed(() => MATCH_MEASURES.filter((m) => (this.targets()[m.key] ?? 0) > 0));
  protected readonly results = computed(() =>
    rankByMeasurements(this.store.rows(), this.targets()).slice(0, MAX_RESULTS),
  );
  protected readonly subtitle = computed(() =>
    this.entered().length
      ? t('{count} closest of {total} pickups', { count: this.results().length, total: this.store.rows().length })
      : t('Enter what you measured to rank the pickups by how close they are.'),
  );

  constructor() {
    void this.store.ensureLoaded();
    void this.lookups.ensureLoaded();
  }

  protected set(key: MatchMeasureKey, raw: string): void {
    // Accept a decimal comma as well as a point.
    const value = Number.parseFloat(raw.replace(',', '.'));
    this.targets.update((current) => ({ ...current, [key]: Number.isFinite(value) ? value : null }));
  }

  protected clear(): void {
    this.targets.set({});
  }

  protected deviation(result: MatchResult, key: MatchMeasureKey): number | undefined {
    return result.deviation[key];
  }

  protected value(result: MatchResult, key: MatchMeasureKey): number | null {
    return result.pickup[key];
  }

  protected tier(score: number): 'good' | 'fair' | 'poor' {
    return score >= 85 ? 'good' : score >= 60 ? 'fair' : 'poor';
  }

  protected open(result: MatchResult): void {
    void this.router.navigate(['/pickups', result.pickup.id]);
  }

  protected compareTop(): void {
    const ids = this.results()
      .slice(0, 4)
      .map((r) => r.pickup.id);
    void this.router.navigate(['/pickups/compare'], { queryParams: { ids: ids.join(',') } });
  }
}
