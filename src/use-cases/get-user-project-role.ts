import { ProjectRole, ROLE_HIERARCHY } from '../@types/project-role';
import { User } from '../@types/user';
import { ProjectMembersRepository } from "../repositories/project-members-repository";

interface GetUserProjectRoleRequest {
  user: User
  projectId: number
}

interface GetUserProjectRoleResponse {
  role: ProjectRole | null
  isUserSuperAdmin: boolean
}

export class GetUserProjectRoleUseCase {
  constructor(
    private projectMembersRepository: ProjectMembersRepository
  ) { }

  async execute({
    user,
    projectId,
  }: GetUserProjectRoleRequest): Promise<GetUserProjectRoleResponse> {
    if (user.superadmin) {
      return {
        role: 'superadmin',
        isUserSuperAdmin: true
      }
    }

    const memberships = await this.projectMembersRepository.findByUserAndProject(
      user.id,
      projectId
    )

    if (memberships.length === 0) {
      return {
        role: null,
        isUserSuperAdmin: false
      }
    }

    const mostPermissiveRole = memberships.reduce((highest, current) => {
      const currentLevel = ROLE_HIERARCHY[current.role]
      const highestLevel = ROLE_HIERARCHY[highest.role]

      return currentLevel > highestLevel ? current : highest
    }, memberships[0])

    return {
      role: mostPermissiveRole.role,
      isUserSuperAdmin: false
    }
  }
}
