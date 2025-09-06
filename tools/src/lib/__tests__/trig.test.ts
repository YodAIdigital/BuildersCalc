import { describe, it, expect } from 'vitest';
import { solveRightTriangle } from '../../lib/trig';

describe('trig', () => {
  it('solves with two sides', () => {
    const r = solveRightTriangle({ a: 300, b: 400 })!;
    expect(Math.round(r.c)).toBe(500);
    expect(Math.round(r.A)).toBe(37);
    expect(Math.round(r.B)).toBe(53);
  });
});
