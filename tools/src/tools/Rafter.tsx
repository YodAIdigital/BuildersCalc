import React from 'react';
import { calcRafter } from '../lib/rafter';
import RafterDiagram from '../components/RafterDiagram';

export default function Rafter() {
  const [width, setWidth] = React.useState('');
  const [pitch, setPitch] = React.useState('');
  const [overhang, setOverhang] = React.useState('');
  const r = calcRafter(parseFloat(width) || 0, parseFloat(pitch) || 0, parseFloat(overhang) || 0);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Rafter</h2>
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="w-full">
          <RafterDiagram />
        </div>
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-sm">Building Width/Span (mm)</span>
              <input
                value={width}
                onChange={(e) => setWidth(e.target.value)}
                className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                type="number"
              />
            </label>
            <label className="block">
              <span className="text-sm">Roof Pitch (°)</span>
              <input
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                type="number"
              />
            </label>
            <label className="block">
              <span className="text-sm">Eave Overhang (mm)</span>
              <input
                value={overhang}
                onChange={(e) => setOverhang(e.target.value)}
                className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                type="number"
              />
            </label>
          </div>
          <div className="bg-white rounded-md border p-3 mt-3">
            <h3 className="font-semibold mb-2 text-sm">Results</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Common Rafter Length:</div>
              <div className="font-semibold text-pink-700">{r.common} mm</div>
              <div>Total Rafter Length:</div>
              <div className="font-semibold text-pink-700">{r.total} mm</div>
              <div>Plumb Cut Angle:</div>
              <div className="font-semibold text-pink-700">{r.plumb}°</div>
              <div>Birdsmouth Cut Angle:</div>
              <div className="font-semibold text-pink-700">{r.birdsmouth}°</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
