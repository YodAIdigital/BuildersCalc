import React from 'react';
import { calcRoof } from '../lib/roof';

export default function Roof() {
  const [pitch, setPitch] = React.useState('22.5');
  const [span, setSpan] = React.useState('');
  const res = calcRoof(parseFloat(pitch) || 0, parseFloat(span) || 0);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Roof</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm">Roof Pitch (°)</span>
          <input value={pitch} onChange={(e) => setPitch(e.target.value)} className="mt-1 w-full rounded-md border p-2" type="number" step="0.1" />
        </label>
        <label className="block">
          <span className="text-sm">Building Span (mm)</span>
          <input value={span} onChange={(e) => setSpan(e.target.value)} className="mt-1 w-full rounded-md border p-2" type="number" />
        </label>
      </div>
      <div className="bg-white rounded-md border p-4">
        <h3 className="font-semibold mb-2">Results</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Roof Rise:</div>
          <div className="font-semibold text-pink-700">{res.rise} mm</div>
          <div>Rafter Length (per side):</div>
          <div className="font-semibold text-pink-700">{res.rafter} mm</div>
        </div>
      </div>
    </section>
  );
}

