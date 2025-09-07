import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'node:fs';
import path from 'node:path';

export default defineConfig(({ command }) => ({
  // Use root base in dev so Vite internals live at /@vite/*; use /tools/ only for builds
  base: command === 'build' ? '/tools/' : '/',
  plugins: [
    react(),
    // Lightweight development API to avoid 404s for /api/* during `vite`
    // NOTE: This only runs in dev and is not part of the production build.
    {
      name: 'roots-echo-dev-api',
      apply: 'serve',
      configureServer(server) {
        const dataDir = path.resolve(__dirname, '.dev-data');
        const settingsFile = path.join(dataDir, 'settings.json');

        async function readBody(req: any): Promise<any> {
          const chunks: Uint8Array[] = [];
          await new Promise<void>((resolve) => {
            req.on('data', (c: Uint8Array) => chunks.push(c));
            req.on('end', () => resolve());
          });
          if (chunks.length === 0) return null;
          const raw = Buffer.concat(chunks).toString('utf8');
          try {
            return JSON.parse(raw);
          } catch {
            return null;
          }
        }

        server.middlewares.use(async (req, res, next) => {
          const url = req.url || '';
          if (!url.startsWith('/api/')) return next();

          // Ensure a place to write local dev data
          try {
            fs.mkdirSync(dataDir, { recursive: true });
          } catch {}

          res.setHeader('Cache-Control', 'no-store');

          // GET/PUT Settings
          if (url === '/api/settings') {
            if (req.method === 'GET') {
              try {
                const raw = fs.readFileSync(settingsFile, 'utf8');
                res.setHeader('Content-Type', 'application/json');
                res.end(raw);
              } catch {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ settings: {}, updated_at: null }));
              }
              return;
            }
            if (req.method === 'PUT') {
              const body = await readBody(req);
              if (!body || typeof body !== 'object' || typeof body.settings !== 'object') {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Invalid payload' }));
                return;
              }
              fs.writeFileSync(settingsFile, JSON.stringify(body));
              res.statusCode = 204; // align with production server
              res.end();
              return;
            }
          }

          // POST Contact — dev no-op that simply acknowledges
          if (url === '/api/contact' && req.method === 'POST') {
            const body = await readBody(req);
            const requestId =
              Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
            // Log a minimal, non-sensitive summary to aid local debugging
            // eslint-disable-next-line no-console
            console.log('[dev-contact]', {
              name: body?.name,
              email: body?.email,
              phone: body?.phone,
              source: body?.source,
              requestId,
            });
            res.statusCode = 202;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ ok: true, requestId }));
            return;
          }

          // Unknown /api route — continue to next middleware (may 404 later)
          next();
        });
      },
    },
    // Serve marketing homepage at "/" during dev and allow deep links under "/tools/*"
    {
      name: 'roots-echo-dev-mpa',
      apply: 'serve',
      configureServer(server) {
        const rootIndex = path.resolve(__dirname, '../index.html');
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/' || req.url === '/index.html') {
            res.setHeader('Content-Type', 'text/html');
            try {
              const html = fs.readFileSync(rootIndex, 'utf-8');
              const transformed = await server.transformIndexHtml('/', html);
              res.end(transformed);
            } catch {
              next();
            }
            return;
          }
          // Serve assets from repo root, e.g. /assets/logo.png
          if (req.url && req.url.startsWith('/assets/')) {
            const filePath = path.resolve(__dirname, `..${req.url}`);
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const ext = path.extname(filePath).toLowerCase();
              const ctype =
                ext === '.png'
                  ? 'image/png'
                  : ext === '.jpg' || ext === '.jpeg'
                    ? 'image/jpeg'
                    : ext === '.svg'
                      ? 'image/svg+xml'
                      : ext === '.ico'
                        ? 'image/x-icon'
                        : ext === '.webp'
                          ? 'image/webp'
                          : 'application/octet-stream';
              res.setHeader('Content-Type', ctype);
              res.end(fs.readFileSync(filePath));
              return;
            }
          }
          next();
        });
        // History fallback for /tools/* in dev, excluding Vite internals and static/module requests
        const toolsIndex = path.resolve(__dirname, 'index.html');
        function acceptsHtml(req: any) {
          const a = (req.headers?.accept || '') as string;
          return a.includes('text/html');
        }
        server.middlewares.use(async (req, res, next) => {
          const url = req.url || '';
          if (url === '/tools' || url === '/tools/') {
            res.setHeader('Content-Type', 'text/html');
            const html = fs.readFileSync(toolsIndex, 'utf-8');
            const transformed = await server.transformIndexHtml('/tools/', html);
            res.end(transformed);
            return;
          }
          if (
            url.startsWith('/tools/') &&
            !url.startsWith('/tools/@vite') &&
            !url.startsWith('/tools/@react-refresh') &&
            !url.startsWith('/tools/@id') &&
            !url.startsWith('/tools/src/') &&
            !url.startsWith('/tools/node_modules/') &&
            !url.startsWith('/tools/__vite_ping') &&
            acceptsHtml(req)
          ) {
            res.setHeader('Content-Type', 'text/html');
            const html = fs.readFileSync(toolsIndex, 'utf-8');
            const transformed = await server.transformIndexHtml(url, html);
            res.end(transformed);
            return;
          }
          next();
        });
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png'],
      manifest: {
        name: "Builder's Tools — Roots & Echo Ltd",
        short_name: 'Builders Tools',
        start_url: '/tools/',
        scope: '/tools/',
        display: 'standalone',
        theme_color: '#0f172a',
        background_color: '#f8fafc',
        icons: [
          { src: 'logo.png', sizes: '192x192', type: 'image/png' },
          { src: 'logo.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
}));
