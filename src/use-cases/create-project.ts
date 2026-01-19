import { CreateProjectRequest, Project } from "../@types/project";
import { User } from "../@types/user";
import { ProjetoMemberRole } from "../generated/elo";
import { ProjectMembersRepository } from "../repositories/project-members-repository";
import { ProjectRepository } from "../repositories/project-repository";
import {
    validateDateRange,
    validateHexColor
} from "../utils/project-validation";
import {
    InvalidColorFormatError,
    InvalidDateRangeError,
    ProjectNameAlreadyExistsError
} from "./errors/project-errors";

interface CreateProjectUseCaseRequest {
  user: User
  data: CreateProjectRequest
}

interface CreateProjectUseCaseResponse {
  project: Project
}

export class CreateProjectUseCase {
  constructor(
    private projectRepository: ProjectRepository,
    private projectMembersRepository: ProjectMembersRepository
  ) { }

  async execute({
    user,
    data,
  }: CreateProjectUseCaseRequest): Promise<CreateProjectUseCaseResponse> {
    if (data.backgroundUrl && !validateHexColor(data.backgroundUrl)) {
      throw new InvalidColorFormatError();
    }

    if (!validateDateRange(data.dataInicio, data.dataFim)) {
      throw new InvalidDateRangeError();
    }

    const existingProject = await this.projectRepository.findByNameAndCompany(
      data.nome,
      user.idempresa!
    )

    if (existingProject) {
      throw new ProjectNameAlreadyExistsError();
    }

    const project = await this.projectRepository.create({
      ...data,
      ownerId: user.id,
      idempresa: user.idempresa!
    })

    await this.projectMembersRepository.create({
      projectId: project.id,
      userId: user.id,
      role: ProjetoMemberRole.owner
    })

    return { project }
  }
}
