import { getDeviceId } from './device';
import {
  loadLocalSettings,
  saveLocalSettings,
  loadQueue,
  pushQueue,
  clearQueue,
  StoredSettings,
} from './local';

export type Settings = {
  timberPerM: number;
  pilePerEach: number;
  sheetCosts: Record<string, number>; // $/sheet for sheet goods (ply, gib, pir, vinyl, etc.)
  paintPerM2: number;
  windowPerM2: number;
  doorPerUnit: number;
  // Additional pricing models (prefer per-m2 where applicable)
  claddingPerM2: {
    corrugate: number;
    longrun: number; // tray/standing seam
    fiveRib: number;
    membrane: number;
    cedarWeatherboard: number;
    standardWeatherboard: number;
  };
  liningPerM2: {
    ply: number;
    gib: number;
  };
  electricalPerM2: number;
  electricalFixed: number;
  insulationPerM2: number;
  buildingWrapPerM2: number;
  fixingsAllowancePerM2: number;
  flashingsAllowancePerM: number;
  doorHardwarePerUnit: number;
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
    treatedPly: 65, // $/sheet (2.4 x 1.2)
    internalPly: 50, // $/sheet (2.4 x 1.2)
    corrugate: 25, // legacy sheet-like input; prefer claddingPerM2 below
    longrun: 40, // legacy
    membrane: 35, // legacy
    metalTile: 30,
    concreteTile: 28,
    clayTile: 45,
    asphaltShingle: 32,
    slate: 60,
    gib: 22, // $/sheet (2.4 x 1.2)
    pir: 90, // $/sheet (2.4 x 1.2)
    vinyl: 120,
  },
  paintPerM2: 15,
  windowPerM2: 350,
  doorPerUnit: 250,
  claddingPerM2: {
    corrugate: 55,
    longrun: 65,
    fiveRib: 60,
    membrane: 40,
    cedarWeatherboard: 145,
    standardWeatherboard: 95,
  },
  liningPerM2: {
    ply: 35,
    gib: 25,
  },
  electricalPerM2: 0,
  electricalFixed: 2995,
  insulationPerM2: 20,
  buildingWrapPerM2: 4.5,
  fixingsAllowancePerM2: 6.0,
  flashingsAllowancePerM: 9.5,
  doorHardwarePerUnit: 85,
  costGutterPerM: 18,
  costFasciaPerM: 22,
  costRidgeCapPerM: 15,
  costBargeCapPerM: 14,
  costUnderlayPerM2: 6,
  labourPerM2: 25,
  gstRate: 0.15,
};

const SETTINGS_API = (import.meta as any).env?.VITE_SETTINGS_API_URL || '/api/settings';

function nowISO() {
  return new Date().toISOString();
}

async function fetchRemote(): Promise<{
  settings?: Partial<Settings>;
  updated_at?: string;
} | null> {
  try {
    const res = await fetch(SETTINGS_API, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function pushRemote(payload: {
  settings: Settings & StoredSettings;
  updated_at: string | undefined;
}) {
  await fetch(SETTINGS_API, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function hydrateSettings(s: Partial<Settings> | null | undefined): Settings {
  // Merge missing keys from defaults to maintain backward compatibility as we add pricing fields
  return {
    ...defaultSettings,
    ...(s as any),
    sheetCosts: { ...defaultSettings.sheetCosts, ...(s?.sheetCosts || {}) },
    claddingPerM2: { ...defaultSettings.claddingPerM2, ...(s as any)?.claddingPerM2 },
    liningPerM2: { ...defaultSettings.liningPerM2, ...(s as any)?.liningPerM2 },
  } as Settings;
}

export async function loadSettings(): Promise<Settings> {
  // 1) Load fast from local cache
  const local = (await loadLocalSettings()) as (StoredSettings & Settings) | null;
  let current: Settings = hydrateSettings(local || undefined);

  // 2) Try network sync from server file
  try {
    const remote = await fetchRemote();
    if (remote?.settings) {
      current = hydrateSettings(remote.settings as any);
      await saveLocalSettings({ ...(current as any), updated_at: remote.updated_at });
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
  const local =
    ((await loadLocalSettings()) as (StoredSettings & Settings) | null) || ({} as Settings);
  const merged: Settings & StoredSettings = {
    ...hydrateSettings(local || undefined),
    ...partial,
    updated_at: nowISO(),
  } as any;
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
      await pushRemote({
        settings: item as any,
        updated_at: (item.updated_at as string) || nowISO(),
      });
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
