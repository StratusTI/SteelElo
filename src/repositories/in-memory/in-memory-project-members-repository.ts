import { createId } from '@paralleldrive/cuid2';
import { ProjectMember, ProjectRole } from "@/src/@types/project-role";
import { ProjectMembersRepository, ProjectMemberWithUser } from "../project-members-repository";

export class InMemoryProjectMembersRepository implements ProjectMembersRepository {
  public items: ProjectMember[] = []
  public users: Array<{
    id: number
    nome: string
    sobrenome: string
    email: string
    foto: string | null
  }> = []

  async findByUserAndProject(userId: number, projectId: string): Promise<ProjectMember[]> {
    return this.items.filter(
      (item) => item.usuarioId === userId && item.projetoId === projectId
    )
  }

  async findByProject(projectId: string): Promise<ProjectMember[]> {
    return this.items.filter((item) => item.projetoId === projectId)
  }

  async findByProjectWithUsers(projectId: string): Promise<ProjectMemberWithUser[]> {
    const members = this.items.filter((item) => item.projetoId === projectId)

    return members.map(member => {
      const user = this.users.find(u => u.id === member.usuarioId)

      if (!user) throw new Error(`User ${member.usuarioId} not found`)

      return {
        ...member,
        usuario: user
      }
    })
  }

  async countOwners(projectId: string): Promise<number> {
    return this.items.filter(
      (item) => item.projetoId === projectId && item.role === 'owner'
    ).length
  }

  async findMembership(projectId: string, userId: number, source?: string): Promise<ProjectMember | null> {
    const membership = this.items.find(
      (item) =>
        item.projetoId === projectId &&
        item.usuarioId === userId &&
        item.source === source
    )

    return membership || null
  }

  async create(data: { projectId: string; userId: number; role: ProjectRole; source?: string; }): Promise<ProjectMember> {
    const member: ProjectMember = {
      id: createId(),
      projetoId: data.projectId,
      usuarioId: data.userId,
      role: data.role,
      source: data.source || 'direct',
      adicionadoEm: new Date()
    }

    this.items.push(member)
    return member
  }

  async updateRole(id: string, role: ProjectRole): Promise<ProjectMember> {
    const member = this.items.find((item) => item.id === id)

    if (!member) throw new Error('Member not found')

    member.role = role

    return member
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((item) => item.id === id)

    if (index === -1) {
      throw new Error('Member not found')
    }

    this.items.splice(index, 1)
  }


  async deleteByUserAndProject(userId: number, projectId: string, source?: string): Promise<void> {
    const index = this.items.findIndex(
      (item) =>
        item.projetoId === projectId &&
        item.usuarioId === userId &&
        item.source === source
    )

    if (index === -1) throw new Error('Membership not found')

    this.items.splice(index, 1)
  }
}
