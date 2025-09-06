# Deployment (Elestio)

This project ships as a single container that serves:
- The marketing site at `/`
- The Tools PWA at `/tools/`
- A tiny HTTP API for settings persistence at `/api/settings` that stores to a JSON file on a persistent volume

The container is built from the repo's Dockerfile. No external database is required.

## Architecture
- Runtime: Node.js (Express)
- Static files directory: `SITE_DIR` (default `/app/site`)
- Settings file path: `SETTINGS_PATH` (default `/data/settings.json`)
- Port: `PORT` (default `80`)
- Healthcheck: `GET /health`

## Build & run locally

- Build:
  - `docker build -t builderscalc:local .`
- Run with a local volume for persistence:
  - Linux/macOS: `docker run --rm -p 8080:80 -v "$PWD/.data:/data" builderscalc:local`
  - Windows (PowerShell): `docker run --rm -p 8080:80 -v ${PWD}/.data:/data builderscalc:local`
- Visit:
  - `http://localhost:8080/` → marketing site
  - `http://localhost:8080/tools/` → Tools PWA
  - `http://localhost:8080/health` → `ok`
- After changing settings in the app, inspect `./.data/settings.json` to see that values persist.

## Elestio configuration

- Deployment type: Build from Dockerfile (Git repository)
- Repository: Connect this repo and select the deployment branch (e.g., `main`)
- Build context: `.`
- Dockerfile: `./Dockerfile`
- Container port: `80`
- Health check: HTTP `GET /health`
- Domain: Use Elestio-provided or custom; enable HTTPS
- Auto-deploy on push: Enable
- Scaling: `1` instance (unless you configure a shared volume across instances)
- Resources: 0.5–1 vCPU and 512MB–1GB RAM is typically sufficient

### Persistent volume
- Create/attach a persistent volume and mount it at `/data`
- The server writes to `/data/settings.json`

### Environment variables (optional)
- None required by default. The server uses:
  - `PORT` (default `80`)
  - `SITE_DIR` (default `/app/site`)
  - `SETTINGS_PATH` (default `/data/settings.json`)
- Only override if you have a specific reason; keep `SETTINGS_PATH` within the `/data` mount for persistence.

## Notes
- The API has no auth and implements last-write-wins via `updated_at`, per project requirements. Do not store sensitive data in settings.
- Local development via `vite` runs offline-first; the API is present only in the production container unless you run the container locally.
