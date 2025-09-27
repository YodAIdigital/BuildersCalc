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
    <div className="tools-shell app-gradient min-h-dvh flex flex-col">
      <header className="tools-header">
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
            className="ml-auto inline-flex items-center justify-center rounded-md p-2 text-cyan-100 hover:bg-[#083848]/80 focus:outline-none focus:ring-2 focus:ring-[#5B2A86] lg:hidden"
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
                  `nav-pill ${isActive ? 'nav-pill--active' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        {/* Mobile navigation panel */}
        <div id="tools-mobile-nav" className={`lg:hidden ${mobileOpen ? '' : 'hidden'} border-t border-[#0d3949] bg-[#03242f]/95 backdrop-blur`}>
          <div className="mx-auto max-w-6xl px-4 py-2 flex flex-col gap-1">
            {links.map(([to, label]) => (
              <NavLink
                key={`m-${to}`}
                to={to}
                end={to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block rounded-md px-2 py-2 text-sm nav-pill nav-pill--mobile ${isActive ? 'nav-pill--active' : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-10 sm:py-12">
        <div className="glass-panel rounded-[2rem] border border-[rgba(34,104,121,0.35)] px-5 py-6 shadow-[0_35px_80px_-60px_rgba(3,15,23,0.9)] sm:px-8 sm:py-8">
          <Outlet />
        </div>
      </main>
      <footer className="tools-footer">
        <div className="mx-auto max-w-6xl px-4 py-4 text-sm flex items-center justify-between">
          <span className="text-cyan-200">© {new Date().getFullYear()} Roots & Echo Ltd</span>
          <div className="flex items-center gap-3">
            <Link
              to="/settings"
              aria-label="Settings"
              className="inline-flex items-center justify-center rounded-md px-1 pt-0.5 pb-1 text-cyan-100 hover:bg-[#083848]/80 hover:text-[#C2B7FF] focus:outline-none focus:ring-2 focus:ring-[#5B2A86]"
            >
              <span
                className="material-symbols-outlined text-current text-sm leading-none align-text-bottom relative top-[1px]"
                aria-hidden="true"
              >
                settings
              </span>
            </Link>
            <a href="/" className="text-[#B547A0] hover:text-[#D164C1] hover:underline">
              Back to homepage
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
