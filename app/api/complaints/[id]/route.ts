import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  claimComplaint,
  ensureDbSetup,
  findComplaintById,
  resolveComplaint,
  updateComplaintCitizenReport,
  updateComplaintEmployeeProgress,
} from '@/lib/server-data';
import { getSessionUser } from '@/lib/server-session';

export const runtime = 'nodejs';

const citizenUpdateSchema = z.object({
  actor: z.literal('citizen'),
  location: z.string().trim().min(2).max(300).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  image: z.string().max(2_000_000).optional(),
});

const employeeUpdateSchema = z.object({
  actor: z.literal('employee'),
  action: z.enum(['claim', 'update', 'resolve']).optional(),
  status: z.enum(['Open', 'In Progress', 'Resolved']).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  note: z.string().trim().min(2).max(500).optional(),
});

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbSetup();
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const complaint = await findComplaintById(id);
    if (!complaint) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ complaint });
  } catch {
    return NextResponse.json({ error: 'Failed to load complaint' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await ensureDbSetup();
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const existing = await findComplaintById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await request.json();

    if (user.role === 'citizen') {
      if (existing.citizenId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const parsed = citizenUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
      }

      const complaint = await updateComplaintCitizenReport(id, {
        location: parsed.data.location,
        latitude: parsed.data.latitude,
        longitude: parsed.data.longitude,
        image: parsed.data.image,
      });

      return NextResponse.json({ complaint });
    }

    if (user.role === 'employee' || user.role === 'admin') {
      const parsed = employeeUpdateSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
      }

      if (parsed.data.action === 'claim') {
        const complaint = await claimComplaint({
          complaintId: id,
          userId: user.id,
          employeeName: user.name,
          department: user.department,
        });

        if (!complaint) {
          return NextResponse.json({ error: 'Task cannot be claimed' }, { status: 409 });
        }

        return NextResponse.json({ complaint });
      }

      if (parsed.data.action === 'resolve') {
        const complaint = await resolveComplaint(id, {
          id: user.id,
          name: user.name,
        });

        if (!complaint) {
          return NextResponse.json({ error: 'Issue cannot be resolved' }, { status: 409 });
        }

        return NextResponse.json({ complaint });
      }

      if (user.role === 'employee' && existing.assignedEmployeeId !== user.id) {
        return NextResponse.json({ error: 'Only the assigned employee can update this task' }, { status: 403 });
      }

      const complaint = await updateComplaintEmployeeProgress(
        id,
        { id: user.id, name: user.name },
        {
          status: parsed.data.status,
          latitude: parsed.data.latitude,
          longitude: parsed.data.longitude,
          note: parsed.data.note,
        }
      );

      return NextResponse.json({ complaint });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch {
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 });
  }
}
