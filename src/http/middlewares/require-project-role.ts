import { ProjectPermission, ProjectRole } from "@/src/@types/project-role"
import { makeCheckUserPermissionUseCase } from "@/src/use-cases/factories/make-check-user-permission"
import { standardError } from "@/src/utils/http-response"
import { verifyJWT, VerifyJWTResult } from "./verify-jwt"

interface RequireProjectRoleOptions {
  projectId: number
  minimumRole?: ProjectRole
  permission?: ProjectPermission
}

interface RequireProjectRoleResult extends VerifyJWTResult{
  userRole: ProjectRole | null
}

/**
 * Middleware: Valida se usuário tem permissão para acessar projeto
 *
 * @param options.projectId - ID do projeto
 * @param options.minimumRole - Role mínima necessária (hierárquico)
 * @param options.permission - Permissão específica necessária
 *
 * @example
 * // Requer no mínimo role 'member'
 * const { user, error } = await requireProjectRole({ projectId: 1, minimumRole: 'member' })
 *
 * @example
 * // Requer permissão específica 'edit_any_task'
 * const { user, error } = await requireProjectRole({ projectId: 1, permission: 'edit_any_task' })
 */
export async function requireProjectRole(
   options: RequireProjectRoleOptions
): Promise<RequireProjectRoleResult> {
  const { projectId, minimumRole, permission } = options

  const { user, error: authError } = await verifyJWT()

  if (authError || !user) {
    return {
      user: null,
      userRole: null,
      error: authError
    }
  }

  try {
    const checkPermission = makeCheckUserPermissionUseCase()

    const result = await checkPermission.execute({
      user,
      projectId,
      minimumRole,
      permission
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
            requiredPermission: permission
          }
        )
      }
    }

    return {
      user,
      userRole: result.userRole
    }
  } catch (err) {
    console.error('[requireProjectRole] Unexpected error:', err)
    return {
      user: null,
      userRole: null,
      error: standardError('INTERNAL_SERVER_ERROR', 'Failed to check permissions')
    }
  }
 }
