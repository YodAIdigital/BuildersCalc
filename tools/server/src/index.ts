import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';

const app = express();
app.use(express.json({ limit: '128kb' }));

const SITE_DIR = process.env.SITE_DIR || '/app/site';
const SETTINGS_PATH = process.env.SETTINGS_PATH || '/data/settings.json';
const PORT = Number(process.env.PORT || 80);

async function readSettingsFile(): Promise<{ settings: Record<string, unknown>; updated_at: string | null; }> {
  try {
    const raw = await fs.readFile(SETTINGS_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { settings: {}, updated_at: null };
  }
}

async function writeSettingsFile(data: unknown): Promise<void> {
  await fs.mkdir(path.dirname(SETTINGS_PATH), { recursive: true });
  const tmp = SETTINGS_PATH + '.tmp';
  await fs.writeFile(tmp, JSON.stringify(data), 'utf8');
  await fs.rename(tmp, SETTINGS_PATH);
}

// API endpoints
app.get('/api/settings', async (_req, res) => {
  const data = await readSettingsFile();
  res.json(data);
});

app.put('/api/settings', async (req, res) => {
  const body = req.body as any;
  if (!body || typeof body !== 'object' || typeof body.settings !== 'object') {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  // No auth; last-write-wins as requested
  await writeSettingsFile(body);
  res.status(204).end();
});

// Static assets
app.use(express.static(SITE_DIR, { index: 'index.html' }));

// SPA fallback only for /tools/*
app.get('/tools/*', (_req, res) => {
  res.sendFile(path.join(SITE_DIR, 'tools', 'index.html'));
});

// Healthcheck
app.get('/health', (_req, res) => {
  res.type('text').send('ok');
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on ${PORT}`);
});
