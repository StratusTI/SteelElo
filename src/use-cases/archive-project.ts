import { ProjectRole } from "../@types/project-role";
import { User } from "../@types/user";
import { ProjectRepository } from "../repositories/project-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface ArchiveProjectUseCaseRequest {
  user: User
  userRole: ProjectRole
  projectId: number
}

interface ArchiveProjectUseCaseResponse {
  success: boolean
}

export class ArchiveProjectUseCase {
  constructor(private projectRepository: ProjectRepository) { }

  async execute({
    projectId
  }: ArchiveProjectUseCaseRequest): Promise<ArchiveProjectUseCaseResponse> {
    const project = await this.projectRepository.findById(projectId)

    if (!project) {
      throw new ResourceNotFoundError()
    }

    await this.projectRepository.archive(projectId)

    return { success: true }
  }
}
