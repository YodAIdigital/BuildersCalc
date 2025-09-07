import React from 'react';
import { useSettings } from '../hooks/useSettings';
import Cabin3D from '../components/Cabin3D';
import { computeCabin, type CabinConfig } from '../lib/cabin';
import { bomToCSV } from '../lib/csv';
import { pitchWarnings } from '../lib/roofPitch';

export default function Cabin() {
  const { settings } = useSettings();

  // Defaults: 4 x 2 x 2.4 m
  const [length, setLength] = React.useState('4000');
  const [width, setWidth] = React.useState('2000');
  const [height, setHeight] = React.useState('2400');

  const [roofType, setRoofType] = React.useState<'flat' | 'mono' | 'dual'>('dual');
  const [pitchDeg, setPitchDeg] = React.useState('20');
  const [overhang, setOverhang] = React.useState('300');
  const [includeOverhang, setIncludeOverhang] = React.useState(true);

  const [rafterSpacing, setRafterSpacing] = React.useState('600');
  const [studSpacing, setStudSpacing] = React.useState('600');
  const [nogSpacing, setNogSpacing] = React.useState('800');
  const [joistSpacing, setJoistSpacing] = React.useState('600');
  const [bearerSpacing, setBearerSpacing] = React.useState('1800');
  const [pileSpacing, setPileSpacing] = React.useState('1500');

  const [windows, setWindows] = React.useState<{ count: number; width: number; height: number }[]>([
    { count: 1, width: 1000, height: 2000 },
  ]);
  const [doors, setDoors] = React.useState<{ count: number; width: number; height: number }[]>([
    { count: 1, width: 860, height: 1980 },
  ]);

  const [exteriorCladding, setExteriorCladding] = React.useState(
    'corrugate'
  );
  const [lining, setLining] = React.useState<'none' | 'ply' | 'gib'>('none');
  const [insulated, setInsulated] = React.useState(false);

  const [sheetWm, setSheetWm] = React.useState('1.2');
  const [sheetHm, setSheetHm] = React.useState('2.4');

  const config: CabinConfig = React.useMemo(
    () => ({
      length: parseFloat(length) || 0,
      width: parseFloat(width) || 0,
      height: parseFloat(height) || 0,
      roofType,
      pitchDeg: roofType === 'flat' ? 0 : parseFloat(pitchDeg) || 0,
      overhang: parseFloat(overhang) || 0,
      includeOverhangInArea: includeOverhang,
      rafterSpacing: parseFloat(rafterSpacing) || 600,
      studSpacing: parseFloat(studSpacing) || 600,
      nogSpacing: parseFloat(nogSpacing) || 800,
      joistSpacing: parseFloat(joistSpacing) || 600,
      bearerSpacing: parseFloat(bearerSpacing) || 1800,
      pileSpacing: parseFloat(pileSpacing) || 1500,
      openings: { windows, doors },
      exteriorCladding: exteriorCladding as any,
      lining,
      insulated,
      sheetSizeM: { w: parseFloat(sheetWm) || 1.2, h: parseFloat(sheetHm) || 2.4 },
    }),
    [
      length,
      width,
      height,
      roofType,
      pitchDeg,
      overhang,
      includeOverhang,
      rafterSpacing,
      studSpacing,
      nogSpacing,
      joistSpacing,
      bearerSpacing,
      pileSpacing,
      windows,
      doors,
      exteriorCladding,
      lining,
      insulated,
      sheetWm,
      sheetHm,
    ]
  );

  const result = React.useMemo(() => computeCabin(config, settings), [config, settings]);

  // Derived warnings
  const rw = React.useMemo(() => pitchWarnings({ pitch: config.roofType === 'flat' ? 0 : config.pitchDeg, cladding: 'longrun' }), [config]);

  // Windows/doors handlers
  function updWindow(i: number, key: 'count' | 'width' | 'height', v: string) {
    setWindows((arr) => arr.map((it, idx) => (idx === i ? { ...it, [key]: parseFloat(v) || 0 } : it)));
  }
  function updDoor(i: number, key: 'count' | 'width' | 'height', v: string) {
    setDoors((arr) => arr.map((it, idx) => (idx === i ? { ...it, [key]: parseFloat(v) || 0 } : it)));
  }

  // CSV download
  function downloadCSV() {
    const csv = bomToCSV(result.items);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cabin-bom.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Email modal state
  const [emailOpen, setEmailOpen] = React.useState(false);
  const [emailTo, setEmailTo] = React.useState('');
  const cabinRef = React.useRef<{ snapshot: () => string | null } | null>(null);
  function handleReady(api: { snapshot: () => string | null }) {
    cabinRef.current = api;
  }
  async function sendEmail() {
    try {
      const snapshot = cabinRef.current?.snapshot?.() || null;
      const payload: any = {
        to: emailTo,
        subject: 'Cabin quote',
        html: renderEmailHTML(config, result),
        attachments: snapshot
          ? [
              {
                filename: 'cabin.png',
                contentBase64: snapshot.replace(/^data:image\/png;base64,/, ''),
              },
            ]
          : undefined,
      };
      const res = await fetch('/api/email-cabin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to email');
      setEmailOpen(false);
      alert('Email sent');
    } catch (e) {
      alert('Failed to send email');
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Cabin</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* 3D */}
        <div className="rounded-md border bg-white">
          <div className="p-2 border-b text-sm font-semibold">3D Preview</div>
          <div className="h-[360px]">
            <Cabin3D
              length={parseFloat(length) || 0}
              width={parseFloat(width) || 0}
              height={parseFloat(height) || 0}
              roofType={roofType}
              pitchDeg={roofType === 'flat' ? 0 : parseFloat(pitchDeg) || 0}
              overhang={parseFloat(overhang) || 0}
              onReady={handleReady}
            />
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LabeledInput label="Length (mm)" value={length} onChange={setLength} />
            <LabeledInput label="Width (mm)" value={width} onChange={setWidth} />
            <LabeledInput label="Height (mm)" value={height} onChange={setHeight} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-sm">Roof Type</span>
              <select
                value={roofType}
                onChange={(e) => setRoofType(e.target.value as any)}
                className="mt-1 w-full rounded-md border p-2"
              >
                <option value="flat">Flat</option>
                <option value="mono">Mono Pitch</option>
                <option value="dual">Dual Pitch</option>
              </select>
            </label>
            <LabeledInput
              label="Pitch (°)"
              value={roofType === 'flat' ? '0' : pitchDeg}
              onChange={setPitchDeg}
              disabled={roofType === 'flat'}
            />
            <LabeledInput label="Overhang (mm)" value={overhang} onChange={setOverhang} />
            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={includeOverhang} onChange={(e) => setIncludeOverhang(e.target.checked)} />
              <span className="text-sm">Include overhang in roof area</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LabeledInput label="Rafter spacing (mm)" value={rafterSpacing} onChange={setRafterSpacing} />
            <LabeledInput label="Stud spacing (mm)" value={studSpacing} onChange={setStudSpacing} />
            <LabeledInput label="Nog spacing (mm)" value={nogSpacing} onChange={setNogSpacing} />
            <LabeledInput label="Joist spacing (mm)" value={joistSpacing} onChange={setJoistSpacing} />
            <LabeledInput label="Bearer spacing (mm)" value={bearerSpacing} onChange={setBearerSpacing} />
            <LabeledInput label="Pile spacing (mm)" value={pileSpacing} onChange={setPileSpacing} />
          </div>

          <div className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm">Openings</span>
              <span className="text-xs text-slate-500">Doors default 1980 x 860 mm; Windows 1000 x 2000 mm</span>
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="text-sm font-medium">Windows</div>
                <div className="space-y-2 mt-1">
                  {windows.map((w, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 items-end">
                      <input className="rounded-md border p-2" type="number" value={w.count} onChange={(e) => updWindow(i, 'count', e.target.value)} placeholder="Count" />
                      <input className="rounded-md border p-2" type="number" value={w.width} onChange={(e) => updWindow(i, 'width', e.target.value)} placeholder="Width" />
                      <input className="rounded-md border p-2" type="number" value={w.height} onChange={(e) => updWindow(i, 'height', e.target.value)} placeholder="Height" />
                    </div>
                  ))}
                  <button className="text-pink-700 text-sm" onClick={() => setWindows((a) => [...a, { count: 1, width: 1000, height: 2000 }])}>+ Add Window</button>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium">Doors</div>
                <div className="space-y-2 mt-1">
                  {doors.map((d, i) => (
                    <div key={i} className="grid grid-cols-3 gap-2 items-end">
                      <input className="rounded-md border p-2" type="number" value={d.count} onChange={(e) => updDoor(i, 'count', e.target.value)} placeholder="Count" />
                      <input className="rounded-md border p-2" type="number" value={d.width} onChange={(e) => updDoor(i, 'width', e.target.value)} placeholder="Width" />
                      <input className="rounded-md border p-2" type="number" value={d.height} onChange={(e) => updDoor(i, 'height', e.target.value)} placeholder="Height" />
                    </div>
                  ))}
                  <button className="text-pink-700 text-sm" onClick={() => setDoors((a) => [...a, { count: 1, width: 860, height: 1980 }])}>+ Add Door</button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="block">
              <span className="text-sm">Exterior cladding</span>
              <select value={exteriorCladding} onChange={(e) => setExteriorCladding(e.target.value)} className="mt-1 w-full rounded-md border p-2">
                <option value="ply">Ply</option>
                <option value="corrugate">Corrugate</option>
                <option value="tray">Tray (longrun)</option>
                <option value="five rib">5 rib</option>
                <option value="PIR">PIR</option>
                <option value="cedar weatherboard">Cedar weatherboard</option>
                <option value="standard weatherboard">Standard weatherboard</option>
                <option value="membrane">Membrane</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm">Internal lining</span>
              <select value={lining} onChange={(e) => setLining(e.target.value as any)} className="mt-1 w-full rounded-md border p-2">
                <option value="none">None</option>
                <option value="ply">Ply</option>
                <option value="gib">GIB</option>
              </select>
            </label>
            {lining !== 'none' && (
              <label className="inline-flex items-center gap-2 self-end">
                <input type="checkbox" checked={insulated} onChange={(e) => setInsulated(e.target.checked)} />
                <span className="text-sm">Insulate walls + ceiling</span>
              </label>
            )}
          </div>

          <details className="rounded-md border p-3">
            <summary className="cursor-pointer text-sm font-semibold">Sheet size (for sheet goods)</summary>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <LabeledInput label="Sheet W (m)" value={sheetWm} onChange={setSheetWm} />
              <LabeledInput label="Sheet H (m)" value={sheetHm} onChange={setSheetHm} />
            </div>
          </details>

          {/* Warnings */}
          {result.warnings.length > 0 && (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-900">
              <ul className="list-disc pl-5 space-y-1">
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="rounded-md border bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Materials & Costs</h3>
          <div className="flex items-center gap-2">
            <button className="rounded-md border px-3 py-1.5 text-sm" onClick={downloadCSV}>Export CSV</button>
            <button className="rounded-md border px-3 py-1.5 text-sm" onClick={() => window.print()}>Print</button>
            <button className="rounded-md border px-3 py-1.5 text-sm" onClick={() => setEmailOpen(true)}>Email</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Category</th>
                <th className="p-2">Item</th>
                <th className="p-2">Unit</th>
                <th className="p-2 text-right">Qty</th>
                <th className="p-2 text-right">Rate</th>
                <th className="p-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((it, i) => (
                <tr key={i} className="odd:bg-slate-50">
                  <td className="p-2">{it.category}</td>
                  <td className="p-2">{it.name}</td>
                  <td className="p-2">{it.unit}</td>
                  <td className="p-2 text-right">{it.qty}</td>
                  <td className="p-2 text-right">${it.rate}</td>
                  <td className="p-2 text-right font-medium">${it.subtotal}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td className="p-2" colSpan={4}></td>
                <td className="p-2 text-right">Subtotal (ex GST)</td>
                <td className="p-2 text-right font-semibold">${result.totals.exGst}</td>
              </tr>
              <tr>
                <td className="p-2" colSpan={4}></td>
                <td className="p-2 text-right">GST</td>
                <td className="p-2 text-right font-semibold">${result.totals.gst}</td>
              </tr>
              <tr>
                <td className="p-2" colSpan={4}></td>
                <td className="p-2 text-right">Total (incl GST)</td>
                <td className="p-2 text-right font-bold">${result.totals.inclGst}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Email modal */}
      {emailOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-md w-full max-w-md">
            <div className="p-3 border-b font-semibold">Email quote</div>
            <div className="p-3 space-y-3">
              <label className="block">
                <span className="text-sm">Recipient email</span>
                <input className="mt-1 w-full rounded-md border p-2" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="name@example.com" />
              </label>
              <p className="text-xs text-slate-500">We’ll include a 3D snapshot and a breakdown of materials, costs, and warnings.</p>
            </div>
            <div className="p-3 border-t flex justify-end gap-2">
              <button className="rounded-md border px-3 py-1.5 text-sm" onClick={() => setEmailOpen(false)}>Cancel</button>
              <button className="rounded-md bg-pink-700 text-white px-3 py-1.5 text-sm" onClick={sendEmail}>Send</button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-slate-500">
        Guidance only. Verify against NZS 3604 and manufacturer specifications.
      </p>
    </section>
  );
}

function LabeledInput({ label, value, onChange, disabled }: { label: string; value: string; onChange: (v: string) => void; disabled?: boolean }) {
  return (
    <label className="block">
      <span className="text-sm">{label}</span>
      <input className="mt-1 w-full rounded-md border p-2" type="number" value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} />
    </label>
  );
}

function renderEmailHTML(config: CabinConfig, result: ReturnType<typeof computeCabin>) {
  const rows = result.items
    .map(
      (it) =>
        `<tr><td>${escapeHtml(it.category)}</td><td>${escapeHtml(it.name)}</td><td>${it.unit}</td><td style="text-align:right">${it.qty}</td><td style="text-align:right">$${it.rate}</td><td style="text-align:right">$${it.subtotal}</td></tr>`
    )
    .join('');
  const warns = result.warnings.map((w) => `<li>${escapeHtml(w)}</li>`).join('');
  return `
    <div style="font-family:Inter,system-ui,Arial,sans-serif;font-size:14px;line-height:1.4;color:#111">
      <h2 style="margin:0 0 8px 0">Cabin Quote</h2>
      <p style="margin:0 0 8px 0">${config.length} x ${config.width} x ${config.height} mm, roof: ${config.roofType}${config.roofType!=='flat' ? ` @ ${config.pitchDeg}°` : ''}</p>
      ${result.warnings.length ? `<div style="background:#fff7d1;border:1px solid #f6e05e;padding:8px;margin:8px 0"><ul style="margin:0;padding-left:18px">${warns}</ul></div>` : ''}
      <table style="width:100%;border-collapse:collapse" cellspacing="0" cellpadding="0">
        <thead>
          <tr>
            <th style="text-align:left;border-bottom:1px solid #ddd;padding:4px">Category</th>
            <th style="text-align:left;border-bottom:1px solid #ddd;padding:4px">Item</th>
            <th style="text-align:left;border-bottom:1px solid #ddd;padding:4px">Unit</th>
            <th style="text-align:right;border-bottom:1px solid #ddd;padding:4px">Qty</th>
            <th style="text-align:right;border-bottom:1px solid #ddd;padding:4px">Rate</th>
            <th style="text-align:right;border-bottom:1px solid #ddd;padding:4px">Subtotal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr><td colspan="4"></td><td style="text-align:right;padding:4px">Subtotal</td><td style="text-align:right;padding:4px">$${result.totals.exGst}</td></tr>
          <tr><td colspan="4"></td><td style="text-align:right;padding:4px">GST</td><td style="text-align:right;padding:4px">$${result.totals.gst}</td></tr>
          <tr><td colspan="4"></td><td style="text-align:right;padding:4px;font-weight:bold">Total</td><td style="text-align:right;padding:4px;font-weight:bold">$${result.totals.inclGst}</td></tr>
        </tfoot>
      </table>
      <p style="margin-top:12px;color:#666;font-size:12px">Guidance only. Verify against NZS 3604 and manufacturer specifications.</p>
    </div>
  `;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
