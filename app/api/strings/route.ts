import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureDbSetup, createLiveString, listLiveStrings, findUserById } from '@/lib/server-data';
import { AUTH_COOKIE_NAME, verifySessionToken } from '@/lib/server-auth';

export const runtime = 'nodejs';

const createStringSchema = z.object({
  value: z.string().trim().min(1).max(500),
});

export async function GET(request: Request) {
  try {
    await ensureDbSetup();
    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get('limit') ?? '20');
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(limitParam, 100)) : 20;

    const items = await listLiveStrings(limit);
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: 'Failed to list strings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbSetup();
    const body = await request.json();
    const parsed = createStringSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid string payload' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const payload = token ? verifySessionToken(token) : null;
    const user = payload ? await findUserById(payload.sub) : null;

    const item = await createLiveString(parsed.data.value, user ? { id: user.id, name: user.name } : undefined);
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create string' }, { status: 500 });
  }
}
