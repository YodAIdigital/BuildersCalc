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
              const ctype = ext === '.png' ? 'image/png'
                : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
                : ext === '.svg' ? 'image/svg+xml'
                : ext === '.ico' ? 'image/x-icon'
                : ext === '.webp' ? 'image/webp'
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
      }
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
          { src: 'logo.png', sizes: '512x512', type: 'image/png' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      }
    })
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts'
  }
}));

