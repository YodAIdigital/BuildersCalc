import React from 'react';
import { solveRightTriangle, round } from '../lib/trig';
import RightTriangleDiagram from '../components/RightTriangleDiagram';

export default function Trigonometry() {
  const [a, setA] = React.useState<string>('');
  const [b, setB] = React.useState<string>('');
  const [c, setC] = React.useState<string>('');
  const [A, setAngA] = React.useState<string>('');
  const [B, setAngB] = React.useState<string>('');
  const [error, setError] = React.useState<string>('');

  // Track which two fields were most recently edited by the user.
  type FieldKey = 'a' | 'b' | 'c' | 'A' | 'B';
  const [sources, setSources] = React.useState<FieldKey[]>([]);

  const updateSources = React.useCallback((key: FieldKey, value: string) => {
    setSources((prev) => {
      let next = prev.filter((k) => k !== key);
      const isValid = value !== '' && Number.isFinite(+value);
      if (isValid) next = [...next, key];
      if (next.length > 2) next = next.slice(next.length - 2); // keep last two edited
      return next;
    });
  }, []);

  const result = React.useMemo(() => {
    try {
      setError('');
      if (sources.length < 2) return null;

      const vals: any = {};
      for (const key of sources) {
        const s = key === 'a' ? a : key === 'b' ? b : key === 'c' ? c : key === 'A' ? A : B;
        if (s !== '' && Number.isFinite(+s)) {
          vals[key] = +s;
        }
      }
      if (Object.keys(vals).length < 2) return null;

      const solved = solveRightTriangle(vals);
      return solved;
    } catch (e: any) {
      setError(e.message);
      return null;
    }
  }, [a, b, c, A, B, sources]);

  const area = React.useMemo(() => {
    return result ? round(0.5 * result.a * result.b) : 0;
  }, [result]);

  // When a valid result is present, auto-populate non-source fields with computed values.
  // When fewer than two sources are present, clear computed fields to avoid stale values.
  React.useEffect(() => {
    if (!result) {
      if (!sources.includes('a') && a !== '') setA('');
      if (!sources.includes('b') && b !== '') setB('');
      if (!sources.includes('c') && c !== '') setC('');
      if (!sources.includes('A') && A !== '') setAngA('');
      if (!sources.includes('B') && B !== '') setAngB('');
      return;
    }

    const nextA = String(result.a);
    const nextB = String(result.b);
    const nextC = String(result.c);
    const nextAngA = String(result.A);
    const nextAngB = String(result.B);

    if (!sources.includes('a') && a !== nextA) setA(nextA);
    if (!sources.includes('b') && b !== nextB) setB(nextB);
    if (!sources.includes('c') && c !== nextC) setC(nextC);
    if (!sources.includes('A') && A !== nextAngA) setAngA(nextAngA);
    if (!sources.includes('B') && B !== nextAngB) setAngB(nextAngB);
  }, [result, sources, a, b, c, A, B]);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Trigonometry</h2>
      <p className="text-sm text-slate-600">Enter exactly two values (at least one side).</p>
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="w-full">
          <RightTriangleDiagram />
        </div>
        <div className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-sm">Side A (Opposite)</span>
              <input
                value={a}
                onChange={(e) => {
                  const v = e.target.value;
                  setA(v);
                  updateSources('a', v);
                }}
                className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                type="number"
              />
            </label>
            <label className="block">
              <span className="text-sm">Side B (Adjacent)</span>
              <input
                value={b}
                onChange={(e) => {
                  const v = e.target.value;
                  setB(v);
                  updateSources('b', v);
                }}
                className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                type="number"
              />
            </label>
            <label className="block">
              <span className="text-sm">Side C (Hypotenuse)</span>
              <input
                value={c}
                onChange={(e) => {
                  const v = e.target.value;
                  setC(v);
                  updateSources('c', v);
                }}
                className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                type="number"
              />
            </label>
            <label className="block">
              <span className="text-sm">Angle 1 (°)</span>
              <input
                value={A}
                onChange={(e) => {
                  const v = e.target.value;
                  setAngA(v);
                  updateSources('A', v);
                }}
                className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                type="number"
              />
            </label>
            <label className="block">
              <span className="text-sm">Angle 2 (°)</span>
              <input
                value={B}
                onChange={(e) => {
                  const v = e.target.value;
                  setAngB(v);
                  updateSources('B', v);
                }}
                className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm"
                type="number"
              />
            </label>
            <label className="block">
              <span className="text-sm">Area</span>
              <input
                value={area}
                readOnly
                className="mt-1 w-full rounded-md border px-2 py-1.5 text-sm bg-slate-50"
                type="number"
              />
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
              <div>Side C (Hypotenuse):</div>
              <div className="font-semibold text-pink-700">{result?.c ?? 0}</div>
              <div>Angle 1:</div>
              <div className="font-semibold text-pink-700">{result?.A ?? 0}°</div>
              <div>Angle 2:</div>
              <div className="font-semibold text-pink-700">{result?.B ?? 0}°</div>
              <div>Area:</div>
              <div className="font-semibold text-pink-700">{area}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
