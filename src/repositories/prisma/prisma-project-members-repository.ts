import { ProjectMember, ProjectRole } from "@/src/@types/project-role";
import { prismaElo } from "@/src/lib/prisma";
import { ProjectMembersRepository } from "../project-members-repository";

export class PrismaProjectMembersRepository implements ProjectMembersRepository {
  async findByUserAndProject(userId: number, projectId: number): Promise<ProjectMember[]> {
    const members = await prismaElo.projetoMembro.findMany({
      where: {
        usuarioId: userId,
        projetoId: projectId
        }
      })

    return members.map((member) => ({
      id: member.id,
      projetoId: member.projetoId,
      usuarioId: member.usuarioId,
      role: (member.role as ProjectRole) ?? 'member',
      adicionadoEm: member.adicionadoEm ?? new Date()
    }))
  }

  async findByProject(projectId: number): Promise<ProjectMember[]> {
    const members = await prismaElo.projetoMembro.findMany({
      where: {
        projetoId: projectId,
      }
    })

    return members.map((member) => ({
      id: member.id,
      projetoId: member.projetoId,
      usuarioId: member.usuarioId,
      role: (member.role as ProjectRole) ?? 'member',
      adicionadoEm: member.adicionadoEm ?? new Date()
    }))
  }

  async create(data: {
    projectId: number,
    userId: number,
    role: ProjectRole
  }): Promise<ProjectMember> {
    const member = await prismaElo.projetoMembro.create({
      data: {
        projetoId: data.projectId,
        usuarioId: data.userId,
        role: data.role as any // Cast para enum do Prisma
      }
    })

    return {
      id: member.id,
      projetoId: member.projetoId,
      usuarioId: member.usuarioId,
      role: (member.role as ProjectRole) ?? 'member',
      adicionadoEm: member.adicionadoEm ?? new Date()
    }
  }

  async updateRole(id: number, role: ProjectRole): Promise<ProjectMember> {
    const member = await prismaElo.projetoMembro.update({
      where: { id },
      data: { role: role as any }
    })

    return {
      id: member.id,
      projetoId: member.projetoId,
      usuarioId: member.usuarioId,
      role: (member.role as ProjectRole) ?? 'member',
      adicionadoEm: member.adicionadoEm ?? new Date()
    }
  }

  async delete(id: number): Promise<void> {
    await prismaElo.projetoMembro.delete({
      where: { id }
    })
  }
}
