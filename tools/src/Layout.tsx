import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const links: [string, string][] = [
    ['/', 'Trig'],
    ['/cabin', 'Cabin'],
    ['/roof-rafter', 'Roof'],
    ['/stairs', 'Stairs'],
    ['/framing', 'Framing'],
    ['/convert', 'Convert'],
    ['/gst', 'GST'],
  ];
  return (
    <div className="min-h-dvh flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            {/* Prefer the main site logo from /assets, fall back to the tools PWA icon if not available */}
            <img
              src="/assets/logo.png"
              alt="Roots & Echo Ltd logo"
              className="h-8 w-auto"
              onError={(e) => {
                const img = e.currentTarget as HTMLImageElement & {
                  dataset: { fallback?: string };
                };
                if (!img.dataset.fallback) {
                  img.dataset.fallback = '1';
                  img.src = '/tools/logo.png';
                } else {
                  img.style.display = 'none';
                }
              }}
            />
          </Link>
          {/* Mobile menu toggle */}
          <button
            type="button"
            className="ml-auto inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="tools-mobile-nav"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="material-symbols-outlined" aria-hidden="true">{mobileOpen ? 'close' : 'menu'}</span>
          </button>

          {/* Desktop navigation */}
          <nav className="ml-auto hidden lg:flex flex-wrap items-center gap-2 text-sm">
            {links.map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                title={to === '/settings' ? 'Settings' : typeof label === 'string' ? label : undefined}
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
        {/* Mobile navigation panel */}
        <div id="tools-mobile-nav" className={`lg:hidden ${mobileOpen ? '' : 'hidden'} border-t bg-white`}>
          <div className="mx-auto max-w-6xl px-4 py-2 flex flex-col gap-1">
            {links.map(([to, label]) => (
              <NavLink
                key={`m-${to}`}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block rounded-md px-2 py-2 text-sm hover:bg-slate-100 ${isActive ? 'bg-slate-200 font-semibold' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-sm flex items-center justify-between">
          <span>© {new Date().getFullYear()} Roots & Echo Ltd</span>
          <div className="flex items-center gap-3">
            <Link
              to="/settings"
              aria-label="Settings"
              className="inline-flex items-center justify-center rounded-md px-1 pt-0.5 pb-1 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              <span
                className="material-symbols-outlined text-current text-sm leading-none align-text-bottom relative top-[1px]"
                aria-hidden="true"
              >
                settings
              </span>
            </Link>
            <a href="/" className="text-pink-700 hover:underline">
              Back to homepage
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
