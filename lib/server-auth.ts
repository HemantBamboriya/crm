import crypto from 'crypto';
import { UserRole } from '@/lib/types';

export const AUTH_COOKIE_NAME = 'civiccrm_session';
const SESSION_DURATION_SECONDS = 60 * 60 * 24 * 7;

interface SessionTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  exp: number;
}

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error('Missing AUTH_SECRET environment variable');
  }
  return secret;
}

function toBase64Url(value: string) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function fromBase64Url(value: string) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function sign(unsignedToken: string) {
  return crypto.createHmac('sha256', getAuthSecret()).update(unsignedToken).digest('base64url');
}

export function createSessionToken(user: {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}) {
  const payload: SessionTokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  };

  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(token: string) {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as SessionTokenPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getSessionDurationSeconds() {
  return SESSION_DURATION_SECONDS;
}
