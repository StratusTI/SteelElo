import { ProjectMember, ProjectRole } from "@/src/@types/project-role";
import { ProjectMembersRepository } from "../project-members-repository";

export class InMemoryProjectMembersRepository implements ProjectMembersRepository {
  public items: ProjectMember[] = []
  private idCounter = 1

  async findByUserAndProject(
    userId: number,
    projectId: number
  ): Promise<ProjectMember[]> {
    return this.items.filter(
      (item) => item.usuarioId === userId && item.projetoId === projectId
    )
  }

  async findByProject(projectId: number): Promise<ProjectMember[]> {
    return this.items.filter((item) => item.projetoId === projectId)
  }

  async create(data: {
    projectId: number
    userId: number
    role: ProjectRole
  }): Promise<ProjectMember> {
    const member: ProjectMember = {
      id: this.idCounter++,
      projetoId: data.projectId,
      usuarioId: data.userId,
      role: data.role,
      adicionadoEm: new Date(),
    }

    this.items.push(member)
    return member
  }

  async updateRole(id: number, role: ProjectRole): Promise<ProjectMember> {
    const member = this.items.find((item) => item.id === id)

    if (!member) {
      throw new Error('Member not found')
    }

    member.role = role

    return member
  }

  async delete(id: number): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id)

    if (index === -1) {
      throw new Error('Member not found')
    }

    this.items.splice(index, 1)
  }
}
