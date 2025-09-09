import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { renderCabinEmailHTML } from '../cabinEmail';
import type { CabinConfig } from '../../lib/cabin';

function sampleConfig(): CabinConfig {
  return {
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
    openings: {
      windows: [{ count: 1, width: 1200, height: 900, wall: 'right' }],
      doors: [{ count: 1, width: 860, height: 1980 }],
    },
    exteriorCladding: 'corrugate' as any,
    lining: 'none',
    insulated: false,
    electrical: false,
    sheetSizeM: { w: 1.2, h: 2.4 },
  };
}

describe('renderCabinEmailHTML', () => {
  it('renders branding, title, disclaimer, and table', () => {
    const cfg = sampleConfig();
    const html = renderCabinEmailHTML(
      cfg,
      {
        items: [
          { category: 'Framing', name: 'Timber', unit: 'm', qty: 10, rate: 4.5, subtotal: 45 },
        ],
        totals: { exGst: 1000, gst: 150, inclGst: 1150 },
        warnings: [],
      },
      {
        title: 'Cabin Estimate',
        logoDataUri: 'data:image/png;base64,AAA',
        businessName: 'Roots & Echo Ltd',
        phone: '021 180 1218',
        email: 'zeke@rootsandecho.co.nz',
      }
    );

    expect(html).toContain('Cabin Estimate');
    expect(html).toContain('Roots & Echo Ltd');
    expect(html).toContain('021 180 1218');
    expect(html).toContain('zeke@rootsandecho.co.nz');
    expect(html).toContain('data:image/png;base64');
    expect(html).toContain('This is an estimate only. Please confirm exact pricing before placing your order.');
    expect(html).not.toMatch(/NZS 3604/i);
  });
});

