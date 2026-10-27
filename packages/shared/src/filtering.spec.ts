import { describe, expect, it } from 'vitest';
import { PICKUP_FIELDS } from './fields.js';
import {
  applyCriteria,
  compareByField,
  describeCriterion,
  displayValue,
  matchesCriterion,
  matchesQuery,
} from './filtering.js';
import type { Pickup } from './models.js';

const field = (key: keyof Pickup) => PICKUP_FIELDS.find((f) => f.key === key)!;

const pickup = (overrides: Partial<Pickup>): Pickup =>
  ({ id: 1, name: 'Test', manufacturerId: null, type: null, resistance: null, ...overrides }) as Pickup;

describe('matchesCriterion', () => {
  it('matches text case-insensitively as "contains"', () => {
    expect(matchesCriterion('Seymour Duncan', { kind: 'text', value: 'dunc' })).toBe(true);
    expect(matchesCriterion('Seymour Duncan', { kind: 'text', value: 'gibson' })).toBe(false);
    expect(matchesCriterion(null, { kind: 'text', value: 'x' })).toBe(false);
  });

  it('matches numbers within a tolerance', () => {
    expect(matchesCriterion(8.2, { kind: 'near', value: 8, tolerance: 0.5 })).toBe(true);
    expect(matchesCriterion(8.6, { kind: 'near', value: 8, tolerance: 0.5 })).toBe(false);
    expect(matchesCriterion(8, { kind: 'near', value: 8 })).toBe(true);
    expect(matchesCriterion(8.01, { kind: 'near', value: 8 })).toBe(false);
    expect(matchesCriterion(null, { kind: 'near', value: 8, tolerance: 100 })).toBe(false);
  });

  it('matches "any of" for scalars and arrays', () => {
    expect(matchesCriterion('HUMBUCKER', { kind: 'in', values: ['HUMBUCKER', 'SINGLE'] })).toBe(true);
    expect(matchesCriterion('PIEZO', { kind: 'in', values: ['HUMBUCKER'] })).toBe(false);
    expect(matchesCriterion([1, 2], { kind: 'in', values: [2] })).toBe(true);
    expect(matchesCriterion([1, 2], { kind: 'in', values: [3] })).toBe(false);
  });

  it('matches ranges and booleans', () => {
    expect(matchesCriterion(7, { kind: 'range', min: 7, max: 9 })).toBe(true);
    expect(matchesCriterion(9.5, { kind: 'range', max: 9 })).toBe(false);
    expect(matchesCriterion(true, { kind: 'boolean', value: true })).toBe(true);
    expect(matchesCriterion(null, { kind: 'boolean', value: false })).toBe(false);
  });
});

describe('applyCriteria', () => {
  const rows = [
    pickup({ id: 1, name: 'JB', type: 'HUMBUCKER', resistance: 16.4 }),
    pickup({ id: 2, name: 'Jazz', type: 'HUMBUCKER', resistance: 7.7 }),
    pickup({ id: 3, name: 'SSL-1', type: 'SINGLE', resistance: 6.5 }),
  ];

  it('combines criteria with AND and ignores empty ones', () => {
    const result = applyCriteria(rows, {
      type: { kind: 'in', values: ['HUMBUCKER'] },
      resistance: { kind: 'near', value: 8, tolerance: 1 },
      name: { kind: 'text', value: '   ' },
    });
    expect(result.map((r) => r.id)).toEqual([2]);
  });
});

describe('displayValue', () => {
  it('formats enums, booleans, numbers and lookups', () => {
    expect(displayValue(field('type'), 'STACK_SINGLE')).toBe('Stacked single coil');
    expect(displayValue(field('potted'), false)).toBe('No');
    expect(displayValue(field('resistance'), 8.123456, undefined, { withUnit: true })).toBe('8.1235 kΩ');
    expect(displayValue(field('manufacturerId'), 3, () => 'Gibson')).toBe('Gibson');
    expect(displayValue(field('manufacturerId'), 3)).toBe('#3');
    expect(displayValue(field('name'), null)).toBe('');
  });
});

describe('matchesQuery', () => {
  it('searches the displayed value of every field', () => {
    const row = pickup({ type: 'HUMBUCKER', manufacturerId: 1 });
    const resolve = () => 'Seymour Duncan';
    expect(matchesQuery(row, PICKUP_FIELDS, 'humbuck', resolve)).toBe(true);
    expect(matchesQuery(row, PICKUP_FIELDS, 'seymour', resolve)).toBe(true);
    expect(matchesQuery(row, PICKUP_FIELDS, 'fender', resolve)).toBe(false);
  });
});

describe('compareByField', () => {
  it('sorts numerically with nulls last in both directions', () => {
    const rows = [pickup({ resistance: null }), pickup({ resistance: 9 }), pickup({ resistance: 7 })];
    const asc = rows.slice().sort(compareByField(field('resistance'), 'asc'));
    const desc = rows.slice().sort(compareByField(field('resistance'), 'desc'));
    expect(asc.map((r) => r.resistance)).toEqual([7, 9, null]);
    expect(desc.map((r) => r.resistance)).toEqual([9, 7, null]);
  });
});

describe('describeCriterion', () => {
  it('produces chip labels', () => {
    expect(describeCriterion(field('resistance'), { kind: 'near', value: 8, tolerance: 0.5 })).toBe(
      'Resistance ≈ 8 ± 0.5 kΩ',
    );
    expect(describeCriterion(field('type'), { kind: 'in', values: ['HUMBUCKER'] })).toBe('Type: Humbucker');
    expect(describeCriterion(field('potted'), { kind: 'boolean', value: true })).toBe('Potted: Yes');
  });
});
