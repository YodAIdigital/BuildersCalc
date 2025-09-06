import React from 'react';

const SettingsPage = React.lazy(() => import('./Settings'));

export default function SettingsGate() {
  const [pin, setPin] = React.useState('');
  const [error, setError] = React.useState('');
  const [unlocked, setUnlocked] = React.useState<boolean>(() => {
    try {
      return localStorage.getItem('builders-tools-settings-unlocked') === '1';
    } catch {
      return false;
    }
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (pin === '555') {
      try { localStorage.setItem('builders-tools-settings-unlocked', '1'); } catch {}
      setUnlocked(true);
    } else {
      setError('Incorrect PIN');
    }
  }

  if (unlocked) {
    return (
      <React.Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
        <SettingsPage />
      </React.Suspense>
    );
  }

  return (
    <section className="space-y-4 max-w-sm">
      <h2 className="text-2xl font-bold">Enter PIN</h2>
      <p className="text-sm text-slate-600">Enter the 3-digit PIN to access Settings.</p>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm">PIN</span>
          <input
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(''); }}
            className="mt-1 w-full rounded-md border p-2"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={3}
            placeholder="***"
            aria-label="PIN code"
          />
        </label>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <button type="submit" className="rounded-md border px-3 py-2 text-sm hover:bg-slate-100">Unlock</button>
      </form>
    </section>
  );
}

