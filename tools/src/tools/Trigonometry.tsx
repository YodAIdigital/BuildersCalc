import React from 'react';
import { solveRightTriangle } from '../lib/trig';
import RightTriangleDiagram from '../components/RightTriangleDiagram';

export default function Trigonometry() {
  const [a, setA] = React.useState<string>('');
  const [b, setB] = React.useState<string>('');
  const [c, setC] = React.useState<string>('');
  const [A, setAngA] = React.useState<string>('');
  const [B, setAngB] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  const result = React.useMemo(() => {
    try {
      setError('');
      const vals = { a: +a || undefined, b: +b || undefined, c: +c || undefined, A: +A || undefined, B: +B || undefined };
      const solved = solveRightTriangle(vals);
      return solved;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }, [a, b, c, A, B]);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Trigonometry</h2>
      <p className="text-sm text-slate-600">Enter exactly two values (at least one side).</p>
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="w-full">
          <RightTriangleDiagram />
        </div>
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm">Side A (Opposite)</span>
              <input value={a} onChange={(e) => setA(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
            </label>
            <label className="block">
              <span className="text-sm">Side B (Adjacent)</span>
              <input value={b} onChange={(e) => setB(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm">Hypotenuse</span>
              <input value={c} onChange={(e) => setC(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
            </label>
            <label className="block">
              <span className="text-sm">Angle 1 (°)</span>
              <input value={A} onChange={(e) => setAngA(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
            </label>
            <label className="block">
              <span className="text-sm">Angle 2 (°)</span>
              <input value={B} onChange={(e) => setAngB(e.target.value)} className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm" type="number" />
            </label>
          </div>
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
          <div className="bg-white rounded-md border p-3 mt-3">
            <h3 className="font-semibold mb-2 text-sm">Results</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Side A:</div>
              <div className="font-semibold text-pink-700">{result?.a ?? 0}</div>
              <div>Side B:</div>
              <div className="font-semibold text-pink-700">{result?.b ?? 0}</div>
              <div>Hypotenuse:</div>
              <div className="font-semibold text-pink-700">{result?.c ?? 0}</div>
              <div>Angle 1:</div>
              <div className="font-semibold text-pink-700">{result?.A ?? 0}°</div>
              <div>Angle 2:</div>
              <div className="font-semibold text-pink-700">{result?.B ?? 0}°</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

