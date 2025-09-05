import React from 'react';
import { calcStairs } from '../lib/stairs';

export default function Stairs() {
  const [rise, setRise] = React.useState('');
  const r = calcStairs(parseFloat(rise) || 0);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Stairs</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm">Total Rise (mm)</span>
          <input value={rise} onChange={(e) => setRise(e.target.value)} className="mt-1 w-full rounded-md border p-2" type="number" />
        </label>
      </div>
      <div className="bg-white rounded-md border p-4">
        <h3 className="font-semibold mb-2">Results</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Number of Risers:</div><div className="font-semibold text-pink-700">{r.risers}</div>
          <div>Riser Height:</div><div className="font-semibold text-pink-700">{r.riserHeight} mm</div>
          <div>Number of Treads:</div><div className="font-semibold text-pink-700">{r.treads}</div>
          <div>Tread Going:</div><div className="font-semibold text-pink-700">{r.going} mm</div>
          <div>Total Run:</div><div className="font-semibold text-pink-700">{r.totalRun} mm</div>
          <div>Stair Angle:</div><div className="font-semibold text-pink-700">{r.angle}°</div>
        </div>
        <p className={`mt-3 text-sm ${r.compliant ? 'text-green-700' : 'text-red-700'}`}>{r.compliant ? '✓ Compliant' : `✗ ${r.notes}`}</p>
      </div>
    </section>
  );
}

