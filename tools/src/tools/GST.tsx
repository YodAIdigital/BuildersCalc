import React from 'react';
import { solveGST, type GSTSource, formatCurrencyNZD } from '../lib/gst';
import { useSettings } from '../hooks/useSettings';
import StandardCalculator from '../components/StandardCalculator';

export default function GST() {
  const { settings } = useSettings();
  const rate = settings.gstRate ?? 0.15; // stored as decimal fraction

  const [exclStr, setExclStr] = React.useState('');
  const [inclStr, setInclStr] = React.useState('');
  const [gstStr, setGstStr] = React.useState('');
  const [lastEdited, setLastEdited] = React.useState<GSTSource>('excl');

  // Net GST (purchase vs sale) inputs — assumes amounts entered include GST
  const [purchaseInclStr, setPurchaseInclStr] = React.useState('');
  const [saleInclStr, setSaleInclStr] = React.useState('');

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

  const netOut = React.useMemo(() => {
    const r = rate;
    const denom = 1 + r;
    const pincl = parseFloat(purchaseInclStr) || 0;
    const sincl = parseFloat(saleInclStr) || 0;
    const pExcl = denom === 0 ? 0 : pincl / denom;
    const sExcl = denom === 0 ? 0 : sincl / denom;
    const pGST = pincl - pExcl; // reclaimable
    const sGST = sincl - sExcl; // output tax
    const net = sGST - pGST; // positive = pay, negative = refund
    return { purchaseGST: pGST, saleGST: sGST, netGST: net };
  }, [purchaseInclStr, saleInclStr, rate]);

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">GST Calculator</h2>
      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="w-full">
          <StandardCalculator className="mt-2" />
        </div>
        <div className="w-full">


          <div className="bg-white rounded-md border p-4 mt-4">
            <h3 className="font-semibold mb-2">Results</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end mb-3">
              <label className="block">
                <span className="text-sm">Total without GST</span>
                <input
                  value={exclStr}
                  onChange={(e) => { setExclStr(e.target.value); setLastEdited('excl'); }}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                  step="0.01"
                  min="0"
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
                />
              </label>
              <div className="sm:justify-self-end self-end">
                <button type="button" onClick={clearAll} className="rounded-md border px-3 py-2 text-sm hover:bg-slate-100">Clear all</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Without GST:</div><div className="font-semibold text-pink-700">{formatCurrencyNZD(out.excl)}</div>
              <div>GST:</div><div className="font-semibold text-pink-700">{formatCurrencyNZD(out.gst)}</div>
              <div>Total with GST:</div><div className="font-semibold text-pink-700">{formatCurrencyNZD(out.incl)}</div>
            </div>
          </div>

          <div className="bg-white rounded-md border p-4 mt-2">
            <h3 className="font-semibold mb-2">Purchase vs Sale — Net GST</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm">Purchase price (incl GST)</span>
                <input
                  value={purchaseInclStr}
                  onChange={(e) => setPurchaseInclStr(e.target.value)}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                  step="0.01"
                  min="0"
                />
              </label>
              <label className="block">
                <span className="text-sm">Sale price (incl GST)</span>
                <input
                  value={saleInclStr}
                  onChange={(e) => setSaleInclStr(e.target.value)}
                  className="mt-1 w-full rounded-md border p-2"
                  type="number"
                  step="0.01"
                  min="0"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm mt-3">
              <div>GST on purchase (reclaim):</div><div className="font-semibold text-pink-700">{formatCurrencyNZD(netOut.purchaseGST)}</div>
              <div>GST on sale:</div><div className="font-semibold text-pink-700">{formatCurrencyNZD(netOut.saleGST)}</div>
              <div className="font-semibold">{netOut.netGST >= 0 ? 'Net GST to pay:' : 'GST refund due:'}</div>
              <div className="font-bold">{formatCurrencyNZD(Math.abs(netOut.netGST))}</div>
            </div>
            <p className="text-xs text-slate-500 mt-2">Assumes entered amounts include GST at {(rate * 100).toFixed(2)}%.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
