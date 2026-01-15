import type { ErrorResponse } from "@/src/@types/http-response";
import { User } from "@/src/@types/user";
import { standardError } from "@/src/utils/http-response";
import { NextResponse } from "next/server";
import { verifyJWT } from "./verify-jwt";

type UserRole = 'admin' | 'superadmin'

/**
 * Verifica se o usuário autenticado possui a role necessária
 *
 * @param requiredRole - 'admin' (admin ou superadmin) | 'superadmin' (apenas superadmin)
 * @returns { user, error? }
 */
export async function verifyUserRole(
  requiredRole: UserRole,
): Promise<{
  user: User | null
  error?: NextResponse<ErrorResponse>
}> {
  const { user, error } = await verifyJWT()

  if (error || !user) {
    return { user: null, error }
  }

  if (user?.superadmin) return { user }

  if (requiredRole === 'superadmin') {
    return {
      user: null,
      error: standardError(
        'INSUFFICIENT_PERMISSIONS',
        'Superadmin access required'
      )
    }
  }

  if (requiredRole === 'admin') {
    return {
      user: null,
      error: standardError(
        'INSUFFICIENT_PERMISSIONS',
        'Admin access required'
      )
    }
  }

  return { user}
}
