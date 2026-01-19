import { Project, ProjectFilters } from "../@types/project"
import { User } from "../@types/user"
import { ProjectRepository } from "../repositories/project-repository"

interface GetProjectsUseCaseRequest {
  user: User
  filters: ProjectFilters
}

interface GetProjectsUseCaseResponse {
  projects: Project[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class GetProjectsUseCase {
  constructor(private projectRepository: ProjectRepository) { }

  async execute({
    user,
    filters
  }: GetProjectsUseCaseRequest): Promise<GetProjectsUseCaseResponse> {
    const isSuperadmin = user.superadmin

    const { projects, total } = await this.projectRepository.findMany(
      filters,
      user.id,
      isSuperadmin
    )

    const page = filters.page || 1
    const limit = filters.limit || 10
    const totalPages = Math.ceil(total / limit)

    return {
      projects,
      total,
      page,
      limit,
      totalPages
    }
  }
}
