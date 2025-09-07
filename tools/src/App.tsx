import React, { Suspense } from 'react';
import { NavLink, Route, Routes, Navigate } from 'react-router-dom';

const Trigonometry = React.lazy(() => import('./tools/Trigonometry'));
const Roof = React.lazy(() => import('./tools/Roof'));
const Rafter = React.lazy(() => import('./tools/Rafter'));
const Stairs = React.lazy(() => import('./tools/Stairs'));
const FramingFoundation = React.lazy(() => import('./tools/FramingFoundation'));
const UnitConverter = React.lazy(() => import('./tools/UnitConverter'));
const GST = React.lazy(() => import('./tools/GST'));
const Settings = React.lazy(() => import('./tools/Settings'));
const RoofRafter = React.lazy(() => import('./tools/RoofRafter'));
const Cabin = React.lazy(() => import('./tools/Cabin'));
function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center gap-3">
        {/* Brand link intentionally uses an anchor to route to the marketing homepage at "/" outside the /tools router scope. */}
        <a
          href="/"
          className="flex items-center gap-2"
          aria-label="Roots & Echo Ltd marketing homepage"
        >
          {/* Use BASE_URL so dev resolves to "/logo.png" and production build resolves to "/tools/logo.png". */}
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Roots & Echo Ltd Builder's Tools - construction calculators and framing tools"
            className="h-8 w-auto"
            decoding="async"
            fetchPriority="high"
          />
          <span className="font-bold">Builder's Tools</span>
        </a>
        <nav className="ml-auto flex flex-wrap items-center gap-2 text-sm">
          {[
            ['/', 'Trig'],
            ['/cabin', 'Cabin'],
            ['/roof-rafter', 'Roof/Rafter'],
            ['/stairs', 'Stairs'],
            ['/framing', 'Framing'],
            ['/convert', 'Converter'],
            ['/gst', 'GST'],
            ['/settings', 'Settings'],
          ].map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
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
  );
}

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Trigonometry />} />
            <Route path="/cabin" element={<Cabin />} />
            <Route path="/roof-rafter" element={<RoofRafter />} />
            <Route path="/roof" element={<Navigate to="/roof-rafter" replace />} />
            <Route path="/rafter" element={<Navigate to="/roof-rafter" replace />} />
            <Route path="/stairs" element={<Stairs />} />
            <Route path="/framing" element={<FramingFoundation />} />
            <Route path="/convert" element={<UnitConverter />} />
            <Route path="/gst" element={<GST />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Suspense>
      </main>
      <footer className="border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-sm flex items-center justify-between">
          <span>© {new Date().getFullYear()} Roots & Echo Ltd</span>
          <a href="/" className="text-pink-700 hover:underline">
            Back to homepage
          </a>
        </div>
      </footer>
    </div>
  );
}
