import { getDeviceId } from './device';
import { loadLocalSettings, saveLocalSettings, loadQueue, pushQueue, clearQueue, StoredSettings } from './local';
import { supabase } from './supabase';

export type Settings = {
  timberPerM: number;
  pilePerEach: number;
  sheetCosts: Record<string, number>;
  paintPerM2: number;
  windowPerM2: number;
  doorPerUnit: number;
};

export const defaultSettings: Settings = {
  timberPerM: 4.5,
  pilePerEach: 25,
  sheetCosts: {
    treatedPly: 65,
    internalPly: 50,
    corrugate: 25,
    gib: 22,
    pir: 90,
    vinyl: 120
  },
  paintPerM2: 15,
  windowPerM2: 350,
  doorPerUnit: 250
};

function nowISO() { return new Date().toISOString(); }

export async function loadSettings(): Promise<Settings> {
  // 1) Load fast from local cache
  const local = (await loadLocalSettings()) as (StoredSettings & Settings) | null;
  let current: Settings = local ? { ...defaultSettings, ...local } : { ...defaultSettings };

  // 2) Try network sync
  try {
    if (supabase) {
      const device_id = getDeviceId();
      const { data, error } = await supabase
        .from('builder_app_settings')
        .select('settings, updated_at')
        .eq('device_id', device_id)
        .maybeSingle();
      if (!error && data?.settings) {
        const remote = data.settings as Settings;
        current = { ...defaultSettings, ...remote };
        await saveLocalSettings({ ...current, updated_at: data.updated_at });
      } else if (!error && !data) {
        // Insert initial row
        await supabase.from('builder_app_settings').insert({ device_id, settings: current, updated_at: nowISO() });
      }
    }
  } catch (e) {
    console.warn('Settings remote load failed; using local cache.');
  }

  return current;
}

export async function saveSettings(partial: Partial<Settings>) {
  const local = ((await loadLocalSettings()) as (StoredSettings & Settings) | null) || ({} as Settings);
  const merged: Settings & StoredSettings = { ...defaultSettings, ...local, ...partial, updated_at: nowISO() };
  await saveLocalSettings(merged);

  // Try network write; on failure, queue
  try {
    if (supabase) {
      const device_id = getDeviceId();
      await supabase.from('builder_app_settings').upsert({ device_id, settings: merged, updated_at: merged.updated_at });
      await flushQueue();
    }
  } catch {
    await pushQueue(merged);
  }
}

export async function flushQueue() {
  if (!supabase) return;
  const q = await loadQueue();
  if (q.length === 0) return;
  const device_id = getDeviceId();
  for (const item of q) {
    try {
      await supabase.from('builder_app_settings').upsert({ device_id, settings: item, updated_at: item.updated_at as string });
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

