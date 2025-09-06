# BuildersCalc / Roots & Echo Site

This repository contains:
- A static marketing site (root) served by a small Express server in production
- Builders Tools PWA under `/tools/`
- A tiny HTTP API for settings persistence (`/api/settings`) and a contact endpoint (`/api/contact`)

## Local development quick start

1) Install dependencies for the tools workspace
- PowerShell:
  npm --prefix ./tools install

2) Run tests
- PowerShell:
  npm --prefix ./tools run test

3) Build
- PowerShell:
  npm --prefix ./tools run build:all

4) Run the container locally (recommended)
- PowerShell:
  docker compose up --build
- Visit http://localhost:8080/

## Environment variables and secrets

Create an `.env` (or configure variables in your hosting provider) using `.env.example` as a template.

IMPORTANT: Do not commit secrets. The root `.gitignore` includes `.env` and `/.data`.

Key variables:
- SMTP_HOST (default mail.smtp2go.com)
- SMTP_PORT (default 2525; STARTTLS)
- SMTP_USERNAME, SMTP_PASSWORD
- CONTACT_FROM_EMAIL, CONTACT_TO_EMAIL, CONTACT_REPLY_TO
- RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS

## Contact form

The contact forms on the marketing pages (index.html and cabins-cromwell-queenstown.html) POST to `/api/contact`.
- The server validates inputs, honors the honeypot field, applies a basic per-IP rate limit, and sends via SMTP.
- No data is stored locally or in a database.

## Deployment

See DEPLOYMENT.md for detailed instructions (Elestio) and required environment variables.

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
- Offline-first using IndexedDB (idb-keyval) with optional sync to a simple server JSON file.
- API endpoints (served by the production container):
  - `GET /api/settings` → returns `{ settings, updated_at }`
  - `PUT /api/settings` → writes settings with last-write-wins using `updated_at`
- Server persistence: `/data/settings.json` (mounted as a persistent volume in production)
- Conflict resolution: newest `updated_at` wins; offline writes are queued and flushed when back online.

## PWA
- The tools app precaches the app shell and supports install (Add to Home Screen).
- Service worker scope: `/tools/` (homepage remains independent).

## Testing & linting (tools)
- `npm run test` — unit tests (Vitest + RTL)
- `npm run lint` — ESLint (with Tailwind plugin)
- `npm run typecheck`

## Legacy
- The previous monolithic `BuildersTool.html` and docs are kept under `/legacy` (for reference only).

## Deployment
- See `DEPLOYMENT.md` for Dockerfile-based deployment on Elestio, volume mounting for `/data`, and the healthcheck endpoint.

## Notes
- Remember to use the Context7 MCP server for the latest docs when needed.

