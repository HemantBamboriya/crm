import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ComplaintCategory, ComplaintPriority } from '@/lib/types';
import {
  createComplaint,
  ensureDbSetup,
  listAvailableEmployeeComplaints,
  listComplaints,
  listEmployeeComplaints,
} from '@/lib/server-data';
import { getSessionUser } from '@/lib/server-session';

export const runtime = 'nodejs';

const createComplaintSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(10).max(2000),
  category: z.enum(['Road', 'Water', 'Electricity', 'Sanitation', 'Parks', 'Utilities', 'Other']),
  priority: z.enum(['Critical', 'Medium', 'Low']),
  location: z.string().trim().min(3).max(300),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  images: z.array(z.string().max(2_000_000)).max(3).optional(),
});

export async function GET(request: Request) {
  try {
    await ensureDbSetup();
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const requestedScope = searchParams.get('scope');
    const scope =
      requestedScope === 'all' || requestedScope === 'mine' || requestedScope === 'employee'
        ? requestedScope
        : user.role === 'citizen'
          ? 'mine'
          : 'employee';

    if (scope === 'mine' && user.role !== 'citizen') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (scope === 'employee' && user.role !== 'employee' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const items =
      scope === 'employee' && user.role === 'employee'
        ? await listEmployeeComplaints({
            userId: user.id,
          })
        : await listComplaints(scope, user.id);
    const availableItems =
      scope === 'employee' && user.role === 'employee'
        ? await listAvailableEmployeeComplaints({
          })
        : [];
    const allItems =
      scope === 'employee' && user.role === 'employee'
        ? await listComplaints('all', user.id)
        : [];
    return NextResponse.json({ items, availableItems, allItems });
  } catch {
    return NextResponse.json({ error: 'Failed to load complaints' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await ensureDbSetup();
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'citizen') {
      return NextResponse.json({ error: 'Only citizens can report issues' }, { status: 403 });
    }

    const body = await request.json();
    const parsed = createComplaintSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid complaint payload' }, { status: 400 });
    }

    const complaint = await createComplaint({
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category as ComplaintCategory,
      priority: parsed.data.priority as ComplaintPriority,
      location: parsed.data.location,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
      images: parsed.data.images,
      citizenId: user.id,
    });

    return NextResponse.json({ complaint }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 });
  }
}
