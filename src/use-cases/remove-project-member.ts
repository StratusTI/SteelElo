import { User } from "../@types/user";
import { ProjectMembersRepository } from "../repositories/project-members-repository";
import { ProjectRepository } from "../repositories/project-repository";
import { InsufficientPermissionsError } from "./errors/insufficient-permissions-error";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface RemoveProjectMemberUseCaseRequest {
  user: User
  projectId: string
  userId: number
  force?: boolean // Para confirmar remoção mesmo com tarefas
}

interface RemoveProjectMemberUseCaseResponse {
  success: boolean
  message: string
  hasTasks?: boolean
  taskCount?: number
}

export class RemoveProjectMemberUseCase {
  constructor(
    private projectMembersRepository: ProjectMembersRepository,
    private projectRepository: ProjectRepository
  ) { }

  async execute({
    user,
    projectId,
    userId,
    force = false
  }: RemoveProjectMemberUseCaseRequest): Promise<RemoveProjectMemberUseCaseResponse> {
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

    if (membership.role === 'owner') {
      const ownerCount = await this.projectMembersRepository.countOwners(projectId)

      if (ownerCount <= 1) {
        throw new InsufficientPermissionsError(
          'Cannot remove the last owner. Assign another owner first'
        )
      }
    }


    // Por quanto, apenas remove (tarefas ficam órfãs)
    // const taskCount = await this.tasksRepository.countByProjectId(projectId)

    // if (!force && taskCount > 0) {
    //   return {
    //     success: false,
    //     message: 'Member has assigned tasks',
    //     hasTasks: true,
    //     taskCount
    //   }
    // }

    await this.projectMembersRepository.deleteByUserAndProject(
      userId,
      projectId,
      'direct'
    )

    return {
      success: true,
      message: 'Member removed successfully'
    }
  }
}
