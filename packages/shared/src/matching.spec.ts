import { describe, expect, it } from 'vitest';
import { rankByMeasurements } from './matching.js';
import type { Pickup } from './models.js';

const pickup = (id: number, overrides: Partial<Pickup>): Pickup =>
  ({ id, name: `P${id}`, resistance: null, inductance: null, gauss: null, outputMv: null, ...overrides }) as Pickup;

describe('rankByMeasurements', () => {
  const pickups = [
    pickup(1, { resistance: 8.0, inductance: 4.0 }),
    pickup(2, { resistance: 16.0, inductance: 8.0 }),
    pickup(3, { resistance: 7.6 }),
    pickup(4, {}),
  ];

  it('puts the exact match first with a full score', () => {
    const [best, ...rest] = rankByMeasurements(pickups, { resistance: 8.0, inductance: 4.0 });
    expect(best.pickup.id).toBe(1);
    expect(best.score).toBe(100);
    expect(rest[0].pickup.id).toBe(3);
  });

  it('skips pickups with nothing to compare and scores far-off ones as 0', () => {
    const ranked = rankByMeasurements(pickups, { resistance: 8.0 });
    expect(ranked.map((r) => r.pickup.id)).toEqual([1, 3, 2]);
    expect(ranked.at(-1)!.score).toBe(0);
  });

  it('reports signed deviations and prefers more compared measures on ties', () => {
    const ranked = rankByMeasurements(
      [pickup(1, { resistance: 8.8 }), pickup(2, { resistance: 7.2, inductance: 4 })],
      { resistance: 8, inductance: 4 },
    );
    expect(ranked.find((r) => r.pickup.id === 1)!.deviation.resistance).toBeCloseTo(0.1);
    expect(ranked.find((r) => r.pickup.id === 2)!.deviation.resistance).toBeCloseTo(-0.1);
    expect(ranked.find((r) => r.pickup.id === 2)!.compared).toBe(2);
  });

  it('returns nothing without a usable target', () => {
    expect(rankByMeasurements(pickups, {})).toEqual([]);
    expect(rankByMeasurements(pickups, { resistance: 0 })).toEqual([]);
  });
});
