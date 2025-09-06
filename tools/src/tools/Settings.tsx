import React from 'react';
import { useSettings } from '../hooks/useSettings';

export default function SettingsPage() {
  const { settings, setSettings } = useSettings();

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <div className="rounded-md border bg-white p-4">
        <h3 className="font-semibold mb-2">Framing & Foundation Costs</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <label className="block"><span>Timber ($/m)</span>
            <input className="mt-1 w-full rounded-md border p-2" type="number" step="0.01" value={settings.timberPerM} onChange={(e)=> setSettings({ timberPerM: parseFloat(e.target.value)||0 })} />
          </label>
          <label className="block"><span>Piles ($/each)</span>
            <input className="mt-1 w-full rounded-md border p-2" type="number" step="0.01" value={settings.pilePerEach} onChange={(e)=> setSettings({ pilePerEach: parseFloat(e.target.value)||0 })} />
          </label>
          <label className="block"><span>Paint ($/m²)</span>
            <input className="mt-1 w-full rounded-md border p-2" type="number" step="0.01" value={settings.paintPerM2} onChange={(e)=> setSettings({ paintPerM2: parseFloat(e.target.value)||0 })} />
          </label>
          <label className="block"><span>Window ($/m²)</span>
            <input className="mt-1 w-full rounded-md border p-2" type="number" step="0.01" value={settings.windowPerM2} onChange={(e)=> setSettings({ windowPerM2: parseFloat(e.target.value)||0 })} />
          </label>
          <label className="block"><span>Door ($/unit)</span>
            <input className="mt-1 w-full rounded-md border p-2" type="number" step="0.01" value={settings.doorPerUnit} onChange={(e)=> setSettings({ doorPerUnit: parseFloat(e.target.value)||0 })} />
          </label>
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
      </div>

      <div className="rounded-md border bg-white p-4">
        <h3 className="font-semibold mb-2">Tax</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <label className="block"><span>GST rate (%)</span>
            <input
              className="mt-1 w-full rounded-md border p-2"
              type="number"
              step="0.01"
              min={0}
              max={100}
              value={(settings.gstRate * 100).toFixed(2)}
              onChange={(e) => setSettings({ gstRate: Math.max(0, parseFloat(e.target.value) || 0) / 100 })}
            />
          </label>
        </div>
      </div>
    </section>
  );
}
