// Utility functions and data for build-related conversions

export const SQFT_PER_SQM = 10.7639104167;
export const YD3_PER_M3 = 1.30795062;
export const IN_PER_MM = 1 / 25.4;
export const MM_PER_IN = 25.4;

// Slope/Fall conversions
export function degToPercent(deg: number) {
  return Math.tan((deg || 0) * Math.PI / 180) * 100;
}
export function percentToDeg(percent: number) {
  return Math.atan((percent || 0) / 100) * 180 / Math.PI;
}
export function mmPerMToPercent(mmPerM: number) {
  return (mmPerM || 0) / 10;
}
export function percentToMmPerM(percent: number) {
  return (percent || 0) * 10;
}
export function mmPerMToDeg(mmPerM: number) {
  return Math.atan(((mmPerM || 0) / 1000)) * 180 / Math.PI;
}
export function degToMmPerM(deg: number) {
  return Math.tan((deg || 0) * Math.PI / 180) * 1000;
}

// Area conversions
export function m2ToFt2(m2: number) { return (m2 || 0) * SQFT_PER_SQM; }
export function ft2ToM2(ft2: number) { return (ft2 || 0) / SQFT_PER_SQM; }
export function m2ToSquares(m2: number) { return m2ToFt2(m2) / 100; }
export function squaresToM2(sq: number) { return ft2ToM2((sq || 0) * 100); }

// Volume conversions
export function m3ToYd3(m3: number) { return (m3 || 0) * YD3_PER_M3; }
export function yd3ToM3(yd3: number) { return (yd3 || 0) / YD3_PER_M3; }
export function bagsNeeded(volumeM3: number, yieldPerBagM3: number) {
  const v = Math.max(0, volumeM3 || 0);
  const y = Math.max(0, yieldPerBagM3 || 0);
  if (y === 0) return 0;
  return Math.ceil(v / y);
}

// Scale conversions (plan <-> real)
export function planToReal(plan: number, numer: number, denom: number) {
  const n = Math.max(0.000001, numer || 0);
  const d = Math.max(0.000001, denom || 0);
  return (plan || 0) * (d / n);
}
export function realToPlan(real: number, numer: number, denom: number) {
  const n = Math.max(0.000001, numer || 0);
  const d = Math.max(0.000001, denom || 0);
  return (real || 0) * (n / d);
}

// Screw gauge mapping (approximate major diameters)
export const screwGaugeToMmMap: Record<number, number> = {
  4: 2.9,
  6: 3.5,
  8: 4.2,
  10: 4.8,
  12: 5.5,
  14: 6.3,
};
export function gaugeToMm(gauge: number) { return screwGaugeToMmMap[gauge] || 0; }
export function nearestGauge(mm: number) {
  const entries = Object.entries(screwGaugeToMmMap).map(([g, m]) => ({ g: parseInt(g, 10), mm: m }));
  const target = mm || 0;
  let best = entries[0];
  for (const e of entries) {
    if (Math.abs(e.mm - target) < Math.abs(best.mm - target)) best = e;
  }
  return best;
}
export function pilotSizesFromMajor(mm: number) {
  const soft = Math.max(0, Math.round((mm * 0.65) * 10) / 10);
  const hard = Math.max(0, Math.round((mm * 0.75) * 10) / 10);
  return { soft, hard };
}

// Thread pitch <-> TPI
export function tpiFromPitch(pitchMm: number) { return (pitchMm || 0) === 0 ? 0 : 25.4 / pitchMm; }
export function pitchFromTpi(tpi: number) { return (tpi || 0) === 0 ? 0 : 25.4 / tpi; }

// UNC/UNF table for nearest suggestion (by diameter in inches)
export const UN_THREADS: { diaIn: number; unc: number; unf: number }[] = [
  { diaIn: 0.25, unc: 20, unf: 28 },
  { diaIn: 5/16, unc: 18, unf: 24 },
  { diaIn: 3/8, unc: 16, unf: 24 },
  { diaIn: 7/16, unc: 14, unf: 20 },
  { diaIn: 0.5, unc: 13, unf: 20 },
  { diaIn: 9/16, unc: 12, unf: 18 },
  { diaIn: 5/8, unc: 11, unf: 18 },
  { diaIn: 3/4, unc: 10, unf: 16 },
  { diaIn: 1, unc: 8, unf: 12 },
];
export function nearestUnSeries(diaMm: number, tpi: number) {
  const diaIn = (diaMm || 0) * IN_PER_MM;
  // Find nearest diameter row
  let nearest = UN_THREADS[0];
  for (const row of UN_THREADS) {
    if (Math.abs(row.diaIn - diaIn) < Math.abs(nearest.diaIn - diaIn)) nearest = row;
  }
  const uncDelta = Math.abs((nearest.unc || 0) - (tpi || 0));
  const unfDelta = Math.abs((nearest.unf || 0) - (tpi || 0));
  const series = uncDelta <= unfDelta ? 'UNC' : 'UNF';
  const suggestedTpi = series === 'UNC' ? nearest.unc : nearest.unf;
  return { series, suggestedTpi, nearestDiaIn: nearest.diaIn };
}

