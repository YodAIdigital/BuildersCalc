import React from 'react';
import { calcStairs } from '../lib/stairs';
import StairsDiagram from '../components/StairsDiagram';
import { round } from '../lib/trig';

export default function Stairs() {
  // Editable fields (strings for inputs)
  const [totalRiseStr, setTotalRiseStr] = React.useState('');
  const [risersStr, setRisersStr] = React.useState('');
  const [treadsStr, setTreadsStr] = React.useState('');
  const [riserHeightStr, setRiserHeightStr] = React.useState('');
  const [goingStr, setGoingStr] = React.useState('');
  const [totalRunStr, setTotalRunStr] = React.useState('');
  const [angleStr, setAngleStr] = React.useState('');

  // Track which field the user last edited to resolve equations
  const [lastEdited, setLastEdited] = React.useState<
    'totalRise' | 'risers' | 'treads' | 'riserHeight' | 'going' | 'totalRun' | 'angle'
  >('totalRise');

  const parsed = {
    totalRise: parseFloat(totalRiseStr) || 0,
    risers: Math.max(0, Math.round(parseFloat(risersStr))) || 0,
    treads: Math.max(0, Math.round(parseFloat(treadsStr))) || 0,
    riserHeight: parseFloat(riserHeightStr) || 0,
    going: parseFloat(goingStr) || 0,
    totalRun: parseFloat(totalRunStr) || 0,
    angle: parseFloat(angleStr) || 0,
  };

  const out = React.useMemo(() => {
    let { totalRise, risers, treads, riserHeight, going, totalRun, angle } = parsed;

    const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

    // If we have a total rise, work out a compliant riser count/height by default.
    const solveRiseGroup = () => {
      if (totalRise <= 0) { risers = 0; treads = 0; riserHeight = 0; return; }

      // If user edited risers/treads/riserHeight/totalRise, respect that lastEdited field and derive the rest.
      if (lastEdited === 'risers' || lastEdited === 'treads') {
        risers = lastEdited === 'treads' ? Math.max(treads + 1, 2) : Math.max(risers, 2);
        riserHeight = totalRise / risers;
      } else if (lastEdited === 'riserHeight') {
        if (riserHeight > 0) {
          risers = Math.max(2, Math.round(totalRise / riserHeight));
          riserHeight = totalRise / risers;
        } else {
          // fallback to compliant default
          const approx = Math.round(totalRise / 180);
          const minR = Math.max(2, Math.ceil(totalRise / 190));
          const maxR = Math.max(minR, Math.floor(totalRise / 115));
          risers = clamp(approx, minR, maxR);
          riserHeight = totalRise / risers;
        }
      } else {
        // lastEdited is totalRise or anything else -> choose compliant default within 115-190mm
        const approx = Math.round(totalRise / 180);
        const minR = Math.max(2, Math.ceil(totalRise / 190));
        const maxR = Math.max(minR, Math.floor(totalRise / 115));
        risers = clamp(approx, minR, maxR);
        riserHeight = totalRise / risers;
      }

      treads = Math.max(risers - 1, 0);
    };

    const solveRunGroup = () => {
      if (treads <= 0 || totalRise <= 0) { totalRun = 0; going = 0; angle = 0; return; }

      const toRad = (d: number) => (d * Math.PI) / 180;
      const toDeg = (r: number) => (r * 180) / Math.PI;

      if (lastEdited === 'angle' && angle > 0) {
        totalRun = totalRise / Math.tan(toRad(angle));
        going = totalRun / treads;
      } else if (lastEdited === 'totalRun' && totalRun > 0) {
        going = totalRun / treads;
        angle = toDeg(Math.atan(totalRise / totalRun));
      } else if (lastEdited === 'going' && going > 0) {
        totalRun = going * treads;
        angle = toDeg(Math.atan(totalRise / totalRun));
      } else {
        // Compute a compliant default going using 2R+G and angle limits
        const minGoingByRule = Math.max(250, 550 - 2 * riserHeight);
        const maxGoingByRule = 700 - 2 * riserHeight; // can exceed 250 by a lot
        const idealGoing = 625 - 2 * riserHeight;
        let g = clamp(idealGoing, minGoingByRule, Math.max(minGoingByRule, maxGoingByRule));

        // Enforce angle <= 41° by increasing going if necessary
        const goingForAngle = totalRise / Math.tan(toRad(41)) / treads;
        g = Math.max(g, goingForAngle);

        going = g;
        totalRun = going * treads;
        angle = toDeg(Math.atan(totalRise / totalRun));
      }
    };

    solveRiseGroup();
    solveRunGroup();

    // Compliance checks
    const twoRPlusG = 2 * riserHeight + going;
    let compliant = true;
    let notes = 'NZBC D1/AS1 (Private Stairs): ';
    if (!(riserHeight >= 115 && riserHeight <= 190)) { compliant = false; notes += 'Riser height outside 115-190mm. '; }
    if (!(going >= 250)) { compliant = false; notes += 'Tread going less than 250mm. '; }
    if (!(twoRPlusG >= 550 && twoRPlusG <= 700)) { compliant = false; notes += `2R+G (${round(twoRPlusG, 0)}) outside 550-700mm. `; }
    if (!(angle <= 41)) { compliant = false; notes += 'Angle exceeds 41°. '; }

    return {
      totalRise: round(totalRise, 0),
      risers: Math.max(0, Math.round(risers)),
      treads: Math.max(0, Math.round(treads)),
      riserHeight: round(riserHeight, 0),
      going: round(going, 0),
      totalRun: round(totalRun, 0),
      angle: round(angle, 1),
      compliant,
      notes,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed.totalRise, parsed.risers, parsed.treads, parsed.riserHeight, parsed.going, parsed.totalRun, parsed.angle, lastEdited]);

  // Synchronize non-edited fields to computed output for a smooth UX
  React.useEffect(() => {
    const setIf = (field: string, setter: (s: string) => void, value: number | string) => {
      if (lastEdited !== field) setter(String(value ?? ''));
    };
    setIf('totalRise', setTotalRiseStr, out.totalRise);
    setIf('risers', setRisersStr, out.risers);
    setIf('treads', setTreadsStr, out.treads);
    setIf('riserHeight', setRiserHeightStr, out.riserHeight);
    setIf('going', setGoingStr, out.going);
    setIf('totalRun', setTotalRunStr, out.totalRun);
    setIf('angle', setAngleStr, out.angle);
  }, [out, lastEdited]);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Stairs</h2>
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="w-full">
          <StairsDiagram
            risers={out.risers}
            riserHeight={out.riserHeight}
            going={out.going}
            totalRise={out.totalRise}
            totalRun={out.totalRun}
            angle={out.angle}
          />
        </div>
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm">Total Rise (mm)</span>
              <input value={totalRiseStr} onChange={(e) => { setTotalRiseStr(e.target.value); setLastEdited('totalRise'); }} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
            </label>
            <label className="block">
              <span className="text-sm">Risers (count)</span>
              <input value={risersStr} onChange={(e) => { setRisersStr(e.target.value); setLastEdited('risers'); }} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" step="1" />
            </label>
            <label className="block">
              <span className="text-sm">Treads (count)</span>
              <input value={treadsStr} onChange={(e) => { setTreadsStr(e.target.value); setLastEdited('treads'); }} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" step="1" />
            </label>
            <label className="block">
              <span className="text-sm">Riser Height (mm)</span>
              <input value={riserHeightStr} onChange={(e) => { setRiserHeightStr(e.target.value); setLastEdited('riserHeight'); }} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
            </label>
            <label className="block">
              <span className="text-sm">Tread Going (mm)</span>
              <input value={goingStr} onChange={(e) => { setGoingStr(e.target.value); setLastEdited('going'); }} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
            </label>
            <label className="block">
              <span className="text-sm">Total Run (mm)</span>
              <input value={totalRunStr} onChange={(e) => { setTotalRunStr(e.target.value); setLastEdited('totalRun'); }} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
            </label>
            <label className="block">
              <span className="text-sm">Stair Angle (°)</span>
              <input value={angleStr} onChange={(e) => { setAngleStr(e.target.value); setLastEdited('angle'); }} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" step="0.1" />
            </label>
          </div>
          <div className="bg-white rounded-md border p-3 mt-3">
            <h3 className="font-semibold mb-2 text-sm">Results</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Number of Risers:</div><div className="font-semibold text-pink-700">{out.risers}</div>
              <div>Riser Height:</div><div className="font-semibold text-pink-700">{out.riserHeight} mm</div>
              <div>Number of Treads:</div><div className="font-semibold text-pink-700">{out.treads}</div>
              <div>Tread Going:</div><div className="font-semibold text-pink-700">{out.going} mm</div>
              <div>Total Run:</div><div className="font-semibold text-pink-700">{out.totalRun} mm</div>
              <div>Stair Angle:</div><div className="font-semibold text-pink-700">{out.angle}°</div>
            </div>
            <p className={`mt-3 text-sm ${out.compliant ? 'text-green-700' : 'text-red-700'}`}>{out.compliant ? '✓ Compliant' : `✗ ${out.notes}`}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

