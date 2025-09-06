import React from 'react';
import { calcRoof } from '../lib/roof';
import RoofDiagram from '../components/RoofDiagram';

export default function Roof() {
  const [pitch, setPitch] = React.useState('22.5');
  const [span, setSpan] = React.useState('');
  const res = calcRoof(parseFloat(pitch) || 0, parseFloat(span) || 0);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Roof</h2>
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="w-full">
          <RoofDiagram />
        </div>
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm">Roof Pitch (°)</span>
              <input
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                type="number"
                step="0.1"
              />
            </label>
            <label className="block">
              <span className="text-sm">Building Span (mm)</span>
              <input
                value={span}
                onChange={(e) => setSpan(e.target.value)}
                className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                type="number"
              />
            </label>
          </div>
          <div className="bg-white rounded-md border p-3 mt-3">
            <h3 className="font-semibold mb-2 text-sm">Results</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Roof Rise:</div>
              <div className="font-semibold text-pink-700">{res.rise} mm</div>
              <div>Rafter Length (per side):</div>
              <div className="font-semibold text-pink-700">{res.rafter} mm</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
