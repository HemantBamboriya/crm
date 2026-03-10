import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/server-auth';
import { ensureDbSetup, findUserById } from '@/lib/server-data';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await ensureDbSetup();
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false });
    }

    const payload = verifySessionToken(token);
    if (!payload) {
      cookieStore.delete(AUTH_COOKIE_NAME);
      return NextResponse.json({ authenticated: false });
    }

    const user = await findUserById(payload.sub);
    if (!user) {
      cookieStore.delete(AUTH_COOKIE_NAME);
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({ authenticated: true, user });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
