import { ProjectMember, ProjectRole } from "../@types/project-role";

export interface ProjectMemberWithUser extends ProjectMember {
  usuario: {
    id: number
    nome: string
    sobrenome: string
    email: string
    foto: string | null
  }
}

export interface ProjectMembersRepository {
  findByUserAndProject(userId: number, projectId: string): Promise<ProjectMember[]>
  findByProject(projectId: string): Promise<ProjectMember[]>
  findByProjectWithUsers(projectId: string): Promise<ProjectMemberWithUser[]>
  countOwners(projectId: string): Promise<number>
  findMembership(projectId: string, userId: number, source?: string): Promise<ProjectMember | null>
  create(data: {
    projectId: string,
    userId: number,
    role: ProjectRole,
    source?: string
  }): Promise<ProjectMember>
  updateRole(id: string, role: ProjectRole): Promise<ProjectMember>
  delete(id: string): Promise<void>
  deleteByUserAndProject(userId: number, projectId: string, source?: string): Promise<void>
}
