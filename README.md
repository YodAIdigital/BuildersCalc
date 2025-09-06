# Roots & Echo Ltd — Cabins + Builder's Tools

This repo hosts a two-part site:
- Static marketing homepage: `index.html` (Tailwind via CDN)
- Tools app (offline-capable PWA): `/tools` (React + TypeScript + Tailwind + Vite)

## Quick start

Homepage (static): open `index.html` in your browser, or serve the folder with any static server.

Tools app:
1. cd tools
2. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
3. Place the logo image at `public/logo.png` (also add a copy at `../assets/logo.png` for the homepage header + favicon).
4. Install and run:
   - `npm install`
   - `npm run dev`

Build + preview PWA:
- `npm run build`
- `npm run preview`

## Storage (settings)
- Offline-first using IndexedDB (idb-keyval) with periodic sync to Supabase.
- Table: `builder_app_settings` with columns: `id uuid`, `device_id uuid`, `settings jsonb`, `updated_at timestamptz`.
- Conflict resolution: newest `updated_at` wins.

## PWA
- The tools app precaches the app shell and supports install (Add to Home Screen).
- Service worker scope: `/tools/` (homepage remains independent).

## Testing & linting (tools)
- `npm run test` — unit tests (Vitest + RTL)
- `npm run lint` — ESLint (with Tailwind plugin)
- `npm run typecheck`

## Legacy
- The previous monolithic `BuildersTool.html` and docs are kept under `/legacy` (for reference only).

## Notes
- Remember to use the Context7 MCP server for the latest docs when needed, and Supabase MCP + Breeze to verify database structure and RLS whenever schema changes occur.

