import type { Role } from '@prisma/client';

export const SESSION_COOKIE = 'aspira_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  role: Role;
  exp: number;
};

function getSecret() {
  return process.env.AUTH_SECRET || 'aspira-development-secret-key-32chars-min-2026';
}

function encode(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decode(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

async function sign(value: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value));
  return encode(String.fromCharCode(...new Uint8Array(signature)));
}

export async function createSessionToken(userId: string, role: Role) {
  const payload: SessionPayload = {
    userId,
    role,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE,
  };
  const encodedPayload = encode(JSON.stringify(payload));
  return `${encodedPayload}.${await sign(encodedPayload)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const expected = await sign(encodedPayload);
  if (signature.length !== expected.length) return null;
  let mismatch = 0;
  for (let i = 0; i < signature.length; i += 1) mismatch |= signature.charCodeAt(i) ^ expected.charCodeAt(i);
  if (mismatch !== 0) return null;

  try {
    const payload = JSON.parse(decode(encodedPayload)) as SessionPayload;
    if (!payload.userId || !payload.role || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_MAX_AGE,
};
