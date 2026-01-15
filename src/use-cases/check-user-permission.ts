import { PermissionCheckResult, ProjectPermission, ProjectRole, ROLE_HIERARCHY, ROLE_PERMISSIONS } from "../@types/project-role";
import { User } from "../@types/user";
import { ProjectMembersRepository } from "../repositories/project-members-repository";
import { GetUserProjectRoleUseCase } from "./get-user-project-role";

interface CheckUserPermissionRequest {
  user: User
  projectId: number
  permission?: ProjectPermission,
  minimumRole?: ProjectRole,
}

export class CheckUserPermissionUseCase {
  constructor(private projectMembersRepository: ProjectMembersRepository) { }

  async execute({
    user,
    projectId,
    permission,
    minimumRole
  }: CheckUserPermissionRequest): Promise<PermissionCheckResult> {
    const getUserRole = new GetUserProjectRoleUseCase(
      this.projectMembersRepository
    )
    const { role, isUserSuperAdmin } = await getUserRole.execute({
      user,
      projectId
    })

    if (!role) {
      return {
        hasPermission: false,
        userRole: null,
        reason: 'User is not a member of this project'
      }
    }

    if (isUserSuperAdmin) {
      return {
        hasPermission: true,
        userRole: 'superadmin'
      }
    }

    if (minimumRole) {
      const userLevel = ROLE_HIERARCHY[role]
      const requiredLevel = ROLE_HIERARCHY[minimumRole]
      const hasPermission = userLevel >= requiredLevel

      return {
        hasPermission,
        userRole: role,
        reason: hasPermission
          ? undefined
          : `Role '${role}' is below required '${minimumRole}'`
      }
    }

    if (permission) {
      const userPermissions = ROLE_PERMISSIONS[role]
      const hasPermission = userPermissions.includes(permission)

      return {
        hasPermission,
        userRole: role,
        reason: hasPermission
          ? undefined
          : `Role '${role}' does not have permission '${permission}'`
      }
    }

    return {
      hasPermission: true,
      userRole: role
    }
  }
}
