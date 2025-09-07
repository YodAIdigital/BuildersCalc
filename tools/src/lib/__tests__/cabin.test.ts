import { describe, it, expect } from 'vitest';
import { computeCabin } from '../cabin';
import { defaultSettings } from '../../storage/settings';

describe('cabin calc', () => {
  it('computes a basic dual-pitch 4x2x2.4 cabin', () => {
    const r = computeCabin(
      {
        length: 4000,
        width: 2000,
        height: 2400,
        roofType: 'dual',
        pitchDeg: 20,
        overhang: 300,
        includeOverhangInArea: true,
        rafterSpacing: 600,
        studSpacing: 600,
        nogSpacing: 800,
        joistSpacing: 600,
        bearerSpacing: 1800,
        pileSpacing: 1500,
        openings: { windows: [], doors: [] },
        exteriorCladding: 'corrugate',
        lining: 'none',
        insulated: false,
        sheetSizeM: { w: 1.2, h: 2.4 },
      },
      defaultSettings
    );

    // Sanity checks
    expect(r.items.length).toBeGreaterThan(0);
    expect(r.totals.inclGst).toBeGreaterThan(0);
    expect(r.warnings.length).toBeLessThan(5);
  });
});
