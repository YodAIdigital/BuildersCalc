import { describe, it, expect } from 'vitest';
import { solveGST } from '../gst';

describe('gst', () => {
  it('derives from excl (15%)', () => {
    const r = solveGST({ source: 'excl', rate: 0.15, excl: 100 });
    expect(r.gst).toBe(15);
    expect(r.incl).toBe(115);
  });

  it('derives from incl (15%)', () => {
    const r = solveGST({ source: 'incl', rate: 0.15, incl: 115 });
    expect(r.excl).toBe(100);
    expect(r.gst).toBe(15);
  });

  it('derives from gst (15%)', () => {
    const r = solveGST({ source: 'gst', rate: 0.15, gst: 15 });
    expect(r.excl).toBe(100);
    expect(r.incl).toBe(115);
  });

  it('clamps negatives to zero', () => {
    const r = solveGST({ source: 'excl', rate: 0.15, excl: -100 });
    expect(r.excl).toBe(0);
    expect(r.gst).toBe(0);
    expect(r.incl).toBe(0);
  });

  it('handles rate 0 gracefully', () => {
    const fromExcl = solveGST({ source: 'excl', rate: 0, excl: 100 });
    expect(fromExcl.excl).toBe(100);
    expect(fromExcl.gst).toBe(0);
    expect(fromExcl.incl).toBe(100);

    const fromIncl = solveGST({ source: 'incl', rate: 0, incl: 100 });
    expect(fromIncl.excl).toBe(100);
    expect(fromIncl.gst).toBe(0);
    expect(fromIncl.incl).toBe(100);

    const fromGst = solveGST({ source: 'gst', rate: 0, gst: 10 });
    // With rate 0, we cannot derive excl from gst; implementation returns zeros for gst and uses gst as total
    expect(fromGst.excl).toBe(0);
    expect(fromGst.gst).toBe(0);
    expect(fromGst.incl).toBe(10);
  });
});
