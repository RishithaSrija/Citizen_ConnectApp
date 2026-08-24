import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const complaint = DB.getComplaintById(id);
    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Enforce role check
    if (user.role === 'citizen' && complaint.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ complaint });
  } catch (error) {
    console.error('Fetch complaint details error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching complaint details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = DB.getComplaintById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    // Citizen check: can only mark 'Closed'
    if (user.role === 'citizen') {
      if (body.status !== 'Closed') {
        return NextResponse.json({ error: 'Citizens are only allowed to close their own tickets' }, { status: 403 });
      }
      if (existing.userId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const updated = DB.updateComplaint(id, body);
    return NextResponse.json({ complaint: updated });
  } catch (error) {
    console.error('Update complaint error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the complaint' },
      { status: 500 }
    );
  }
}
