// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { validateAttachments } from './attachments.js';

function makeB64(buf: Uint8Array) {
  // @ts-ignore
  return Buffer.from(buf).toString('base64');
}

describe('validateAttachments', () => {
  it('accepts a small PDF', () => {
    const header = new TextEncoder().encode('%PDF-1.4\n');
    const payload = new Uint8Array([...header, 0, 1, 2, 3, 4]);
    const b64 = makeB64(payload);
    const out = validateAttachments([
      { filename: 'cabin.pdf', contentBase64: b64, contentType: 'application/pdf' },
    ], { maxBytes: 1024 });
    expect(out.length).toBe(1);
    expect(out[0].contentType).toBe('application/pdf');
    expect(out[0].filename).toBe('cabin.pdf');
  });

  it('rejects oversized attachments', () => {
    const header = new TextEncoder().encode('%PDF-1.4\n');
    const large = new Uint8Array(2048);
    large.set(header, 0);
    const b64 = makeB64(large);
    const out = validateAttachments([
      { filename: 'big.pdf', contentBase64: b64, contentType: 'application/pdf' },
    ], { maxBytes: 512 });
    expect(out.length).toBe(0);
  });

  it('rejects disallowed content types', () => {
    const b64 = makeB64(new TextEncoder().encode('not pdf'));
    const out = validateAttachments([
      { filename: 'note.txt', contentBase64: b64, contentType: 'text/plain' },
    ]);
    expect(out.length).toBe(0);
  });
});

