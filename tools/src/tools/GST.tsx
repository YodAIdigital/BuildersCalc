import React from 'react';
import { solveGST, type GSTSource, formatCurrencyNZD } from '../lib/gst';
import { useSettings } from '../hooks/useSettings';

export default function GST() {
  const { settings, setSettings } = useSettings();
  const rate = settings.gstRate ?? 0.15; // stored as decimal fraction

  const [exclStr, setExclStr] = React.useState('');
  const [inclStr, setInclStr] = React.useState('');
  const [gstStr, setGstStr] = React.useState('');
  const [lastEdited, setLastEdited] = React.useState<GSTSource>('excl');

  function clearAll() {
    setExclStr('');
    setInclStr('');
    setGstStr('');
  }

  const parsed = {
    excl: parseFloat(exclStr) || 0,
    incl: parseFloat(inclStr) || 0,
    gst: parseFloat(gstStr) || 0,
  };

  const out = React.useMemo(() => {
    return solveGST({ source: lastEdited, rate, ...parsed });
  }, [parsed.excl, parsed.incl, parsed.gst, lastEdited, rate]);

  // Synchronize non-edited fields to computed values (2dp strings)
  React.useEffect(() => {
    const setIf = (field: GSTSource, setter: (s: string) => void, value: number) => {
      if (lastEdited !== field) setter(value === 0 ? '' : value.toFixed(2));
    };
    setIf('excl', setExclStr, out.excl);
    setIf('incl', setInclStr, out.incl);
    setIf('gst', setGstStr, out.gst);
  }, [out, lastEdited]);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">GST Calculator</h2>
      <p className="text-sm text-slate-600">Enter any one value to calculate the other two. GST rate is {(rate * 100).toFixed(2)}% (adjust in Settings).</p>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
        <label className="block">
          <span className="text-sm">Total without GST</span>
          <input
            value={exclStr}
            onChange={(e) => { setExclStr(e.target.value); setLastEdited('excl'); }}
            className="mt-1 w-full rounded-md border p-2"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 100.00"
          />
        </label>
        <label className="block">
          <span className="text-sm">GST amount</span>
          <input
            value={gstStr}
            onChange={(e) => { setGstStr(e.target.value); setLastEdited('gst'); }}
            className="mt-1 w-full rounded-md border p-2"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 15.00"
          />
        </label>
        <label className="block">
          <span className="text-sm">Total with GST</span>
          <input
            value={inclStr}
            onChange={(e) => { setInclStr(e.target.value); setLastEdited('incl'); }}
            className="mt-1 w-full rounded-md border p-2"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 115.00"
          />
        </label>
        <div className="sm:justify-self-end self-end">
          <button type="button" onClick={clearAll} className="rounded-md border px-3 py-2 text-sm hover:bg-slate-100">Clear all</button>
        </div>
      </div>

      <div className="bg-white rounded-md border p-4">
        <h3 className="font-semibold mb-2">Results</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Without GST:</div><div className="font-semibold text-pink-700">{formatCurrencyNZD(out.excl)}</div>
          <div>GST:</div><div className="font-semibold text-pink-700">{formatCurrencyNZD(out.gst)}</div>
          <div>Total with GST:</div><div className="font-semibold text-pink-700">{formatCurrencyNZD(out.incl)}</div>
        </div>
      </div>
    </section>
  );
}
