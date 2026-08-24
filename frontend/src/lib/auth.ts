import { cookies } from 'next/headers';
import { DB, User } from './db';

/**
 * Retrieves the currently authenticated user from the session cookie.
 * In Next.js, cookies() is asynchronous and must be awaited.
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('user_session');
    
    if (!session?.value) {
      return null;
    }

    const userData = JSON.parse(session.value) as { id: string };
    if (!userData || !userData.id) {
      return null;
    }

    const user = DB.getUserById(userData.id);
    if (!user || user.status !== 'active') {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}

/**
 * Sets the user session cookie.
 */
export async function setSession(user: User): Promise<void> {
  const cookieStore = await cookies();
  
  // Safe user representation (omit password)
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone
  };

  cookieStore.set('user_session', JSON.stringify(safeUser), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/'
  });
}

/**
 * Clears the session cookie.
 */
export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('user_session');
}
