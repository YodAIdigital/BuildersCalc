import { calcRoofRafter } from './roofRafter';
import { CLADDING_MIN_DEG, pitchWarnings } from './roofPitch';
import type { Settings } from '../storage/settings';

export type RoofType = 'flat' | 'mono' | 'dual';

export type CabinConfig = {
  length: number; // mm
  width: number; // mm
  height: number; // mm to top plate/eave
  roofType: RoofType;
  pitchDeg: number; // 0 for flat
  overhang: number; // mm horizontal eave overhang
  includeOverhangInArea: boolean;
  rafterSpacing: number; // mm
  studSpacing: number; // mm
  nogSpacing: number; // mm
  joistSpacing: number; // mm
  bearerSpacing: number; // mm
  pileSpacing: number; // mm
  openings: {
    windows: { count: number; width: number; height: number }[];
    doors: { count: number; width: number; height: number }[];
  };
  exteriorCladding: 'ply' | 'corrugate' | 'tray' | 'longrun' | 'fiveRib' | 'PIR' | 'cedar weatherboard' | 'standard weatherboard' | 'membrane';
  lining: 'none' | 'ply' | 'gib';
  insulated: boolean;
  electrical?: boolean;
  sheetSizeM: { w: number; h: number }; // for sheet goods
};

export type BOMItem = {
  category: string;
  name: string;
  unit: 'm' | 'm2' | 'each' | 'sheet';
  qty: number;
  rate: number; // $/unit
  subtotal: number; // qty * rate
};

export type CabinWarnings = string[];

export type CabinResult = {
  items: BOMItem[];
  totals: { exGst: number; gst: number; inclGst: number };
  warnings: CabinWarnings;
  debug?: Record<string, unknown>;
};

function mm2m(mm: number) {
  return mm / 1000;
}

