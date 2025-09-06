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

**IMPORTANT**: Use these exact settings to avoid the "Dockerfile not found" error:

- Deployment type: Build from Dockerfile (Git repository)
- Repository: Connect this repo and select the deployment branch (e.g., `main`)
- Build context: `.` (dot - represents repository root)
- Dockerfile path: `Dockerfile` (NO leading `./` - just `Dockerfile`)
- Container port: `3000`
- Health check: HTTP `GET /health`
- Note: The container runs as a non-root user and therefore binds to port `3000` (non-privileged). Point your load balancer target to port `3000`.
- Domain: Use Elestio-provided or custom; enable HTTPS
- Auto-deploy on push: Enable
- Scaling: `1` instance (unless you configure a shared volume across instances)
- Resources: 0.5–1 vCPU and 512MB–1GB RAM is typically sufficient

### Troubleshooting "Dockerfile not found" errors:

1. **File path**: Use `Dockerfile` not `./Dockerfile` in the Dockerfile path field
2. **Build context**: Ensure build context is `.` (repository root)
3. **Branch**: Verify you're building from the correct branch (usually `main`)
4. **Repository access**: For private repos, ensure deploy key or token has read access
5. **File casing**: Dockerfile must be exactly `Dockerfile` (capital D, no extension)
6. **Git history**: Ensure the Dockerfile is committed and pushed to the remote branch

### Persistent volume
- Create/attach a persistent volume and mount it at `/data`
- The server writes to `/data/settings.json`

### Environment variables

Core server
- `PORT` (default `80`)
- `SITE_DIR` (default `/app/site`)
- `SETTINGS_PATH` (default `/data/settings.json`)

Contact form and email delivery (`POST /api/contact`)
- `SMTP_HOST` (default `mail.smtp2go.com`) — SMTP server hostname
- `SMTP_PORT` (default `2525`) — 2525/587/8025/80/25 (STARTTLS) or 465/8465/443 (SSL; also set `SMTP_SECURE=true`)
- `SMTP_USERNAME` — SMTP username (do not commit)
- `SMTP_PASSWORD` — SMTP password (do not commit)
- `SMTP_SECURE` (optional) — set `true` when using SSL ports (465, 8465, 443)
- `CONTACT_FROM_EMAIL` — sender email (e.g., `zeke@rootsandecho.co.nz`)
- `CONTACT_TO_EMAIL` — recipient email (e.g., `zeke@rootsandecho.co.nz`)
- `CONTACT_REPLY_TO` (optional) — reply-to email (defaults to `CONTACT_FROM_EMAIL`)

Rate limiting (applies to `/api/contact`)
- `RATE_LIMIT_MAX` (default `10`) — max requests per window per IP
- `RATE_LIMIT_WINDOW_MS` (default `900000`) — window size in ms (default 15 minutes)

Notes
- Configure all secrets via your hosting provider’s environment settings (e.g., Elestio dashboard). Do not commit secrets to the repository.
- Keep `SETTINGS_PATH` within the `/data` volume for persistence.

## Notes
- The API has no auth and implements last-write-wins via `updated_at`, per project requirements. Do not store sensitive data in settings.
- Local development via `vite` runs offline-first; the API is present only in the production container unless you run the container locally.
