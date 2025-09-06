import { getDeviceId } from './device';
import { loadLocalSettings, saveLocalSettings, loadQueue, pushQueue, clearQueue, StoredSettings } from './local';

export type Settings = {
  timberPerM: number;
  pilePerEach: number;
  sheetCosts: Record<string, number>;
  paintPerM2: number;
  windowPerM2: number;
  doorPerUnit: number;
  // Roof/Cladding related costs
  costGutterPerM: number;
  costFasciaPerM: number;
  costRidgeCapPerM: number;
  costBargeCapPerM: number;
  costUnderlayPerM2: number;
  labourPerM2: number;
  gstRate: number; // decimal fraction (e.g., 0.15 = 15%)
};

export const defaultSettings: Settings = {
  timberPerM: 4.5,
  pilePerEach: 25,
  sheetCosts: {
    treatedPly: 65,
    internalPly: 50,
    corrugate: 25,
    longrun: 40,
    membrane: 35,
    metalTile: 30,
    concreteTile: 28,
    clayTile: 45,
    asphaltShingle: 32,
    slate: 60,
    gib: 22,
    pir: 90,
    vinyl: 120
  },
  paintPerM2: 15,
  windowPerM2: 350,
  doorPerUnit: 250,
  costGutterPerM: 18,
  costFasciaPerM: 22,
  costRidgeCapPerM: 15,
  costBargeCapPerM: 14,
  costUnderlayPerM2: 6,
  labourPerM2: 25,
  gstRate: 0.15
};

const SETTINGS_API = (import.meta as any).env?.VITE_SETTINGS_API_URL || '/api/settings';

function nowISO() { return new Date().toISOString(); }

async function fetchRemote(): Promise<{ settings?: Partial<Settings>; updated_at?: string } | null> {
  try {
    const res = await fetch(SETTINGS_API, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function pushRemote(payload: { settings: Settings & StoredSettings; updated_at: string | undefined }) {
  await fetch(SETTINGS_API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

export async function loadSettings(): Promise<Settings> {
  // 1) Load fast from local cache
  const local = (await loadLocalSettings()) as (StoredSettings & Settings) | null;
  let current: Settings = local ? { ...defaultSettings, ...local } : { ...defaultSettings };

  // 2) Try network sync from server file
  try {
    const remote = await fetchRemote();
    if (remote?.settings) {
      current = { ...defaultSettings, ...remote.settings } as Settings;
      await saveLocalSettings({ ...current, updated_at: remote.updated_at });
    } else if (!remote && !local) {
      // First run; write defaults up to server (optional)
      try {
        await pushRemote({ settings: { ...current, updated_at: nowISO() }, updated_at: nowISO() });
      } catch {
        // ignore
      }
    }
  } catch {
    // ignore; stay offline
  }

  return current;
}

export async function saveSettings(partial: Partial<Settings>) {
  const local = ((await loadLocalSettings()) as (StoredSettings & Settings) | null) || ({} as Settings);
  const merged: Settings & StoredSettings = { ...defaultSettings, ...local, ...partial, updated_at: nowISO() };
  await saveLocalSettings(merged);

  // Try network write; on failure, queue
  try {
    await pushRemote({ settings: merged, updated_at: merged.updated_at as string });
    await flushQueue();
  } catch {
    await pushQueue(merged);
  }
}

export async function flushQueue() {
  const q = await loadQueue();
  if (q.length === 0) return;
  for (const item of q) {
    try {
      await pushRemote({ settings: item as any, updated_at: (item.updated_at as string) || nowISO() });
    } catch {
      // keep queued
      return;
    }
  }
  await clearQueue();
}

export function bindOnlineSync() {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      flushQueue().catch(() => undefined);
    });
  }
}

