import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src="/tools/logo.png" alt="Roots & Echo Ltd logo" className="h-8 w-auto" onError={(e) => ((e.currentTarget.style.display = 'none'))} />
            <span className="font-bold">Builder's Tools</span>
          </Link>
          <nav className="ml-auto flex flex-wrap items-center gap-2 text-sm">
            {[
              ['/', 'Trig'],
              ['/roof-rafter', 'Roof/Rafter'],
              ['/stairs', 'Stairs'],
              ['/framing', 'Framing'],
              ['/convert', 'Converter'],
              ['/gst', 'GST'],
              ['/settings', '⚙'],
            ].map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                title={to === '/settings' ? 'Settings' : (typeof label === 'string' ? label : undefined)}
                aria-label={to === '/settings' ? 'Settings' : undefined}
                className={({ isActive }) =>
                  `rounded-md px-2 py-1 hover:bg-slate-100 ${isActive ? 'bg-slate-200 font-semibold' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-sm flex items-center justify-between">
          <span>© {new Date().getFullYear()} Roots & Echo Ltd</span>
          <a href="/" className="text-pink-700 hover:underline">Back to homepage</a>
        </div>
      </footer>
    </div>
  );
}

