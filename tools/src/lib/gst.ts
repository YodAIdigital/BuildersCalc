export type GSTSource = 'excl' | 'incl' | 'gst';

export type GSTInput = {
  source: GSTSource;
  rate: number; // decimal fraction (e.g., 0.15 for 15%)
  excl?: number;
  incl?: number;
  gst?: number;
};

export type GSTResult = {
  excl: number;
  incl: number;
  gst: number;
};

function clampNonNeg(n: number): number {
  if (!isFinite(n) || isNaN(n)) return 0;
  return Math.max(0, n);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Solve GST relationships given one known input and a rate.
 * Formulas (r = rate):
 * - From excl: gst = excl * r; incl = excl * (1 + r)
 * - From incl: excl = incl / (1 + r); gst = incl - excl
 * - From gst: excl = gst / r; incl = excl + gst
 */
export function solveGST(params: GSTInput): GSTResult {
  const r = clampNonNeg(params.rate || 0);
  let excl = clampNonNeg(params.excl ?? 0);
  let incl = clampNonNeg(params.incl ?? 0);
  let gst = clampNonNeg(params.gst ?? 0);

  if (params.source === 'excl') {
    // excl is authoritative
    gst = excl * r;
    incl = excl + gst;
  } else if (params.source === 'incl') {
    const denom = 1 + r;
    if (denom === 0) {
      // r = -1 (not possible after clamp), safe-guard
      excl = 0; gst = 0; incl = 0;
    } else {
      excl = incl / denom;
      gst = incl - excl;
    }
  } else { // source === 'gst'
    if (r === 0) {
      // Cannot derive excl from gst when rate is 0
      excl = 0; incl = gst; // best-effort: treat gst as part of total if r=0
      gst = 0;
    } else {
      excl = gst / r;
      incl = excl + gst;
    }
  }

  return {
    excl: round2(excl),
    incl: round2(incl),
    gst: round2(gst)
  };
}

export function formatCurrencyNZD(n: number): string {
  try {
    return n.toLocaleString('en-NZ', { style: 'currency', currency: 'NZD' });
  } catch {
    // Fallback
    return `$${round2(n).toFixed(2)}`;
  }
}
