import { Project } from "../@types/project";
import { User } from "../@types/user";
import { ProjectRepository } from "../repositories/project-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface GetProjectsDetailsUseCaseRequest {
  user: User
  projectId: number
}

interface GetProjectsDetailsUseCaseResponse {
  project: Project
}

export class GetProjectDetailsUseCase {
  constructor(private projectRepository: ProjectRepository) {}

  async execute({ user, projectId }: GetProjectsDetailsUseCaseRequest): Promise<GetProjectsDetailsUseCaseResponse> {
    const project = await this.projectRepository.findById(projectId)

    if (!project) {
      throw new ResourceNotFoundError()
    }

    if (!user.superadmin) {
      const isMember = await this.projectRepository.isUserMember(
        projectId,
        user.id
      )

      if (!isMember) {
        throw new ResourceNotFoundError()
      }
    }

    return { project }
  }
}
