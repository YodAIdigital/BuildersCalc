import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { validateContactInput, sendEnquiryEmail } from './contact.js';
import crypto from 'node:crypto';

const app = express();
app.use(express.json({ limit: '128kb' }));

const SITE_DIR = process.env.SITE_DIR || '/app/site';
const SETTINGS_PATH = process.env.SETTINGS_PATH || '/data/settings.json';
const PORT = Number(process.env.PORT || 80);

// Respect proxy headers so req.ip reflects the real client IP behind a proxy/LB
app.set('trust proxy', true);

// Basic in-memory rate limiting for contact endpoint
const RATE_LIMIT_MAX = Number(process.env.RATE_LIMIT_MAX || '10'); // requests
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS || '900000'); // 15 minutes

type RateBucket = { count: number; resetAt: number };
const rateBuckets = new Map<string, RateBucket>();

function rateLimitCheck(key: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const bucket = rateBuckets.get(key);
  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS;
    const count = 1;
    rateBuckets.set(key, { count, resetAt });
    return { allowed: true, remaining: Math.max(0, RATE_LIMIT_MAX - count), resetAt };
  }
  if (bucket.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  return { allowed: true, remaining: Math.max(0, RATE_LIMIT_MAX - bucket.count), resetAt: bucket.resetAt };
}

async function readSettingsFile(): Promise<{
  settings: Record<string, unknown>;
  updated_at: string | null;
}> {
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

// Email a cabin quote
app.post('/api/email-cabin', async (req, res) => {
  try {
    // Rate limit (reuse existing bucket)
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || (req.socket.remoteAddress || 'unknown');
    const rl = rateLimitCheck(Array.isArray(ip) ? ip[0] : ip);
    res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
    res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(rl.resetAt / 1000)));
    if (!rl.allowed) {
      const retryAfter = Math.max(0, Math.ceil((rl.resetAt - Date.now()) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    const body = req.body as any;
    if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Invalid payload' });

    const to = typeof body.to === 'string' ? sanitizeEmail(body.to) : '';
    const subject = typeof body.subject === 'string' ? sanitizeHeader(body.subject).slice(0, 150) : 'Cabin quote';
    const html = typeof body.html === 'string' ? body.html : '';
    const attachments = Array.isArray(body.attachments) ? body.attachments : [];

    if (!to || !isEmailLike(to)) return res.status(400).json({ error: 'Invalid recipient' });
    if (!html || html.length > 200_000) return res.status(400).json({ error: 'Invalid email body' });

    const from = process.env.CONTACT_FROM_EMAIL || process.env.MAIL_FROM || 'zeke@rootsandecho.co.nz';
    const replyTo = process.env.CONTACT_REPLY_TO || process.env.MAIL_REPLY_TO || from;

    const safeAttachments = attachments.slice(0, 2).map((a: any) => {
      const fn = typeof a?.filename === 'string' ? a.filename.replace(/[\r\n]+/g, '').slice(0, 64) : 'attachment.bin';
      const b64 = typeof a?.contentBase64 === 'string' ? a.contentBase64 : '';
      if (!/^([A-Za-z0-9+/=]+)$/.test(b64) || b64.length > 2_000_000) return null;
      return { filename: fn, content: Buffer.from(b64, 'base64'), contentType: 'image/png' };
    }).filter(Boolean) as { filename: string; content: Buffer; contentType?: string }[];

    const { sendEmail } = await import('./email.js');

    await sendEmail({
      to,
      from,
      replyTo,
      subject,
      text: 'Cabin quote (HTML version attached).',
      html,
      headers: { 'X-Mail-Type': 'cabin-quote' },
      attachments: safeAttachments,
    });

    return res.status(202).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send email' });
  }
});

function sanitizeHeader(s: string) {
  return s.replace(/[\r\n]+/g, ' ').trim();
}
function sanitizeEmail(s: string) {
  return sanitizeHeader(s);
}
function isEmailLike(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    // Basic per-IP rate limiting
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || (req.socket.remoteAddress || 'unknown');
    const rl = rateLimitCheck(Array.isArray(ip) ? ip[0] : ip);
    res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
    res.setHeader('X-RateLimit-Remaining', String(rl.remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(rl.resetAt / 1000)));
    if (!rl.allowed) {
      const retryAfter = Math.max(0, Math.ceil((rl.resetAt - Date.now()) / 1000));
      res.setHeader('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    const body = req.body as any;

    // Honeypot: ignore bots silently
    const honey = typeof body?.company === 'string' && body.company.trim();
    if (honey) return res.status(200).json({ ok: true });

    const result = validateContactInput(body);
    if (result.errors) return res.status(400).json({ error: 'Invalid payload', details: result.errors });

    const data = result.data!; // safe: errors checked above
    const requestId = crypto.randomUUID();
    await sendEnquiryEmail({ ...data, source: data.source || (req.headers['x-form-source'] as string) }, { requestId });
    return res.status(202).json({ ok: true, requestId });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send message' });
  }
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

app.listen(PORT, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on ${PORT}`);
});
