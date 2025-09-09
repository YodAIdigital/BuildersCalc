export type IncomingAttachment = {
  filename?: string;
  contentBase64?: string;
  contentType?: string;
  cid?: string; // optional for inline images
};

export type SafeAttachment = {
  filename: string;
  content: Buffer;
  contentType: string;
  cid?: string;
};

const ALLOWED_TYPES = new Set(['image/png', 'application/pdf']);

function sanitizeFilename(s: string | undefined): string {
  const base = (s || 'attachment').replace(/[\r\n]+/g, '').slice(0, 64);
  return base || 'attachment';
}

export function validateAttachments(input: any[], opts?: { maxBytes?: number }): SafeAttachment[] {
  const arr = Array.isArray(input) ? input.slice(0, 2) : [];
  const maxBytes = typeof opts?.maxBytes === 'number' ? opts!.maxBytes : Number(process.env.EMAIL_MAX_ATTACHMENT_BYTES || '5000000');
  const out: SafeAttachment[] = [];
  for (const a of arr) {
    const filename = sanitizeFilename(typeof a?.filename === 'string' ? a.filename : undefined);
    const contentType = typeof a?.contentType === 'string' ? a.contentType : 'application/octet-stream';
    if (!ALLOWED_TYPES.has(contentType)) continue;
    const b64 = typeof a?.contentBase64 === 'string' ? a.contentBase64 : '';
    if (!/^([A-Za-z0-9+/=]+)$/.test(b64)) continue;
    let buf: Buffer;
    try {
      buf = Buffer.from(b64, 'base64');
    } catch {
      continue;
    }
    if (!buf || buf.length === 0 || buf.length > maxBytes) continue;
    // Basic magic header check for pdf
    if (contentType === 'application/pdf') {
      const head = buf.slice(0, 5).toString('utf8');
      if (!head.startsWith('%PDF-')) continue;
    }
    let cid: string | undefined = undefined;
    if (typeof a?.cid === 'string') {
      const raw = a.cid.slice(0, 128);
      // allow letters, digits, dots, dashes, underscores
      const safe = raw.replace(/[^A-Za-z0-9._-]/g, '');
      cid = safe || undefined;
    }
    out.push({ filename, content: buf, contentType, cid });
  }
  return out;
}

