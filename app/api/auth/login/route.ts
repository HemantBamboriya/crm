import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSessionToken, AUTH_COOKIE_NAME, getSessionDurationSeconds } from '@/lib/server-auth';
import { ensureDbSetup, findAuthUserByEmailAndRole, serializeUser } from '@/lib/server-data';
import { verifyPassword } from '@/lib/password';

export const runtime = 'nodejs';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1).max(128),
  role: z.enum(['citizen', 'employee', 'admin']),
});

export async function POST(request: Request) {
  try {
    await ensureDbSetup();
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid login payload' }, { status: 400 });
    }

    const authUser = await findAuthUserByEmailAndRole(parsed.data.email, parsed.data.role);
    if (!authUser || !authUser.passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = await verifyPassword(parsed.data.password, authUser.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = serializeUser(authUser);
    const token = createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: getSessionDurationSeconds(),
    });

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
