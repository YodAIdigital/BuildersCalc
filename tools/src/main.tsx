import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import Layout from './Layout';
import './index.css';
import './styles/forms-light.css';
import { SettingsProvider } from './hooks/useSettings';
import React, { Suspense } from 'react';

const Trigonometry = React.lazy(() => import('./tools/Trigonometry'));
const RoofRafter = React.lazy(() => import('./tools/RoofRafter'));
const Stairs = React.lazy(() => import('./tools/Stairs'));
const FramingFoundation = React.lazy(() => import('./tools/FramingFoundation'));
const UnitConverter = React.lazy(() => import('./tools/UnitConverter'));
const GST = React.lazy(() => import('./tools/GST'));
const SettingsGate = React.lazy(() => import('./tools/SettingsGate'));

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
              <Trigonometry />
            </Suspense>
          ),
        },
        {
          path: 'roof-rafter',
          element: (
            <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
              <RoofRafter />
            </Suspense>
          ),
        },
        { path: 'roof', element: <Navigate to="/roof-rafter" replace /> },
        { path: 'rafter', element: <Navigate to="/roof-rafter" replace /> },
        {
          path: 'stairs',
          element: (
            <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
              <Stairs />
            </Suspense>
          ),
        },
        {
          path: 'framing',
          element: (
            <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
              <FramingFoundation />
            </Suspense>
          ),
        },
        {
          path: 'convert',
          element: (
            <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
              <UnitConverter />
            </Suspense>
          ),
        },
        {
          path: 'gst',
          element: (
            <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
              <GST />
            </Suspense>
          ),
        },
        {
          path: 'settings',
          element: (
            <Suspense fallback={<div className="p-6 text-center">Loading…</div>}>
              <SettingsGate />
            </Suspense>
          ),
        },
      ],
    },
  ],
  { basename: '/tools', future: { v7_startTransition: true, v7_relativeSplatPath: true } }
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SettingsProvider>
      <RouterProvider router={router} />
    </SettingsProvider>
  </React.StrictMode>
);
