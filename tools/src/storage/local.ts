import { get, set } from 'idb-keyval';

export type StoredSettings = Record<string, unknown> & { updated_at?: string };

export async function loadLocalSettings(): Promise<StoredSettings | null> {
  return (await get('settings')) || null;
}
export async function saveLocalSettings(settings: StoredSettings) {
  await set('settings', settings);
}

// Minimal queue for offline saves
export async function loadQueue(): Promise<StoredSettings[]> {
  return (await get('queue')) || [];
}
export async function pushQueue(item: StoredSettings) {
  const q = (await loadQueue()) || [];
  q.push(item);
  await set('queue', q);
}
export async function clearQueue() {
  await set('queue', []);
}
