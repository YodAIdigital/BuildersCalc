import nodemailer from 'nodemailer';

// Centralized SMTP email sender (no storage). All configuration comes from env vars.
// Defaults are safe and refer to SMTP2GO based on project requirements.

export type SendEmailInput = {
  to: string;
  from: string;
  replyTo?: string;
  subject: string;
  text: string;
  html?: string;
  headers?: Record<string, string>;
};

let cachedTransport: ReturnType<typeof nodemailer.createTransport> | null = null;

function getEnv(name: string, fallback?: string): string | undefined {
  const v = process.env[name];
  return v !== undefined ? v : fallback;
}

export function getTransport() {
  if (cachedTransport) return cachedTransport;

  const host = getEnv('SMTP_HOST', getEnv('SMTP2GO_HOST', 'mail.smtp2go.com'))!;
  const port = Number(getEnv('SMTP_PORT', getEnv('SMTP2GO_PORT', '2525')));
  const user = getEnv('SMTP_USERNAME', getEnv('SMTP_USER', getEnv('SMTP2GO_USERNAME')));
  const pass = getEnv('SMTP_PASSWORD', getEnv('SMTP_PASS', getEnv('SMTP2GO_PASSWORD')));
  const secure = getEnv('SMTP_SECURE') ? getEnv('SMTP_SECURE') === 'true' : port === 465;

  cachedTransport = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });

  return cachedTransport;
}

export async function sendEmail(input: SendEmailInput) {
  const transporter = getTransport();
  const info = await transporter.sendMail({
    to: input.to,
    from: input.from,
    replyTo: input.replyTo,
    subject: input.subject,
    text: input.text,
    html: input.html,
    headers: input.headers,
  });
  return info;
}
