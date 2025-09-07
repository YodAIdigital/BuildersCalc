import React from 'react';
import {
  decimalToFractionInches,
  ftToMm,
  inToMm,
  mmToFt,
  mmToIn,
  mmToM,
  mToMm,
} from '../lib/converter';
import {
  degToPercent,
  percentToDeg,
  mmPerMToPercent,
  percentToMmPerM,
  mmPerMToDeg,
  degToMmPerM,
  m2ToFt2,
  ft2ToM2,
  m2ToSquares,
  squaresToM2,
  m3ToYd3,
  yd3ToM3,
  bagsNeeded,
  planToReal,
  realToPlan,
  gaugeToMm,
  nearestGauge,
  pilotSizesFromMajor,
  tpiFromPitch,
  pitchFromTpi,
  nearestUnSeries,
  nearestFraction,
  nearestLetter,
  nearestMetric,
  NZ_TIMBER,
  US_LUMBER,
  toIn,
} from '../lib/build';

export default function UnitConverter() {
  const [mm, setMm] = React.useState('');
  const [m, setM] = React.useState('');
  const [inch, setInch] = React.useState('');
  const [ft, setFt] = React.useState('');
  const [diaMm, setDiaMm] = React.useState('');

  // Drainage fall state
  const [fallMmPerM, setFallMmPerM] = React.useState('');
  const [fallPercent, setFallPercent] = React.useState('');
  const [fallDeg, setFallDeg] = React.useState('');

  // Area state
  const [areaM2, setAreaM2] = React.useState('');
  const [areaFt2, setAreaFt2] = React.useState('');
  const [areaSquares, setAreaSquares] = React.useState('');

  // Volume state
  const [volM3, setVolM3] = React.useState('');
  const [volYd3, setVolYd3] = React.useState('');
  const [bagYieldM3, setBagYieldM3] = React.useState('0.012');

  // Scale state
  const [scaleNumer, setScaleNumer] = React.useState('1');
  const [scaleDenom, setScaleDenom] = React.useState('100');
  const [planLenMm, setPlanLenMm] = React.useState('');
  const [realLenMm, setRealLenMm] = React.useState('');

  // Screw gauge state
  const [gauge, setGauge] = React.useState('8');
  const [gaugeMmInput, setGaugeMmInput] = React.useState('');

  // Thread pitch / TPI state
  const [threadDiaMm, setThreadDiaMm] = React.useState('');
  const [threadPitchMm, setThreadPitchMm] = React.useState('');
  const [threadTpi, setThreadTpi] = React.useState('');

  // Drill size mapping state
  const [drillTargetMm, setDrillTargetMm] = React.useState('');

  // Timber sizes
  const [timberRegion, setTimberRegion] = React.useState<'NZ' | 'US'>('NZ');
  const [timberIdx, setTimberIdx] = React.useState('0');

  // Sheet effective cover
  const [sheetRunMm, setSheetRunMm] = React.useState('');
  const [sheetEffCoverMm, setSheetEffCoverMm] = React.useState('');
  const [sheetOverallMm, setSheetOverallMm] = React.useState('');
  const [sheetLapMm, setSheetLapMm] = React.useState('');

  function onChange(source: 'mm' | 'm' | 'in' | 'ft', value: string) {
    const val = parseFloat(value) || 0;
    if (source === 'mm') {
      setMm(value);
      setM(mmToM(val).toString());
      setInch(mmToIn(val).toFixed(4));
      setFt(mmToFt(val).toFixed(4));
    } else if (source === 'm') {
      setM(value);
      const mmv = mToMm(val);
      setMm(mmv.toString());
      setInch(mmToIn(mmv).toFixed(4));
      setFt(mmToFt(mmv).toFixed(4));
    } else if (source === 'in') {
      setInch(value);
      const mmv = inToMm(val);
      setMm(mmv.toFixed(2));
      setM(mmToM(mmv).toFixed(4));
      setFt(mmToFt(mmv).toFixed(4));
    } else {
      setFt(value);
      const mmv = ftToMm(val);
      setMm(mmv.toFixed(2));
      setM(mmToM(mmv).toFixed(4));
      setInch(mmToIn(mmv).toFixed(4));
    }
  }


  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Unit Converter</h2>
      {/* Desktop: two columns (left = unit length fields, right = screw/nut diameter). Mobile/tablet: stacked. */}
      <div
        className="grid grid-cols-1 gap-6 items-start lg:grid-cols-2"
        data-testid="unit-converter-grid"
      >
        {/* Left column stack */}
        <div data-testid="unit-fields-panel" className="space-y-4">
          {/* Length */}
          <div className="rounded-md border bg-white p-4">
            <h3 className="font-semibold mb-2">Length</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm">Millimetres (mm)</span>
                <input
                  value={mm}
                  onChange={(e) => onChange('mm', e.target.value)}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                />
              </label>
              <label className="block">
                <span className="text-sm">Metres (m)</span>
                <input
                  value={m}
                  onChange={(e) => onChange('m', e.target.value)}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                />
              </label>
              <label className="block">
                <span className="text-sm">Inches (in)</span>
                <input
                  value={inch}
                  onChange={(e) => onChange('in', e.target.value)}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                />
              </label>
              <label className="block">
                <span className="text-sm">Feet (ft)</span>
                <input
                  value={ft}
                  onChange={(e) => onChange('ft', e.target.value)}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                />
              </label>
            </div>
          </div>

          {/* Area */}
          <div className="rounded-md border bg-white p-4">
            <h3 className="font-semibold mb-2">Area</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm">m²</span>
                <input
                  value={areaM2}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    setAreaM2(e.target.value);
                    setAreaFt2(m2ToFt2(v).toFixed(2));
                    setAreaSquares(m2ToSquares(v).toFixed(4));
                  }}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                />
              </label>
              <label className="block">
                <span className="text-sm">ft²</span>
                <input
                  value={areaFt2}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    setAreaFt2(e.target.value);
                    const m2 = ft2ToM2(v);
                    setAreaM2(m2.toFixed(2));
                    setAreaSquares(m2ToSquares(m2).toFixed(4));
                  }}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                />
              </label>
              <label className="block">
                <span className="text-sm">Squares (100 ft²)</span>
                <input
                  value={areaSquares}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    setAreaSquares(e.target.value);
                    const m2 = squaresToM2(v);
                    setAreaM2(m2.toFixed(2));
                    setAreaFt2(m2ToFt2(m2).toFixed(2));
                  }}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                />
              </label>
            </div>
          </div>

          {/* Volume + Bags */}
          <div className="rounded-md border bg-white p-4">
            <h3 className="font-semibold mb-2">Volume & Premix Bags</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="block">
                <span className="text-sm">m³</span>
                <input
                  value={volM3}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    setVolM3(e.target.value);
                    setVolYd3(m3ToYd3(v).toFixed(3));
                  }}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                  step="0.001"
                />
              </label>
              <label className="block">
                <span className="text-sm">yd³</span>
                <input
                  value={volYd3}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    setVolYd3(e.target.value);
                    setVolM3(yd3ToM3(v).toFixed(3));
                  }}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                  step="0.001"
                />
              </label>
              <label className="block">
                <span className="text-sm">Bag yield (m³)</span>
                <input
                  value={bagYieldM3}
                  onChange={(e) => setBagYieldM3(e.target.value)}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                  step="0.001"
                />
              </label>
            </div>
            <div className="mt-2 text-sm">
              <span className="text-slate-600">Bags needed: </span>
              <span className="font-semibold text-pink-700">
                {bagsNeeded(parseFloat(volM3) || 0, parseFloat(bagYieldM3) || 0)}
              </span>
            </div>
          </div>

          {/* Scale */}
          <div className="rounded-md border bg-white p-4">
            <h3 className="font-semibold mb-2">Drawing Scale</h3>
            <div className="grid grid-cols-3 gap-3 items-end text-sm">
              <label className="block">
                <span>Scale numer</span>
                <input
                  value={scaleNumer}
                  onChange={(e) => setScaleNumer(e.target.value)}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                />
              </label>
              <div className="text-center pb-2">:</div>
              <label className="block">
                <span>Scale denom</span>
                <input
                  value={scaleDenom}
                  onChange={(e) => setScaleDenom(e.target.value)}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
              <label className="block text-sm">
                <span>Plan length (mm)</span>
                <input
                  value={planLenMm}
                  onChange={(e) => {
                    setPlanLenMm(e.target.value);
                    const real = planToReal(parseFloat(e.target.value) || 0, parseFloat(scaleNumer) || 0, parseFloat(scaleDenom) || 0);
                    setRealLenMm(real ? real.toFixed(2) : '');
                  }}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                />
              </label>
              <label className="block text-sm">
                <span>Actual length (mm)</span>
                <input
                  value={realLenMm}
                  onChange={(e) => {
                    setRealLenMm(e.target.value);
                    const plan = realToPlan(parseFloat(e.target.value) || 0, parseFloat(scaleNumer) || 0, parseFloat(scaleDenom) || 0);
                    setPlanLenMm(plan ? plan.toFixed(2) : '');
                  }}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                />
              </label>
            </div>
            <div className="mt-2 text-xs text-slate-600">Tip: Convert mm/in with the Length card.</div>
          </div>
        </div>

        {/* Right column stack */}
        <div className="space-y-4" data-testid="screw-conversions-panel">
          {/* Diameter (Screws/Nuts) */}
          <div className="rounded-md border bg-white p-4">
            <h3 className="font-semibold mb-2">Diameter (Screws/Nuts)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <label className="block">
                <span className="text-sm">Millimetres (mm)</span>
                <input
                  value={diaMm}
                  onChange={(e) => setDiaMm(e.target.value)}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                />
              </label>
              <div>
                <div className="text-sm text-slate-600">Fractional Inches (approx)</div>
                <div className="text-lg font-semibold text-pink-700">
                  {decimalToFractionInches((parseFloat(diaMm) || 0) / 25.4)}
                </div>
              </div>
            </div>
          </div>

          {/* Drainage fall */}
          <div className="rounded-md border bg-white p-4">
            <h3 className="font-semibold mb-2">Drainage Fall</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="block text-sm">
                <span>mm per m</span>
                <input
                  value={fallMmPerM}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    setFallMmPerM(e.target.value);
                    setFallPercent(mmPerMToPercent(v).toFixed(3));
                    setFallDeg(mmPerMToDeg(v).toFixed(4));
                  }}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                  step="0.1"
                />
              </label>
              <label className="block text-sm">
                <span>Percent (%)</span>
                <input
                  value={fallPercent}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    setFallPercent(e.target.value);
                    setFallMmPerM(percentToMmPerM(v).toFixed(2));
                    setFallDeg(percentToDeg(v).toFixed(4));
                  }}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                  step="0.001"
                />
              </label>
              <label className="block text-sm">
                <span>Degrees (°)</span>
                <input
                  value={fallDeg}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    setFallDeg(e.target.value);
                    setFallPercent(degToPercent(v).toFixed(3));
                    setFallMmPerM(degToMmPerM(v).toFixed(1));
                  }}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                  step="0.0001"
                />
              </label>
            </div>
          </div>

          {/* Screw gauge and pilot */}
          <div className="rounded-md border bg-white p-4">
            <h3 className="font-semibold mb-2">Screw Gauge ↔ mm + Pilot</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm items-end">
              <label className="block">
                <span>Gauge</span>
                <select
                  className="mt-1 w-full rounded-md border p-2"
                  value={gauge}
                  onChange={(e) => setGauge(e.target.value)}
                >
                  {[4,6,8,10,12,14].map((g) => (
                    <option key={g} value={g}>{`#${g}`}</option>
                  ))}
                </select>
              </label>
              <div className="sm:col-span-2">
                <div className="text-sm text-slate-600">Major Ø (mm)</div>
                <div className="text-lg font-semibold">{gaugeToMm(parseInt(gauge || '0', 10)).toFixed(2)} mm</div>
                <div className="text-xs mt-1 text-slate-600">
                  Pilot: softwood {pilotSizesFromMajor(gaugeToMm(parseInt(gauge || '0', 10))).soft.toFixed(1)} mm, hardwood {pilotSizesFromMajor(gaugeToMm(parseInt(gauge || '0', 10))).hard.toFixed(1)} mm
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm items-end mt-3">
              <label className="block">
                <span>Diameter (mm)</span>
                <input
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                  value={gaugeMmInput}
                  onChange={(e) => setGaugeMmInput(e.target.value)}
                />
              </label>
              <div className="sm:col-span-2">
                {(() => {
                  const g = nearestGauge(parseFloat(gaugeMmInput) || 0);
                  const pilots = pilotSizesFromMajor(g.mm || 0);
                  return (
                    <div className="text-sm">
                      <div className="text-slate-600">Nearest: <span className="font-semibold">#{g.g} ({g.mm.toFixed(2)} mm)</span></div>
                      <div className="text-xs mt-1 text-slate-600">Pilot: softwood {pilots.soft.toFixed(1)} mm, hardwood {pilots.hard.toFixed(1)} mm</div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* Threads: metric pitch ↔ TPI + UNC/UNF */}
          <div className="rounded-md border bg-white p-4">
            <h3 className="font-semibold mb-2">Threads: Metric ↔ TPI</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <label className="block">
                <span>Pitch (mm)</span>
                <input
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                  step="0.01"
                  value={threadPitchMm}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    setThreadPitchMm(e.target.value);
                    setThreadTpi(v ? tpiFromPitch(v).toFixed(2) : '');
                  }}
                />
              </label>
              <label className="block">
                <span>TPI</span>
                <input
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                  step="0.01"
                  value={threadTpi}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value) || 0;
                    setThreadTpi(e.target.value);
                    setThreadPitchMm(v ? pitchFromTpi(v).toFixed(2) : '');
                  }}
                />
              </label>
              <label className="block">
                <span>Dia (mm) for UNC/UNF</span>
                <input
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                  step="0.01"
                  value={threadDiaMm}
                  onChange={(e) => setThreadDiaMm(e.target.value)}
                />
              </label>
            </div>
            {threadDiaMm && threadTpi ? (
              <div className="mt-2 text-xs text-slate-700">
                {(() => {
                  const info = nearestUnSeries(parseFloat(threadDiaMm) || 0, parseFloat(threadTpi) || 0);
                  return (
                    <div>
                      Nearest series: <span className="font-semibold">{info.series}</span> @ {info.suggestedTpi} TPI (for ~{(info.nearestDiaIn * 25.4).toFixed(1)} mm)
                    </div>
                  );
                })()}
              </div>
            ) : null}
          </div>

          {/* Drill mapping */}
          <div className="rounded-md border bg-white p-4">
            <h3 className="font-semibold mb-2">Drill Size Mapping</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm items-end">
              <label className="block">
                <span>Target Ø (mm)</span>
                <input
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                  step="0.01"
                  value={drillTargetMm}
                  onChange={(e) => setDrillTargetMm(e.target.value)}
                />
              </label>
              <div>
                {(() => {
                  const mm = parseFloat(drillTargetMm) || 0;
                  const f = nearestFraction(mm);
                  return (
                    <div className="text-sm">
                      <div className="text-slate-600">Fractional</div>
                      <div className="font-semibold">{f.label} ({f.mm.toFixed(2)} mm)</div>
                    </div>
                  );
                })()}
              </div>
              <div>
                {(() => {
                  const mm = parseFloat(drillTargetMm) || 0;
                  const l = nearestLetter(mm);
                  return (
                    <div className="text-sm">
                      <div className="text-slate-600">Letter</div>
                      <div className="font-semibold">{l.label} ({l.mm.toFixed(2)} mm)</div>
                    </div>
                  );
                })()}
              </div>
            </div>
            <div className="mt-3 text-sm">
              {(() => {
                const mm = parseFloat(drillTargetMm) || 0;
                const m = nearestMetric(mm);
                return (
                  <div className="text-slate-700">Metric nearest: <span className="font-semibold">{m.label}</span></div>
                );
              })()}
            </div>
          </div>

          {/* Timber nominal ↔ actual */}
          <div className="rounded-md border bg-white p-4">
            <h3 className="font-semibold mb-2">Timber/Lumber: Nominal ↔ Actual</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm items-end">
              <label className="block">
                <span>Region</span>
                <select
                  className="mt-1 w-full rounded-md border p-2"
                  value={timberRegion}
                  onChange={(e) => { setTimberRegion((e.target.value as 'NZ' | 'US')); setTimberIdx('0'); }}
                >
                  <option value="NZ">NZ (metric)</option>
                  <option value="US">US (imperial)</option>
                </select>
              </label>
              <label className="block">
                <span>Nominal size</span>
                <select
                  className="mt-1 w-full rounded-md border p-2"
                  value={timberIdx}
                  onChange={(e) => setTimberIdx(e.target.value)}
                >
                  {timberRegion === 'NZ'
                    ? NZ_TIMBER.map((s, i) => (
                        <option key={i} value={i}>{`${s.nominal[0]}×${s.nominal[1]} mm`}</option>
                      ))
                    : US_LUMBER.map((s, i) => (
                        <option key={i} value={i}>{`${s.nominal[0]}×${s.nominal[1]} in`}</option>
                      ))}
                </select>
              </label>
            </div>
            <div className="mt-2 text-sm">
              {timberRegion === 'NZ' ? (
                (() => {
                  const s = NZ_TIMBER[parseInt(timberIdx || '0', 10)] || NZ_TIMBER[0];
                  return (
                    <div>
                      Actual: <span className="font-semibold">{s.actual[0]}×{s.actual[1]} mm</span>
                      <span className="text-slate-500"> ({toIn(s.actual[0]).toFixed(2)}×{toIn(s.actual[1]).toFixed(2)} in)</span>
                    </div>
                  );
                })()
              ) : (
                (() => {
                  const s = US_LUMBER[parseInt(timberIdx || '0', 10)] || US_LUMBER[0];
                  return (
                    <div>
                      Actual: <span className="font-semibold">{toIn(s.actualIn[0] * 25.4).toFixed(2)}×{toIn(s.actualIn[1] * 25.4).toFixed(2)} in</span>
                      <span className="text-slate-500"> ({(s.actualIn[0] * 25.4).toFixed(0)}×{(s.actualIn[1] * 25.4).toFixed(0)} mm)</span>
                    </div>
                  );
                })()
              )}
            </div>
          </div>

          {/* Sheet effective cover */}
          <div className="rounded-md border bg-white p-4">
            <h3 className="font-semibold mb-2">Sheet Effective Cover</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <label className="block">
                <span>Run to cover (mm)</span>
                <input className="mt-1 w-full rounded-md border p-2" type="number" value={sheetRunMm} onChange={(e) => setSheetRunMm(e.target.value)} />
              </label>
              <label className="block">
                <span>Effective cover (mm)</span>
                <input className="mt-1 w-full rounded-md border p-2" type="number" value={sheetEffCoverMm} onChange={(e) => setSheetEffCoverMm(e.target.value)} />
              </label>
              <label className="block">
                <span>Overall width (mm)</span>
                <input className="mt-1 w-full rounded-md border p-2" type="number" value={sheetOverallMm} onChange={(e) => setSheetOverallMm(e.target.value)} />
              </label>
              <label className="block">
                <span>Side lap width (mm)</span>
                <input className="mt-1 w-full rounded-md border p-2" type="number" value={sheetLapMm} onChange={(e) => setSheetLapMm(e.target.value)} />
              </label>
            </div>
            <div className="mt-2 text-sm">
              {(() => {
                const run = parseFloat(sheetRunMm) || 0;
                const eff = parseFloat(sheetEffCoverMm) || 0;
                const overall = parseFloat(sheetOverallMm) || 0;
                const lap = parseFloat(sheetLapMm) || 0;
                const effective = eff > 0 ? eff : (overall > 0 && lap > 0 ? (overall - lap) : 0);
                const count = effective > 0 ? Math.ceil(run / effective) : 0;
                return (
                  <div>
                    Effective cover: <span className="font-semibold">{effective > 0 ? effective.toFixed(1) : '—'} mm</span><br />
                    Sheets needed: <span className="font-semibold text-pink-700">{count}</span>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
