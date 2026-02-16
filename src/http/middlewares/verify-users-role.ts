import type { ErrorResponse } from '@/src/@types/http-response'
import { verifyAuth, type AuthUser } from '@/src/auth'
import { standardError } from '@/src/utils/http-response'
import type { NextResponse } from 'next/server'

type UserRole = 'admin' | 'superadmin'

/**
 * Verifica se o usuario autenticado possui a role necessaria
 */
export async function verifyUserRole(requiredRole: UserRole): Promise<{
  user: AuthUser | null
  error?: NextResponse<ErrorResponse>
}> {
  const { user, error } = await verifyAuth()

  if (error || !user) {
    return { user: null, error }
  }

  if (user.superadmin) {
    return { user }
  }

  if (requiredRole === 'superadmin') {
    return {
      user: null,
      error: standardError('INSUFFICIENT_PERMISSIONS', 'Superadmin access required'),
    }
  }

  if (requiredRole === 'admin' && !user.admin) {
    return {
      user: null,
      error: standardError('INSUFFICIENT_PERMISSIONS', 'Admin access required'),
    }
  }

  return { user }
}
