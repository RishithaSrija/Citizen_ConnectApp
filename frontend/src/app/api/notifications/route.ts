import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = DB.getNotificationsByUser(user.id);
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching notifications' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, all } = body;

    if (all) {
      DB.markAllNotificationsRead(user.id);
      return NextResponse.json({ success: true });
    }

    if (id) {
      const ok = DB.markNotificationRead(id);
      if (ok) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    return NextResponse.json({ error: 'Notification ID or all flag is required' }, { status: 400 });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating notifications' },
      { status: 500 }
    );
  }
}
