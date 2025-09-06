import React from 'react';
import CombinedRoofDiagram from '../components/CombinedRoofDiagram';
import { calcRoofRafter } from '../lib/roofRafter';
import { useSettings } from '../hooks/useSettings';

export default function RoofRafter() {
  const { settings } = useSettings();
  const [spanStr, setSpanStr] = React.useState('');
  const [halfStr, setHalfStr] = React.useState('');
  const [pitchStr, setPitchStr] = React.useState('');
  const [riseStr, setRiseStr] = React.useState('');
  const [commonStr, setCommonStr] = React.useState('');
  const [overhangStr, setOverhangStr] = React.useState('');
  // Advanced
  const [ridgeStr, setRidgeStr] = React.useState('');
  const [seatStr, setSeatStr] = React.useState('');
  const [lengthStr, setLengthStr] = React.useState('');
  const [spacingStr, setSpacingStr] = React.useState('600');
  const [includeOverhangArea, setIncludeOverhangArea] = React.useState(true);
  // Material estimation
  const [sheetWm, setSheetWm] = React.useState('2.4');
  const [sheetHm, setSheetHm] = React.useState('1.2');
  const [cladding, setCladding] = React.useState('corrugate');

  const [lastEdited, setLastEdited] = React.useState<
    'span' | 'half' | 'pitch' | 'rise' | 'common' | 'overhang'
  >('span');

  const parsed = {
    span: parseFloat(spanStr) || 0,
    halfSpan: parseFloat(halfStr) || 0,
    pitch: parseFloat(pitchStr) || 0,
    rise: parseFloat(riseStr) || 0,
    common: parseFloat(commonStr) || 0,
    overhang: parseFloat(overhangStr) || 0,
  };

  const solved = React.useMemo(() => {
    // Harmonize span/halfSpan coherently using lastEdited
    let { span, halfSpan } = parsed;
    if (lastEdited === 'span' && span > 0) halfSpan = span / 2;
    if (lastEdited === 'half' && halfSpan > 0) span = halfSpan * 2;
    const res = calcRoofRafter({
      ...parsed,
      span,
      halfSpan,
      ridgeThickness: parseFloat(ridgeStr) || 0,
      seatDepth: parseFloat(seatStr) || 0,
      buildingLength: parseFloat(lengthStr) || 0,
      rafterSpacing: parseFloat(spacingStr) || 0,
      includeOverhangInArea: includeOverhangArea,
    });
    return res;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed.span, parsed.halfSpan, parsed.pitch, parsed.rise, parsed.common, parsed.overhang, lastEdited]);

  React.useEffect(() => {
    if (!solved) return;
    const setIf = (field: string, setter: (s: string) => void, value: number | string) => {
      if (lastEdited !== field) setter(String(value ?? ''));
    };
    setIf('span', setSpanStr, solved.span);
    setIf('half', setHalfStr, solved.halfSpan);
    setIf('pitch', setPitchStr, solved.pitch);
    setIf('rise', setRiseStr, solved.rise);
    setIf('common', setCommonStr, solved.common);
    setIf('overhang', setOverhangStr, parsed.overhang || '');
  }, [solved, lastEdited]);

  const CLADDING_MIN: Record<string, number> = {
    corrugate: 8,
    longrun: 3,
    membrane: 1.5,
    metalTile: 12,
    concreteTile: 20,
    clayTile: 25,
    asphaltShingle: 18,
    slate: 22,
  };

  const warnings: string[] = [];
  if (solved?.pitch != null) {
    const minPitch = CLADDING_MIN[cladding] ?? 0;
    if (minPitch && solved.pitch < minPitch) warnings.push(`Pitch ${solved.pitch}° is below ${minPitch}° for selected cladding (NZ E2/AS1 guidance; verify manufacturer requirements).`);
    if (solved.pitch <= 0 || solved.pitch > 60) warnings.push('Pitch is outside typical buildable range (0–60°).');
  }

  const areaPerSideM2 = solved ? solved.areaPerSide / 1_000_000 : 0;
  const areaTotalM2 = solved ? solved.areaTotal / 1_000_000 : 0;
  const sheetArea = (parseFloat(sheetWm) || 0) * (parseFloat(sheetHm) || 0);
  const sheetsPerSide = solved && sheetArea > 0 ? Math.ceil(areaPerSideM2 / sheetArea) : 0;
  const sheetsTotal = solved && sheetArea > 0 ? Math.ceil(areaTotalM2 / sheetArea) : 0;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Roof & Rafter</h2>
      <p className="text-sm text-slate-600">Enter any two of span/half-span/rise/pitch/common (plus optional overhang). The rest will calculate.</p>
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="w-full">
          <CombinedRoofDiagram
            halfSpan={solved?.halfSpan}
            rise={solved?.rise}
            pitch={solved?.pitch}
            common={solved?.common}
            overhang={parsed.overhang || 0}
          />
        </div>
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm">Span (mm)</span>
              <input value={spanStr} onChange={(e) => { setSpanStr(e.target.value); setLastEdited('span'); }} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
            </label>
            <label className="block">
              <span className="text-sm">Half-span / Run (mm)</span>
              <input value={halfStr} onChange={(e) => { setHalfStr(e.target.value); setLastEdited('half'); }} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
            </label>
            <label className="block">
              <span className="text-sm">Pitch (°)</span>
              <input value={pitchStr} onChange={(e) => { setPitchStr(e.target.value); setLastEdited('pitch'); }} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" step="0.1" />
            </label>
            <label className="block">
              <span className="text-sm">Rise (mm)</span>
              <input value={riseStr} onChange={(e) => { setRiseStr(e.target.value); setLastEdited('rise'); }} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
            </label>
            <label className="block">
              <span className="text-sm">Common Rafter (mm)</span>
              <input value={commonStr} onChange={(e) => { setCommonStr(e.target.value); setLastEdited('common'); }} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
            </label>
            <label className="block">
              <span className="text-sm">Overhang (horizontal, mm)</span>
              <input value={overhangStr} onChange={(e) => { setOverhangStr(e.target.value); setLastEdited('overhang'); }} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
            </label>
          </div>

          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-semibold">Advanced</summary>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm">Cladding/Material (NZ min pitch)</span>
                <select value={cladding} onChange={(e)=> setCladding(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm">
                  <option value="corrugate">Corrugate (≥8°)</option>
                  <option value="longrun">Longrun/Tray (≥3°)</option>
                  <option value="membrane">Membrane (≥1.5°)</option>
                  <option value="metalTile">Metal Tile (≥12°)</option>
                  <option value="concreteTile">Concrete Tile (≥20°)</option>
                  <option value="clayTile">Clay Tile (≥25°)</option>
                  <option value="asphaltShingle">Asphalt Shingle (≥18°)</option>
                  <option value="slate">Slate (≥22°)</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm">Ridge Thickness (mm)</span>
                <input value={ridgeStr} onChange={(e) => setRidgeStr(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
              </label>
              <label className="block">
                <span className="text-sm">Seat Cut Depth (mm)</span>
                <input value={seatStr} onChange={(e) => setSeatStr(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
              </label>
              <label className="block">
                <span className="text-sm">Building Length (mm)</span>
                <input value={lengthStr} onChange={(e) => setLengthStr(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
              </label>
              <label className="block">
                <span className="text-sm">Rafter Spacing (mm)</span>
                <input value={spacingStr} onChange={(e) => setSpacingStr(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
              </label>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input type="checkbox" checked={includeOverhangArea} onChange={(e) => setIncludeOverhangArea(e.target.checked)} />
                <span className="text-sm">Include overhang in roof area</span>
              </label>
              <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-sm">Sheet W (m)</span>
                  <input value={sheetWm} onChange={(e)=> setSheetWm(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" step="0.1" />
                </label>
                <label className="block">
                  <span className="text-sm">Sheet H (m)</span>
                  <input value={sheetHm} onChange={(e)=> setSheetHm(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" step="0.1" />
                </label>
              </div>
            </div>
          </details>

          {warnings.length > 0 && (
            <div className="mt-3 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
              <ul className="list-disc pl-5 space-y-1">
                {warnings.map((w, i)=> (<li key={i}>{w}</li>))}
              </ul>
            </div>
          )}

          {solved && (
            <>
              <div className="bg-white rounded-md border p-3 mt-3">
                <h3 className="font-semibold mb-2 text-sm">Results</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Rise:</div><div className="font-semibold text-pink-700">{solved.rise} mm</div>
                  <div>Half-span:</div><div className="font-semibold text-pink-700">{solved.halfSpan} mm</div>
                  <div>Span:</div><div className="font-semibold text-pink-700">{solved.span} mm</div>
                  <div>Pitch:</div><div className="font-semibold text-pink-700">{solved.pitch}°</div>
                  <div>Common:</div><div className="font-semibold text-pink-700">{solved.common} mm</div>
                  <div>Common (to ridge face):</div><div className="font-semibold text-pink-700">{solved.commonAtRidge} mm</div>
                  <div>Overhang (slope):</div><div className="font-semibold text-pink-700">{solved.overhangSlope} mm</div>
                  <div>Total Rafter:</div><div className="font-semibold text-pink-700">{solved.total} mm</div>
                  <div>Plumb Cut:</div><div className="font-semibold text-pink-700">{solved.plumb}°</div>
                  <div>Birdsmouth Cut:</div><div className="font-semibold text-pink-700">{solved.birdsmouth}°</div>
                  <div>Seat Cut (horizontal):</div><div className="font-semibold text-pink-700">{solved.seatLength} mm</div>
                  <div>Roof Area (per side):</div><div className="font-semibold text-pink-700">{areaPerSideM2.toFixed(2)} m²</div>
                  <div>Roof Area (total):</div><div className="font-semibold text-pink-700">{areaTotalM2.toFixed(2)} m²</div>
                  <div>Sheets Needed (per side):</div><div className="font-semibold text-pink-700">{sheetsPerSide}</div>
                  <div>Sheets Needed (total):</div><div className="font-semibold text-pink-700">{sheetsTotal}</div>
                  <div>Rafter Count (per side):</div><div className="font-semibold text-pink-700">{solved.rafterCountPerSide}</div>
                </div>
              </div>

              {/* Summary with totals and costs */}
              <div className="bg-white rounded-md border p-3 mt-3">
                <h3 className="font-semibold mb-2 text-sm">Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {/* Derived lengths */}
                  {(() => {
                    const lengthMm = parseFloat(lengthStr) || 0;
                    const ridgeM = lengthMm / 1000;
                    const eavesM = (lengthMm * 2) / 1000; // both eaves
                    const bargeM = solved ? (2 * solved.total) / 1000 : 0; // both gables
                    const sheetPrice = settings.sheetCosts[cladding] ?? 0;
                    const gutterCost = eavesM * (settings.costGutterPerM ?? 0);
                    const fasciaCost = eavesM * (settings.costFasciaPerM ?? 0);
                    const ridgeCapCost = ridgeM * (settings.costRidgeCapPerM ?? 0);
                    const bargeCapCost = bargeM * (settings.costBargeCapPerM ?? 0);
                    const underlayCost = areaTotalM2 * (settings.costUnderlayPerM2 ?? 0);
                    const labourCost = areaTotalM2 * (settings.labourPerM2 ?? 0);
                    const sheetCostTotal = sheetPrice * sheetsTotal;
                    const subTotal = sheetCostTotal + underlayCost + gutterCost + fasciaCost + ridgeCapCost + bargeCapCost + labourCost;
                    const gst = subTotal * (settings.gstRate || 0);
                    const totalIncl = subTotal + gst;
                    return (
                      <>
                        <div>Ridge Length:</div><div className="font-semibold text-pink-700">{ridgeM.toFixed(2)} m</div>
                        <div>Gutter/Fascia (both eaves):</div><div className="font-semibold text-pink-700">{eavesM.toFixed(2)} m</div>
                        <div>Barge (both gables):</div><div className="font-semibold text-pink-700">{bargeM.toFixed(2)} m</div>

                        <div>Total Roof Area:</div><div className="font-semibold text-pink-700">{areaTotalM2.toFixed(2)} m²</div>
                        <div>Total Sheets:</div><div className="font-semibold text-pink-700">{sheetsTotal}</div>

                        <div>Sheet Cost per sheet:</div><div className="font-semibold text-pink-700">${sheetPrice}</div>
                        <div>Sheet Cost (total):</div><div className="font-semibold text-pink-700">${sheetCostTotal.toFixed(2)}</div>
                        <div>Underlay Cost:</div><div className="font-semibold text-pink-700">${underlayCost.toFixed(2)}</div>
                        <div>Gutter Cost:</div><div className="font-semibold text-pink-700">${gutterCost.toFixed(2)}</div>
                        <div>Fascia Cost:</div><div className="font-semibold text-pink-700">${fasciaCost.toFixed(2)}</div>
                        <div>Ridge Capping Cost:</div><div className="font-semibold text-pink-700">${ridgeCapCost.toFixed(2)}</div>
                        <div>Barge Capping Cost:</div><div className="font-semibold text-pink-700">${bargeCapCost.toFixed(2)}</div>
                        <div>Labour Cost:</div><div className="font-semibold text-pink-700">${labourCost.toFixed(2)}</div>

                        <div className="col-span-2 my-1 border-t"></div>
                        <div>Subtotal (excl. GST):</div><div className="font-semibold text-pink-700">${subTotal.toFixed(2)}</div>
                        <div>GST ({Math.round((settings.gstRate||0)*100)}%):</div><div className="font-semibold text-pink-700">${gst.toFixed(2)}</div>
                        <div>Total Incl. GST:</div><div className="font-semibold text-pink-700">${totalIncl.toFixed(2)}</div>
                      </>
                    );
                  })()}
                </div>
                <p className="text-xs text-slate-500 mt-2">Note: Costs include sheet/cladding, underlay, linear flashings (gutters/fascia, ridge, barge) and labour. Update prices in Settings to suit your project. Additional items like fixings, penetrations, and waste factors are not included.</p>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

