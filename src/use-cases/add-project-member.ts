import { ProjectRole } from "../@types/project-role";
import { User } from "../@types/user";
import { ProjectMembersRepository } from "../repositories/project-members-repository";
import { ProjectRepository } from "../repositories/project-repository";
import { UsersRepository } from "../repositories/users-repository";
import { ConflictError } from "./errors/conflict-error";
import { InsufficientPermissionsError } from "./errors/insufficient-permissions-error";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface AddProjectMemberUseCaseRequest {
  user: User
  projectId: number
  userId: number
  role: ProjectRole
}

interface AddProjectMemberUseCaseResponse {
  member: {
    id: number
    projectId: number
    userId: number
    role: ProjectRole
    addedAt: Date
    user: {
      id: number
      nome: string
      sobrenome: string
      email: string
      foto: string | null
    }
  }
}

export class AddProjectMemberUseCase {
  constructor(
    private projectMembersRepository: ProjectMembersRepository,
    private projectRepository: ProjectRepository,
    private usersRepository: UsersRepository
  ) { }

  async execute({
    user,
    projectId,
    userId,
    role
  }: AddProjectMemberUseCaseRequest): Promise<AddProjectMemberUseCaseResponse> {
    // Parallel fetch of independent data for better performance
    const [project, userToAdd, existingMembership] = await Promise.all([
      this.projectRepository.findById(projectId),
      this.usersRepository.findById(userId),
      this.projectMembersRepository.findMembership(projectId, userId, 'direct'),
    ]);

    if (!project) throw new ResourceNotFoundError();
    if (!userToAdd) throw new ResourceNotFoundError();

    if (project.idempresa !== user.idempresa && !user.superadmin) {
      throw new InsufficientPermissionsError();
    }

    if (userToAdd.idempresa !== project.idempresa) {
      throw new InsufficientPermissionsError();
    }

    if (existingMembership) {
      throw new ConflictError('User is already a member of this project');
    }

    const member = await this.projectMembersRepository.create({
      projectId,
      userId,
      role,
      source: 'direct'
    })

    return {
      member: {
        id: member.id,
        projectId: member.projetoId,
        userId: member.usuarioId,
        role: member.role,
        addedAt: member.adicionadoEm,
        user: {
          id: userToAdd.id,
          nome: userToAdd.nome,
          sobrenome: userToAdd.sobrenome,
          email: userToAdd.email,
          foto: userToAdd.foto
        }
      }
    }
  }
}
