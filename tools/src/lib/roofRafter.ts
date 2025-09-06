import { solveRightTriangle } from './trig';

export type RoofRafterInputs = Partial<{
  span: number; // full span
  halfSpan: number; // run (half span)
  pitch: number; // degrees
  rise: number; // vertical rise
  common: number; // common rafter length
  overhang: number; // horizontal overhang
}>;

export type RoofRafterResult = {
  span: number;
  halfSpan: number;
  pitch: number;
  rise: number;
  common: number;
  commonAtRidge: number; // adjusted for ridge thickness
  overhang: number;
  overhangSlope: number;
  total: number; // common + overhangSlope (to eave tip)
  plumb: number;
  birdsmouth: number;
  seatLength: number; // horizontal seat length from seat depth
  areaPerSide: number;
  areaTotal: number;
  rafterCountPerSide: number;
};

const toRad = (d: number) => (d * Math.PI) / 180;

export function calcRoofRafter(
  inputs: RoofRafterInputs & {
    ridgeThickness?: number;
    seatDepth?: number;
    buildingLength?: number;
    rafterSpacing?: number;
    includeOverhangInArea?: boolean;
  }
): RoofRafterResult | null {
  let { span, halfSpan, pitch, rise, common, overhang } = inputs;

  // Prefer explicit halfSpan if provided; otherwise derive from span
  if ((halfSpan ?? 0) <= 0 && (span ?? 0) > 0) halfSpan = (span as number) / 2;
  if ((span ?? 0) <= 0 && (halfSpan ?? 0) > 0) span = (halfSpan as number) * 2;

  // Prepare inputs: treat non-positive numbers as undefined
  const u = (n?: number) => (n && n > 0 ? n : undefined);
  const vals = { a: u(rise), b: u(halfSpan), c: u(common), A: u(pitch) } as {
    a?: number;
    b?: number;
    c?: number;
    A?: number;
  };
  const present = Object.entries(vals)
    .filter(([, v]) => v != null)
    .map(([k]) => k as 'a' | 'b' | 'c' | 'A');
  if (present.length < 2) return null;

  // If we have more than two, prefer stable pairs in this order: (b,A), (a,b), (a,A), (b,c), (A,c)
  const preferPairs: Array<Array<'a' | 'b' | 'c' | 'A'>> = [
    ['b', 'A'],
    ['a', 'b'],
    ['a', 'A'],
    ['b', 'c'],
    ['A', 'c'],
  ];
  let chosen: Array<'a' | 'b' | 'c' | 'A'> | null = null;
  if (present.length > 2) {
    for (const p of preferPairs) {
      if (p.every((k) => present.includes(k))) {
        chosen = p;
        break;
      }
    }
    if (!chosen) chosen = present.slice(0, 2) as Array<'a' | 'b' | 'c' | 'A'>;
  } else {
    chosen = present as Array<'a' | 'b' | 'c' | 'A'>;
  }

  const triInputs: { a?: number; b?: number; c?: number; A?: number } = {};
  for (const k of chosen) (triInputs as any)[k] = (vals as any)[k];

  // Try solving via right-triangle helper using exactly two values
  const tri = solveRightTriangle(triInputs);

  if (!tri) return null;

  rise = tri.a;
  halfSpan = tri.b;
  common = tri.c;
  pitch = tri.A;
  span = span ?? (halfSpan ? halfSpan * 2 : 0);

  overhang = overhang ?? 0;
  const overhangSlope = overhang > 0 && pitch ? overhang / Math.cos(toRad(pitch)) : 0;

  // Advanced adjustments and outputs
  const ridgeT = inputs.ridgeThickness ?? 0;
  const seatDepth = inputs.seatDepth ?? 0;
  const buildingLength = inputs.buildingLength ?? 0;
  const spacing = inputs.rafterSpacing ?? 0;

  const commonAtRidge =
    (common ?? 0) - (ridgeT > 0 && pitch ? ridgeT / (2 * Math.sin(toRad(pitch))) : 0);
  const total = (common ?? 0) + overhangSlope;
  const plumb = pitch ?? 0;
  const birdsmouth = 90 - plumb;
  const seatLength = seatDepth > 0 && pitch ? seatDepth / Math.tan(toRad(pitch)) : 0;

  const effectiveWidth = (inputs.includeOverhangInArea ?? true) ? total : (common ?? 0);
  const areaPerSide = (buildingLength > 0 ? buildingLength * effectiveWidth : 0) / 1; // mm^2
  const areaTotal = areaPerSide * 2;

  const rafterCountPerSide =
    spacing > 0 && buildingLength > 0 ? Math.floor(buildingLength / spacing) + 1 : 0;

  return {
    span: round(span ?? 0, 2),
    halfSpan: round(halfSpan ?? 0, 2),
    pitch: round(pitch ?? 0, 2),
    rise: round(rise ?? 0, 2),
    common: round(common ?? 0, 2),
    commonAtRidge: round(commonAtRidge, 2),
    overhang: round(overhang ?? 0, 2),
    overhangSlope: round(overhangSlope, 2),
    total: round(total, 2),
    plumb: round(plumb, 2),
    birdsmouth: round(birdsmouth, 2),
    seatLength: round(seatLength, 2),
    areaPerSide: round(areaPerSide, 2),
    areaTotal: round(areaTotal, 2),
    rafterCountPerSide: Math.max(0, Math.floor(rafterCountPerSide)),
  };
}

export const round = (n: number, d = 2) => (Number.isFinite(n) ? parseFloat(n.toFixed(d)) : 0);
