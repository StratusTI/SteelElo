import { Project, UpdateProjectRequest } from "../@types/project";
import { ProjectRole } from "../@types/project-role";
import { User } from "../@types/user";
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
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface UpdateProjectUsecaseRequest {
  user: User
  userRole: ProjectRole
  projectId: number
  data: UpdateProjectRequest
}

interface UpdateProjectUseCaseResponse {
  project: Project
}

export class UpdateProjectUseCase {
  constructor(private projectRepository: ProjectRepository) { }

  async execute({
    user,
    userRole,
    projectId,
    data
  }: UpdateProjectUsecaseRequest): Promise<UpdateProjectUseCaseResponse> {
    const project = await this.projectRepository.findById(projectId)

    if (!project) {
      throw new ResourceNotFoundError();
    }

    if (data.backgroundUrl && !validateHexColor(data.backgroundUrl)) {
      throw new InvalidColorFormatError();
    }

    const newDataInicio = data.dataInicio ?? project.dataInicio
    const newDataFim = data.dataFim ?? project.dataFim

    if (!validateDateRange(newDataInicio, newDataFim)) {
      throw new InvalidDateRangeError();
    }

    if (data.nome && data.nome !== project.nome) {
      const existingProject =
        await this.projectRepository.findByNameAndCompany(
          data.nome,
          user.idempresa!
        )

      if (existingProject && existingProject.id !== project.id) {
        throw new ProjectNameAlreadyExistsError();
      }
    }

    const updateProject = await this.projectRepository.update(projectId, data)

    return { project: updateProject }
  }
}
