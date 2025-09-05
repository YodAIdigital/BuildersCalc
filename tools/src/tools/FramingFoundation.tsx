import React from 'react';
import { calcFraming, type Wall, type Opening } from '../lib/framing';
import { useSettings } from '../hooks/useSettings';

export default function FramingFoundation() {
  const { settings, setSettings } = useSettings();
  const [application, setApplication] = React.useState<'floor' | 'wall'>('floor');
  const [length, setLength] = React.useState('4800');
  const [width, setWidth] = React.useState('3600');
  const [height, setHeight] = React.useState('2400');
  const [spacing, setSpacing] = React.useState('600');
  const [includePaint, setIncludePaint] = React.useState(false);
  const [sheetType, setSheetType] = React.useState<keyof typeof settings.sheetCosts>('treatedPly');
  const [walls, setWalls] = React.useState<Wall[]>([]);

  const costs = React.useMemo(() => ({
    timberPerM: settings.timberPerM,
    pilePerEach: settings.pilePerEach,
    sheetPerEach: settings.sheetCosts[sheetType] ?? 0,
    paintPerM2: settings.paintPerM2,
    windowPerM2: settings.windowPerM2,
    doorPerUnit: settings.doorPerUnit,
    sheetSizeM: { w: 2.4, h: 1.2 }
  }), [settings, sheetType]);

  const result = React.useMemo(() => (
    calcFraming({
      application,
      length: parseFloat(length) || 0,
      width: parseFloat(width) || 0,
      height: parseFloat(height) || 0,
      spacing: parseFloat(spacing) || 600,
      walls,
      includePaint,
      costs
    })
  ), [application, length, width, height, spacing, walls, includePaint, costs]);

  function addWall() { setWalls((w) => [...w, { length: 0, openings: [] }]); }
  function removeWall(idx: number) { setWalls((w) => w.filter((_, i) => i !== idx)); }
  function updateWallLength(idx: number, v: string) { setWalls((w) => w.map((it,i) => i===idx?{...it, length: parseFloat(v)||0}:it)); }
  function addOpening(wallIdx: number) { setWalls((w) => w.map((it,i)=> i===wallIdx?{...it, openings:[...it.openings, { type: 'Window', width: 0, height: 0 } as Opening]}:it)); }
  function removeOpening(wallIdx: number, opIdx: number) { setWalls((w)=> w.map((it,i)=> i===wallIdx?{...it, openings: it.openings.filter((_,j)=>j!==opIdx)}:it)); }
  function updateOpening(wallIdx: number, opIdx: number, key: 'type'|'width'|'height', v: string) {
    setWalls((w)=> w.map((it,i)=> {
      if(i!==wallIdx) return it; const ops=[...it.openings]; const op={...ops[opIdx]} as any; op[key]= key==='type'? v : parseFloat(v)||0; ops[opIdx]=op; return {...it, openings: ops};
    }));
  }

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Framing &amp; Foundation</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <label className="block">
          <span className="text-sm">Application</span>
          <select value={application} onChange={(e)=> setApplication(e.target.value as any)} className="mt-1 w-full rounded-md border p-2">
            <option value="floor">Floor</option>
            <option value="wall">Wall</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm">Member Spacing (mm)</span>
          <select value={spacing} onChange={(e)=> setSpacing(e.target.value)} className="mt-1 w-full rounded-md border p-2">
            <option value="600">600</option>
            <option value="450">450</option>
            <option value="400">400</option>
            <option value="900">900</option>
          </select>
        </label>
        <label className="block">
          <span className="text-sm">Sheet Material</span>
          <select value={sheetType} onChange={(e)=> setSheetType(e.target.value as any)} className="mt-1 w-full rounded-md border p-2">
            {Object.keys(settings.sheetCosts).map((k)=> (<option key={k} value={k}>{k}</option>))}
          </select>
        </label>
      </div>

      {application === 'wall' ? (
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm">Wall Height (mm)</span>
            <input value={height} onChange={(e)=> setHeight(e.target.value)} className="mt-1 w-full rounded-md border p-2" type="number" />
          </label>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Walls</h3>
            <button onClick={addWall} className="text-pink-700 hover:underline text-sm">+ Add Wall</button>
          </div>
          <div className="space-y-3">
            {walls.map((w, i) => (
              <div key={i} className="rounded-md border bg-white p-3">
                <div className="flex items-end gap-3">
                  <label className="block flex-1">
                    <span className="text-sm">Wall Length (mm)</span>
                    <input value={w.length} onChange={(e)=> updateWallLength(i, e.target.value)} className="mt-1 w-full rounded-md border p-2" type="number" />
                  </label>
                  <button onClick={()=> removeWall(i)} className="text-sm text-red-600">Remove</button>
                </div>
                <div className="mt-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Openings</span>
                    <button onClick={()=> addOpening(i)} className="text-pink-700 hover:underline text-sm">+ Add Opening</button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {w.openings.map((op, j) => (
                      <div key={j} className="grid grid-cols-8 gap-2 items-end">
                        <select value={op.type} onChange={(e)=> updateOpening(i, j, 'type', e.target.value)} className="col-span-2 rounded-md border p-2">
                          <option>Window</option>
                          <option>Door</option>
                        </select>
                        <input value={op.width} onChange={(e)=> updateOpening(i, j, 'width', e.target.value)} className="col-span-3 rounded-md border p-2" placeholder="Width" type="number" />
                        <input value={op.height} onChange={(e)=> updateOpening(i, j, 'height', e.target.value)} className="col-span-3 rounded-md border p-2" placeholder="Height" type="number" />
                        <button onClick={()=> removeOpening(i, j)} className="col-span-8 sm:col-span-1 justify-self-end text-sm text-red-600">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <label className="inline-flex items-center gap-2">
            <input type="checkbox" checked={includePaint} onChange={(e)=> setIncludePaint(e.target.checked)} />
            <span>Include Paint Cost</span>
          </label>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-sm">Length (mm)</span>
            <input value={length} onChange={(e)=> setLength(e.target.value)} className="mt-1 w-full rounded-md border p-2" type="number" />
          </label>
          <label className="block">
            <span className="text-sm">Width (mm)</span>
            <input value={width} onChange={(e)=> setWidth(e.target.value)} className="mt-1 w-full rounded-md border p-2" type="number" />
          </label>
        </div>
      )}

      <div className="rounded-md border bg-white p-4">
        <h3 className="font-semibold mb-2">Quantities & Cost Estimate</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Total Area:</div><div className="font-semibold text-pink-700">{result.totalAreaM2} m²</div>
          {application === 'wall' && <><div>Subtracted Area:</div><div className="font-semibold text-pink-700">{result.openingsAreaM2} m²</div></>}
          <div>Net Sheeting Area:</div><div className="font-semibold text-pink-700">{result.netSheetingAreaM2} m²</div>
          <div>Sheets Needed:</div><div className="font-semibold text-pink-700">{result.sheets}</div>
          <div>Members:</div><div className="font-semibold text-pink-700">{result.totalMembers}</div>
          {application === 'floor' && <><div>Piles (est):</div><div className="font-semibold text-pink-700">{result.pileCount}</div></>}
          <div className="col-span-2 my-2 border-t"></div>
          <div>Timber Cost:</div><div className="font-semibold text-pink-700">${result.costs.timberCost}</div>
          {application === 'wall' && result.costs.openingFramingCost > 0 && <><div>Opening Framing:</div><div className="font-semibold text-pink-700">${result.costs.openingFramingCost}</div></>}
          <div>Sheet Cost:</div><div className="font-semibold text-pink-700">${result.costs.sheetCost}</div>
          {application === 'floor' && <><div>Piles Cost:</div><div className="font-semibold text-pink-700">${result.costs.pileCost}</div></>}
          {result.costs.windowCost > 0 && <><div>Window Cost:</div><div className="font-semibold text-pink-700">${result.costs.windowCost}</div></>}
          {result.costs.doorCost > 0 && <><div>Door Cost:</div><div className="font-semibold text-pink-700">${result.costs.doorCost}</div></>}
          {application === 'wall' && includePaint && <><div>Paint Cost:</div><div className="font-semibold text-pink-700">${result.costs.paintCost}</div></>}
          <div className="col-span-2 my-2 border-t"></div>
          <div className="font-semibold">Total Estimated Cost:</div><div className="font-bold">${result.costs.grandTotal}</div>
        </div>
      </div>

      <details className="rounded-md border bg-white p-4">
        <summary className="cursor-pointer font-semibold">Settings</summary>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <label className="block"><span>Timber ($/m)</span><input className="mt-1 w-full rounded-md border p-2" type="number" step="0.01" value={settings.timberPerM} onChange={(e)=> setSettings({ timberPerM: parseFloat(e.target.value)||0 })} /></label>
          <label className="block"><span>Piles ($/each)</span><input className="mt-1 w-full rounded-md border p-2" type="number" step="0.01" value={settings.pilePerEach} onChange={(e)=> setSettings({ pilePerEach: parseFloat(e.target.value)||0 })} /></label>
          <label className="block"><span>Paint ($/m²)</span><input className="mt-1 w-full rounded-md border p-2" type="number" step="0.01" value={settings.paintPerM2} onChange={(e)=> setSettings({ paintPerM2: parseFloat(e.target.value)||0 })} /></label>
          <label className="block"><span>Window ($/m²)</span><input className="mt-1 w-full rounded-md border p-2" type="number" step="0.01" value={settings.windowPerM2} onChange={(e)=> setSettings({ windowPerM2: parseFloat(e.target.value)||0 })} /></label>
          <label className="block"><span>Door ($/unit)</span><input className="mt-1 w-full rounded-md border p-2" type="number" step="0.01" value={settings.doorPerUnit} onChange={(e)=> setSettings({ doorPerUnit: parseFloat(e.target.value)||0 })} /></label>
          <div className="sm:col-span-2">
            <span className="block font-medium mb-1">Sheet Costs ($/sheet)</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(settings.sheetCosts).map(([k, v]) => (
                <label key={k} className="block text-xs">
                  <span className="capitalize">{k}</span>
                  <input className="mt-1 w-full rounded-md border p-2" type="number" step="0.01" value={v} onChange={(e)=> setSettings({ sheetCosts: { ...settings.sheetCosts, [k]: parseFloat(e.target.value)||0 } })} />
                </label>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">Settings save locally and sync to server when online.</p>
      </details>

    </section>
  );
}

