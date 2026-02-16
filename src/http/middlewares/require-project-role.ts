import type { ErrorResponse } from '@/src/@types/http-response'
import { ProjectPermission, ProjectRole } from '@/src/@types/project-role'
import { verifyAuth, type AuthUser } from '@/src/auth'
import { makeCheckUserPermissionUseCase } from '@/src/use-cases/factories/make-check-user-permission'
import { standardError } from '@/src/utils/http-response'
import type { NextResponse } from 'next/server'

interface RequireProjectRoleOptions {
  projectId: string
  minimumRole?: ProjectRole
  permission?: ProjectPermission
}

interface RequireProjectRoleResult {
  user: AuthUser | null
  userRole: ProjectRole | null
  error?: NextResponse<ErrorResponse>
}

/**
 * Middleware: Valida se usuario tem permissao para acessar projeto
 */
export async function requireProjectRole(
  options: RequireProjectRoleOptions
): Promise<RequireProjectRoleResult> {
  const { projectId, minimumRole, permission } = options

  const { user: authUser, error: authError } = await verifyAuth()

  if (authError || !authUser) {
    return {
      user: null,
      userRole: null,
      error: authError,
    }
  }

  try {
    const checkPermission = makeCheckUserPermissionUseCase()

    // Criar objeto User parcial com campos necessarios para o use case
    const userForPermission = {
      id: authUser.id,
      superadmin: authUser.superadmin,
      admin: authUser.admin,
      email: authUser.email,
      nome: '',
      sobrenome: '',
      username: '',
      foto: '',
      telefone: '',
      idempresa: authUser.enterpriseId,
      empresa: '',
      departamento: null,
      time: null,
      online: false,
    }

    const result = await checkPermission.execute({
      user: userForPermission,
      projectId,
      minimumRole,
      permission,
    })

    if (!result.hasPermission) {
      return {
        user: null,
        userRole: result.userRole,
        error: standardError(
          'INSUFFICIENT_PERMISSIONS',
          result.reason || 'You do not have permission to perform this action',
          {
            projectId,
            userRole: result.userRole,
            requiredRole: minimumRole,
            requiredPermission: permission,
          }
        ),
      }
    }

    return {
      user: authUser,
      userRole: result.userRole,
    }
  } catch (err) {
    console.error('[requireProjectRole] Unexpected error:', err)
    return {
      user: null,
      userRole: null,
      error: standardError('INTERNAL_SERVER_ERROR', 'Failed to check permissions'),
    }
  }
}
