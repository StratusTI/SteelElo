import { User } from '@/src/@types/user';
import { NextResponse } from 'next/server';
import { verifyJWT } from './verify-jwt';

export async function verifyUserRole(
  requiredRole: 'admin' | 'superadmin'
): Promise<{ user: User | null; error?: NextResponse }> {
  const { user, error } = await verifyJWT()

  if (error) return { user: null, error }

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  if (requiredRole === 'superadmin' && !user.superadmin) {
    return {
      user: null,
      error: NextResponse.json(
        { message: 'Forbidden - Super Admin access required' },
        { status: 403 }
      )
    }
  }

  if (requiredRole === 'admin' && !user.admin) {
    return {
      user: null,
      error: NextResponse.json(
        { message: 'Forbidden - Admin access required' },
        { status: 403 }
      )
    }
  }

  return { user }
}
