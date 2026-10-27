import type { Pickup } from './models.js';

/** Measurements that can be compared against a pickup, with how much a deviation counts. */
export const MATCH_MEASURES = [
  { key: 'resistance', label: 'Resistance', unit: 'kΩ', step: 0.01, weight: 1 },
  { key: 'inductance', label: 'Inductance', unit: 'H', step: 0.01, weight: 1 },
  { key: 'gauss', label: 'Gauss', unit: 'G', step: 1, weight: 0.5 },
  { key: 'outputMv', label: 'Output', unit: 'mV', step: 1, weight: 0.5 },
] as const;

export type MatchMeasureKey = (typeof MATCH_MEASURES)[number]['key'];
export type MatchTargets = Partial<Record<MatchMeasureKey, number | null>>;

export interface MatchResult {
  pickup: Pickup;
  /** 0–100, where 100 is an exact match on every compared measure. */
  score: number;
  /** Relative deviation per measure (signed, 0.05 = 5 % above the target); absent when the pickup has no value. */
  deviation: Partial<Record<MatchMeasureKey, number>>;
  /** How many of the entered measures the pickup could be compared on. */
  compared: number;
}

/** A 25 % average deviation counts as no resemblance at all. */
const MAX_DEVIATION = 0.25;

/**
 * Ranks pickups by how close their measurements are to the entered ones.
 * A pickup is scored on the measures it has a value for (at least one, and the
 * more it shares the better it ranks on ties); the score drops with the weighted
 * root-mean-square of the relative deviations.
 */
export function rankByMeasurements(pickups: readonly Pickup[], targets: MatchTargets): MatchResult[] {
  const wanted = MATCH_MEASURES.filter((m) => typeof targets[m.key] === 'number' && targets[m.key]! > 0);
  if (!wanted.length) return [];

  const results: MatchResult[] = [];
  for (const pickup of pickups) {
    const deviation: MatchResult['deviation'] = {};
    let weighted = 0;
    let weights = 0;
    for (const measure of wanted) {
      const value = pickup[measure.key];
      if (typeof value !== 'number') continue;
      const target = targets[measure.key]!;
      const diff = (value - target) / target;
      deviation[measure.key] = diff;
      weighted += measure.weight * diff * diff;
      weights += measure.weight;
    }
    const compared = Object.keys(deviation).length;
    if (!compared) continue;
    const rms = Math.sqrt(weighted / weights);
    const score = Math.round(Math.max(0, 1 - rms / MAX_DEVIATION) * 100);
    results.push({ pickup, score, deviation, compared });
  }
  return results.sort(
    (a, b) => b.score - a.score || b.compared - a.compared || a.pickup.name.localeCompare(b.pickup.name),
  );
}
