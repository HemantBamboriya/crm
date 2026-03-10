import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureDbSetup, createUser } from '@/lib/server-data';
import { hashPassword } from '@/lib/password';

export const runtime = 'nodejs';

const registerSchema = z
  .object({
    name: z.string().trim().min(2).max(80),
    email: z.string().email(),
    password: z.string().min(6).max(128),
    role: z.enum(['citizen', 'employee', 'admin']),
    location: z.string().trim().min(2).max(200),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    department: z.string().trim().min(2).max(120).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.role === 'employee' && !value.department) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['department'],
        message: 'Department is required for employees',
      });
    }
  });

export async function POST(request: Request) {
  try {
    await ensureDbSetup();
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid registration payload' }, { status: 400 });
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const result = await createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      passwordHash,
      location: parsed.data.location,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      department: parsed.data.role === 'employee' ? parsed.data.department : undefined,
    });

    if (!result.created) {
      return NextResponse.json({ error: 'User already exists for this role' }, { status: 409 });
    }

    return NextResponse.json({ user: result.user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
