import { NextRequest, NextResponse } from 'next/server';
import { DB } from '@/lib/db';
import { setSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, phone } = await req.json();

    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'Name, email, password, and phone number are required' },
        { status: 400 }
      );
    }

    const existing = DB.getUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 400 }
      );
    }

    const newUser = DB.createUser({
      name,
      email: email.toLowerCase(),
      password,
      role: 'citizen',
      phone,
      status: 'active'
    });

    await setSession(newUser);

    const { password: _, ...safeUser } = newUser;
    return NextResponse.json({ user: safeUser }, { status: 201 });
  } catch (error) {
    console.error('Registration route error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during registration' },
      { status: 500 }
    );
  }
}