function areaM2FromMm(length: number, width: number) {
  return (length * width) / 1_000_000;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function computeCabin(config: CabinConfig, settings: Settings): CabinResult {
  const warnings: string[] = [];
  const L = config.length;
  const W = config.width;
  const H = config.height;
  const P = 2 * (L + W);

  const sheetArea = config.sheetSizeM.w * config.sheetSizeM.h; // m2

  // Derive roof geometry
  const pitch = config.roofType === 'flat' ? 0 : (config.pitchDeg || 0);
  const overhang = Math.max(0, config.overhang || 0);

  // Pitch/code warnings
  const claddingKey = normalizeCladdingKey(config.exteriorCladding);
  for (const w of pitchWarnings({ pitch, cladding: claddingKey })) warnings.push(w.message);

  if (config.rafterSpacing < 300 || config.rafterSpacing > 900)
    warnings.push('Rafter spacing is outside typical range (300–900 mm).');
  if (config.studSpacing < 300 || config.studSpacing > 600)
    warnings.push('Stud spacing is outside typical range (300–600 mm).');

  // Openings total areas
  const openings = distributeOpenings(config);
  const windowAreaM2 = openings.windows.reduce((acc, o) => acc + areaM2FromMm(o.width, o.height) * o.count, 0);
  const doorAreaM2 = openings.doors.reduce((acc, o) => acc + areaM2FromMm(o.width, o.height) * o.count, 0);
  const totalOpeningAreaM2 = windowAreaM2 + doorAreaM2;

  // Walls areas
  const wallAreaM2Base = areaM2FromMm(P, H);
  const wallNetAreaM2 = Math.max(0, wallAreaM2Base - totalOpeningAreaM2);

  // Gable triangular wall areas (above eaves)
  let gableExtraM2 = 0;
  let runForRafter = W / 2; // default dual
  let roofSides = 2;
  if (config.roofType === 'mono') {
    runForRafter = W;
    roofSides = 1;
  } else if (config.roofType === 'flat') {
    runForRafter = W;
    roofSides = 1; // area not doubled for flat
  }

  const roofRafter = calcRoofRafter({
    halfSpan: runForRafter,
    pitch: pitch,
    buildingLength: L,
    rafterSpacing: config.rafterSpacing,
    includeOverhangInArea: config.includeOverhangInArea,
    overhang: overhang,
  });

  const rafterLen = roofRafter?.common || (pitch === 0 ? runForRafter : Math.sqrt(runForRafter * runForRafter));
  const roofSlopeAreaM2 = roofRafter ? roofRafter.areaTotal / 1_000_000 : (config.includeOverhangInArea ? areaM2FromMm(L, runForRafter + overhang) : areaM2FromMm(L, runForRafter)) * roofSides;

  if (config.roofType === 'dual' && roofRafter) {
    const rise = roofRafter.rise;
    gableExtraM2 = areaM2FromMm(W, rise) * 1; // both ends combined: width*rise/2 *2 => width*rise/1
  } else if (config.roofType === 'mono' && roofRafter) {
    const rise = roofRafter.rise;
    gableExtraM2 = areaM2FromMm(L, rise) * 0.5; // single triangular end
  }

  // Internal lining areas (one side of external walls + ceiling)
  const ceilingAreaM2 = areaM2FromMm(L, W);
  const liningWallM2 = wallNetAreaM2 + gableExtraM2;
  const liningTotalM2 = (config.lining === 'none' ? 0 : liningWallM2 + ceilingAreaM2);

  // Studs and plates (detailed framing approximations)
  const studsPerLong = Math.floor(L / config.studSpacing) + 1;
  const studsPerShort = Math.floor(W / config.studSpacing) + 1;
  let studs = studsPerLong * 2 + studsPerShort * 2;
  // subtract studs replaced by openings across walls (approx)
  const openingWidths = totalOpeningWidth(openings); // mm summed
  const studsRemoved = Math.floor(openingWidths / config.studSpacing);
  studs = Math.max(0, studs - studsRemoved);
  // add corner studs (assume 2 extra per corner beyond counted ends)
  studs += 8;
  // add per-opening king and jack studs (2 king + 2 jack)
  const openingCount = openings.windows.reduce((a, o) => a + o.count, 0) + openings.doors.reduce((a, o) => a + o.count, 0);
  studs += openingCount * 4;

  // Nogs rows
  const nogRows = Math.max(0, Math.ceil(H / config.nogSpacing) - 1);
  const nogsLm = (mm2m(P) - mm2m(openingWidths)) * nogRows;

  // Plates: bottom + double top
  const platesLm = mm2m(P) * 3;

  // Lintels and sills
  const lintelLm = mm2m(
    openings.doors.reduce((a, d) => a + d.count * d.width, 0) +
      openings.windows.reduce((a, w) => a + w.count * w.width, 0)
  );
  const sillLm = mm2m(openings.windows.reduce((a, w) => a + w.count * w.width, 0));

  // Floor structure
  const joists = Math.floor(L / config.joistSpacing) + 1;
  const joistLm = joists * mm2m(W);
  const rimJoistLm = mm2m(2 * (L + W));
  const bearers = Math.floor(W / config.bearerSpacing) + 1;
  const bearerLm = bearers * mm2m(L);
  const piles = bearers * (Math.ceil(L / config.pileSpacing) + 1);

  // Roof rafters (count per side)
  const raftersPerSide = roofRafter?.rafterCountPerSide || (Math.floor(L / config.rafterSpacing) + 1);
  const rafterCount = raftersPerSide * (config.roofType === 'dual' ? 2 : 1);
  const rafterLm = rafterCount * mm2m(rafterLen || runForRafter);

  // Wall cladding area (external) includes gable extra
  const exteriorWallAreaM2 = wallNetAreaM2 + gableExtraM2;

  // Costs and BOM build-up
  const items: BOMItem[] = [];

  function push(name: string, unit: BOMItem['unit'], qty: number, rate: number, category = 'materials') {
    const subtotal = round2(qty * rate);
    items.push({ category, name, unit, qty: round2(qty), rate: round2(rate), subtotal });
  }

  // Timber total linear meters (studs approximated as full-height)
  const timberLm = platesLm + nogsLm + lintelLm + sillLm + joistLm + rimJoistLm + bearerLm + rafterLm + studs * mm2m(H);
  push('Timber (linear)', 'm', timberLm, settings.timberPerM, 'timber');

  // Piles
  if (piles > 0) push('Piles', 'each', piles, settings.pilePerEach, 'foundation');

  // Windows and doors (incl hardware)
  if (windowAreaM2 > 0) push('Windows', 'm2', windowAreaM2, settings.windowPerM2, 'openings');
  const doorUnits = openings.doors.reduce((a, d) => a + d.count, 0);
  if (doorUnits > 0) push('Doors', 'each', doorUnits, settings.doorPerUnit, 'openings');
  if (doorUnits > 0) push('Door hardware', 'each', doorUnits, settings.doorHardwarePerUnit, 'openings');

  // Exterior cladding
  const extType = config.exteriorCladding;
  const preferPerM2 = ['corrugate', 'tray', 'longrun', 'five rib', '5 rib', 'fiveRib', 'membrane', 'cedar weatherboard', 'standard weatherboard'];
  const extIsSheet = extType.toLowerCase().includes('ply') || extType.toLowerCase() === 'pir';

  if (extIsSheet) {
    const sheets = Math.ceil(exteriorWallAreaM2 / sheetArea * 1.1); // 10% waste
    const key = extType.toLowerCase() === 'pir' ? 'pir' : 'treatedPly';
    const rate = settings.sheetCosts[key] ?? 0;
    if (sheets > 0) push(`${extType} (sheets)`, 'sheet', sheets, rate, 'cladding');
  } else {
    const key = mapCladdingToSettingsKey(extType);
    const rate = settings.claddingPerM2[key as keyof Settings['claddingPerM2']] ?? 0;
    if (exteriorWallAreaM2 > 0) push(`${extType} (walls)`, 'm2', exteriorWallAreaM2, rate, 'cladding');
  }

  // Building wrap over wall area
  if (exteriorWallAreaM2 > 0) push('Building wrap', 'm2', exteriorWallAreaM2, settings.buildingWrapPerM2, 'cladding');

  // Roof cladding (prefer per m2)
  const roofCladKey = mapCladdingToSettingsKey(extType);
  const roofCladRate = settings.claddingPerM2[roofCladKey as keyof Settings['claddingPerM2']] ?? settings.sheetCosts.longrun ?? 0;
  if (roofSlopeAreaM2 > 0) push('Roof cladding', 'm2', roofSlopeAreaM2, roofCladRate, 'roof');
  if (roofSlopeAreaM2 > 0) push('Roof underlay', 'm2', roofSlopeAreaM2, settings.costUnderlayPerM2, 'roof');

  // Roof accessories lengths
  const ridgeM = config.roofType === 'dual' ? mm2m(L) : 0;
  const gutterM = config.roofType === 'dual' ? mm2m(2 * L) : mm2m(L);
  const bargeM = (config.roofType === 'dual' ? 2 : 2) * mm2m(rafterLen || runForRafter);
  const fasciaM = gutterM;

  if (ridgeM > 0) push('Ridge cap', 'm', ridgeM, settings.costRidgeCapPerM, 'roof');
  if (bargeM > 0) push('Barge cap', 'm', bargeM, settings.costBargeCapPerM, 'roof');
  if (gutterM > 0) push('Gutter', 'm', gutterM, settings.costGutterPerM, 'roof');
  if (fasciaM > 0) push('Fascia', 'm', fasciaM, settings.costFasciaPerM, 'roof');

  // Fixings allowance over wall + roof areas
  const fixingsAreaM2 = exteriorWallAreaM2 + roofSlopeAreaM2;
  if (fixingsAreaM2 > 0) push('Fixings allowance', 'm2', fixingsAreaM2, settings.fixingsAllowancePerM2, 'misc');

  // Internal lining
  if (config.lining !== 'none') {
    const liningKey = config.lining === 'ply' ? 'ply' : 'gib';
    const liningRate = settings.liningPerM2[liningKey];
    push(`Internal lining (${config.lining})`, 'm2', liningTotalM2, liningRate, 'interior');
    if (config.insulated) {
      push('Insulation', 'm2', liningWallM2 + ceilingAreaM2, settings.insulationPerM2, 'interior');
    }
  }
  // Electrical (optional)
  if (config.electrical) {
    if (settings.electricalFixed && settings.electricalFixed > 0) {
      push('Electrical (est.)', 'each', 1, settings.electricalFixed, 'interior');
    } else {
      push('Electrical (est.)', 'm2', liningWallM2 + ceilingAreaM2, settings.electricalPerM2, 'interior');
    }
  }

  // Labour approximation
  const labourAreaM2 = exteriorWallAreaM2 + roofSlopeAreaM2;
  if (labourAreaM2 > 0) push('Labour (est.)', 'm2', labourAreaM2, settings.labourPerM2, 'labour');

  // Totals
  const exGst = round2(items.reduce((a, it) => a + it.subtotal, 0));
  const gst = round2(exGst * (settings.gstRate || 0));
  const inclGst = round2(exGst + gst);

  return {
    items,
    totals: { exGst, gst, inclGst },
    warnings,
    debug: {
      studs,
      nogRows,
      nogsLm,
      platesLm,
      raftersPerSide,
      rafterLm,
      joists,
      joistLm,
      rimJoistLm,
      bearers,
      bearerLm,
      piles,
      wallAreaM2Base,
      wallNetAreaM2,
      gableExtraM2,
      roofSlopeAreaM2,
      ceilingAreaM2,
      windowAreaM2,
      doorAreaM2,
    },
  };
}

function normalizeCladdingKey(input: string): string {
  const s = input.toLowerCase();
  if (s.includes('tray')) return 'longrun';
  if (s.includes('five') || s.includes('5 rib') || s.includes('5rib')) return 'fiveRib';
  if (s.includes('cedar')) return 'cedarWeatherboard';
  if (s.includes('standard weatherboard')) return 'standardWeatherboard';
  if (s === 'corrugate') return 'corrugate';
  if (s === 'longrun') return 'longrun';
  if (s === 'membrane') return 'membrane';
  return s;
}

function mapCladdingToSettingsKey(input: string): keyof Settings['claddingPerM2'] {
  const key = normalizeCladdingKey(input) as keyof Settings['claddingPerM2'];
  return (key in ({} as Settings['claddingPerM2'])) ? key : (['longrun','corrugate','membrane','fiveRib','cedarWeatherboard','standardWeatherboard'].includes(key as string) ? (key as any) : 'longrun');
}

function distributeOpenings(config: CabinConfig) {
  // Minimal v1: return arrays as-is; positions not used. Even distribution assumed in calculations where needed.
  return config.openings;
}

function totalOpeningWidth(openings: CabinConfig['openings']): number {
  const w = openings.windows.reduce((a, o) => a + o.width * o.count, 0);
  const d = openings.doors.reduce((a, o) => a + o.width * o.count, 0);
  return w + d; // mm
}
