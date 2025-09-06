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

export default function UnitConverter() {
  const [mm, setMm] = React.useState('');
  const [m, setM] = React.useState('');
  const [inch, setInch] = React.useState('');
  const [ft, setFt] = React.useState('');
  const [diaMm, setDiaMm] = React.useState('');

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

  const inchFraction = decimalToFractionInches(parseFloat(inch) || 0);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">Unit Converter</h2>
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
    </section>
  );
}
