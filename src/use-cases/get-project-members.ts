import { User } from "../@types/user";
import { ProjectMembersRepository, ProjectMemberWithUser } from "../repositories/project-members-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface GetProjectMembersUseCaseRequest {
  user: User
  projectId: string
}

interface GetProjectMembersUseCaseResponse {
  members: ProjectMemberWithUser[]
}

export class GetProjectMembersUseCase {
  constructor(
    private projectMembersRepository: ProjectMembersRepository
  ) { }

  async execute({
    user,
    projectId
  }: GetProjectMembersUseCaseRequest): Promise<GetProjectMembersUseCaseResponse> {
    const members = await this.projectMembersRepository.findByProjectWithUsers(projectId)

    if (members.length === 0) {
      throw new ResourceNotFoundError()
    }

    const sortedMembers = members.sort((a, b) => {
      if (a.role === 'owner' && b.role !== 'owner') return -1
      if (a.role !== 'owner' && b.role === 'owner') return 1

      const nameA = `${a.usuario.nome} ${a.usuario.sobrenome}`.toLowerCase()
      const nameB = `${b.usuario.nome} ${b.usuario.sobrenome}`.toLowerCase()

      return nameA.localeCompare(nameB)
    })

    return {
      members: sortedMembers
    }
  }
}