// Drill size mapping
export type DrillSuggestion = { label: string; inches: number; mm: number; type: 'fraction' | 'letter' | 'metric' };

// Fractions 1/64 to 63/64
const FRACTIONS: { label: string; inches: number }[] = Array.from({ length: 63 }, (_, i) => ({
  label: `${i + 1}/64"`,
  inches: (i + 1) / 64,
}));

// Letter drills A-Z (inches)
const LETTERS: { letter: string; inches: number }[] = [
  ['A', 0.234], ['B', 0.238], ['C', 0.242], ['D', 0.246], ['E', 0.25],
  ['F', 0.257], ['G', 0.261], ['H', 0.266], ['I', 0.272], ['J', 0.277],
  ['K', 0.281], ['L', 0.290], ['M', 0.295], ['N', 0.302], ['O', 0.316],
  ['P', 0.323], ['Q', 0.332], ['R', 0.339], ['S', 0.348], ['T', 0.358],
  ['U', 0.368], ['V', 0.377], ['W', 0.386], ['X', 0.397], ['Y', 0.404], ['Z', 0.413],
].map(([letter, inches]) => ({ letter, inches })) as any;

export function nearestFraction(mm: number): DrillSuggestion {
  const targetIn = (mm || 0) * IN_PER_MM;
  let best = FRACTIONS[0];
  for (const f of FRACTIONS) {
    if (Math.abs(f.inches - targetIn) < Math.abs(best.inches - targetIn)) best = f;
  }
  return { label: best.label, inches: best.inches, mm: best.inches * MM_PER_IN, type: 'fraction' };
}
export function nearestLetter(mm: number): DrillSuggestion {
  const targetIn = (mm || 0) * IN_PER_MM;
  let best = LETTERS[0];
  for (const l of LETTERS) {
    if (Math.abs(l.inches - targetIn) < Math.abs(best.inches - targetIn)) best = l;
  }
  return { label: best.letter, inches: best.inches, mm: best.inches * MM_PER_IN, type: 'letter' } as DrillSuggestion;
}
export function nearestMetric(mm: number): DrillSuggestion {
  const rounded = Math.round((mm || 0) * 10) / 10; // 0.1mm steps
  return { label: `${rounded.toFixed(1)} mm`, inches: rounded * IN_PER_MM, mm: rounded, type: 'metric' };
}

// Timber sizes
export type SizePair = { nominal: [number, number]; actual: [number, number] };
export const NZ_TIMBER: SizePair[] = [
  { nominal: [75, 50], actual: [70, 45] },
  { nominal: [100, 50], actual: [90, 45] },
  { nominal: [140, 50], actual: [135, 45] },
  { nominal: [150, 50], actual: [140, 45] },
  { nominal: [190, 50], actual: [185, 45] },
  { nominal: [200, 50], actual: [190, 45] },
  { nominal: [240, 50], actual: [235, 45] },
  { nominal: [250, 50], actual: [240, 45] },
  { nominal: [300, 50], actual: [290, 45] },
];

export const US_LUMBER: { nominal: [number, number]; actualIn: [number, number] }[] = [
  { nominal: [2, 4], actualIn: [1.5, 3.5] },
  { nominal: [2, 6], actualIn: [1.5, 5.5] },
  { nominal: [2, 8], actualIn: [1.5, 7.25] },
  { nominal: [2, 10], actualIn: [1.5, 9.25] },
  { nominal: [2, 12], actualIn: [1.5, 11.25] },
  { nominal: [4, 4], actualIn: [3.5, 3.5] },
];

export function toMm(inches: number) { return inches * MM_PER_IN; }
export function toIn(mm: number) { return mm * IN_PER_MM; }

