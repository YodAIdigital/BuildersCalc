import type { SendEmailInput } from './email.js';
import { sendEmail } from './email.js';

export type ContactInput = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  company?: string; // honeypot
  source?: string; // page identifier
};

export type ValidatedContact = Required<Pick<ContactInput, 'name' | 'email' | 'message'>> & {
  phone?: string;
  source?: string;
};

function isEmail(s: string): boolean {
  // Very light email check; rely on provider and server to handle real addresses
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function sanitizeLine(s: string): string {
  // Remove CRLF to prevent header injection
  return s.replace(/[\r\n]+/g, ' ').trim();
}

export function validateContactInput(body: any): { data?: ValidatedContact; errors?: string[] } {
  const errors: string[] = [];
  if (!body || typeof body !== 'object') return { errors: ['Invalid payload'] };

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const phone = typeof body.phone === 'string' ? body.phone.trim() : undefined;
  const message = typeof body.message === 'string' ? body.message.trim() : '';
  const source = typeof body.source === 'string' ? body.source.trim().slice(0, 120) : undefined;

  if (!name || name.length > 120) errors.push('Invalid name');
  if (!email || email.length > 254 || !isEmail(email)) errors.push('Invalid email');
  if (!message || message.length > 5000) errors.push('Invalid message');
  if (phone && phone.length > 40) errors.push('Invalid phone');

  if (errors.length) return { errors };

  return {
    data: {
      name: sanitizeLine(name),
      email: sanitizeLine(email),
      phone: phone ? sanitizeLine(phone) : undefined,
      message,
      source,
    },
  };
}

export async function sendEnquiryEmail(data: ValidatedContact, meta?: { requestId?: string }) {
  const to = process.env.CONTACT_TO_EMAIL || process.env.MAIL_TO || 'zeke@rootsandecho.co.nz';
  const from = process.env.CONTACT_FROM_EMAIL || process.env.MAIL_FROM || 'zeke@rootsandecho.co.nz';
  const replyTo = process.env.CONTACT_REPLY_TO || process.env.MAIL_REPLY_TO || from;

  const subject = `[Website enquiry] ${data.source || 'site'} - ${data.name}`;

  const lines = [
    'New website enquiry',
    '',
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.phone ? `Phone: ${data.phone}` : undefined,
    data.source ? `Source: ${data.source}` : undefined,
    '',
    'Message:',
    data.message,
  ].filter(Boolean) as string[];

  const text = lines.join('\n');
  const html = lines.map(l => l === 'Message:' ? '<strong>Message:</strong>' : l).join('<br />');

  const headers: Record<string, string> = {};
  if (meta?.requestId) headers['X-Request-Id'] = meta.requestId;
  if (data.source) headers['X-Form-Source'] = data.source;

  const emailInput: SendEmailInput = {
    to,
    from,
    replyTo, // per requirement, keep replies to zeke@rootsandecho.co.nz
    subject,
    text,
    html,
    headers,
  };

  await sendEmail(emailInput);
}
