import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = DB.getUsers().map(u => {
      const { password, ...safeUser } = u;
      return safeUser;
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while fetching users' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, status } = await req.json();

    if (!userId || !status) {
      return NextResponse.json(
        { error: 'User ID and status are required' },
        { status: 400 }
      );
    }

    const updated = DB.updateUserStatus(userId, status);
    if (!updated) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { password, ...safeUser } = updated;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error('Update user status error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating user status' },
      { status: 500 }
    );
  }
}
