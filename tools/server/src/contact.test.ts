// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { validateContactInput } from './contact.js';

describe('validateContactInput', () => {
  it('accepts a valid payload', () => {
    const { data, errors } = validateContactInput({
      name: 'Alice Example',
      email: 'alice@example.com',
      phone: '021 123 4567',
      message: 'Hello there',
      source: 'homepage',
    });
    expect(errors).toBeUndefined();
    expect(data).toBeDefined();
    expect(data?.name).toBe('Alice Example');
  });

  it('rejects invalid email and too-long message', () => {
    const { errors } = validateContactInput({
      name: 'Bob',
      email: 'not-an-email',
      message: 'x'.repeat(6000),
    });
    expect(errors).toBeDefined();
    expect(errors).toContain('Invalid email');
    expect(errors).toContain('Invalid message');
  });

  it('strips CRLF to prevent header injection', () => {
    const { data, errors } = validateContactInput({
      name: 'Mallory\r\nInjected',
      email: 'mal@evil.com\n',
      message: 'Hi',
    });
    expect(errors).toBeUndefined();
    expect(data?.name).toBe('Mallory Injected');
    expect(data?.email).toBe('mal@evil.com');
  });
});
