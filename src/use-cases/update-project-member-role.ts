import { ProjectRole } from "../@types/project-role";
import { User } from "../@types/user";
import { ProjectMembersRepository } from "../repositories/project-members-repository";
import { ProjectRepository } from "../repositories/project-repository";
import { InsufficientPermissionsError } from "./errors/insufficient-permissions-error";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface UpdateProjectMemberRoleUseCaseRequest {
  user: User
  projectId: string
  userId: number
  newRole: ProjectRole
}

interface UpdateProjectMemberRoleUseCaseResponse {
  member: {
    id: string
    projectId: string
    userId: number
    role: ProjectRole,
    addedAt: Date
  }
}

export class UpdateProjectMemberRoleUseCase {
  constructor(
    private readonly projectMembersRepository: ProjectMembersRepository,
    private readonly projectRepository: ProjectRepository
  ) { }

  async execute({
    user,
    projectId,
    userId,
    newRole
  }: UpdateProjectMemberRoleUseCaseRequest): Promise<UpdateProjectMemberRoleUseCaseResponse> {
    const project = await this.projectRepository.findById(projectId)

    if (!project) throw new ResourceNotFoundError()

    if (project.idempresa !== user.idempresa && !user.superadmin) {
      throw new InsufficientPermissionsError()
    }

    const membership = await this.projectMembersRepository.findMembership(
      projectId,
      userId,
      'direct'
    )

    if (!membership) throw new ResourceNotFoundError()

    if (membership.role === 'owner' && newRole !== 'owner') {
      const ownerCount = await this.projectMembersRepository.countOwners(projectId)

      if (ownerCount <= 1) {
        throw new InsufficientPermissionsError(
          'Cannot change role of the last owner. Add another owner first.'
        )
      }
    }

    const updatedMember = await this.projectMembersRepository.updateRole(
      membership.id,
      newRole
    )

    return {
      member: {
        id: updatedMember.id,
        projectId: updatedMember.projetoId,
        userId: updatedMember.usuarioId,
        role: updatedMember.role,
        addedAt: updatedMember.adicionadoEm
      }
    }
  }
}
