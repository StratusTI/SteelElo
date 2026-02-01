import { User } from "@/src/@types/user";
import { prismaSteel } from "@/src/lib/prisma";
import { SearchUsersParams, UpdateUserProfileParams, UsersRepository } from "../users-repository";

export class PrismaUsersRepository implements UsersRepository {
  private mapToUser(user: any): User {
    return {
      id: user.id,
      nome: user.nome ?? '',
      sobrenome: user.sobrenome ?? '',
      username: user.username ?? '',
      email: user.email ?? '',
      foto: user.foto ?? '',
      telefone: user.telefone ?? '',
      admin: user.admin ?? false,
      superadmin: user.superadmin ?? false,
      idempresa: user.idempresa ?? null,
      empresa: user.empresa?.nome ?? '',
      departamento: user.departamento ?? null,
      time: user.time ?? '',
      online: user.online
    }
  }

  async findById(id: number): Promise<User | null> {
    const user = await prismaSteel.usuario.findUnique({
      where: { id },
      include: { empresa: { select: { nome: true } } }
    })

    if (!user || !user.email) return null

    return this.mapToUser(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prismaSteel.usuario.findUnique({
      where: { email },
      include: { empresa: { select: { nome: true } } }
    })

    if (!user || !user.email) return null

    return this.mapToUser(user)
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await prismaSteel.usuario.findUnique({
      where: { username },
      include: { empresa: { select: { nome: true } } }
    })

    if (!user || !user.email) return null

    return this.mapToUser(user)
  }

  async updateProfile(params: UpdateUserProfileParams): Promise<User | null> {
    const { userId, ...data } = params

    const updateData: any = {}
    if (data.nome !== undefined) updateData.nome = data.nome
    if (data.sobrenome !== undefined) updateData.sobrenome = data.sobrenome
    if (data.username !== undefined) updateData.username = data.username

    const user = await prismaSteel.usuario.update({
      where: { id: userId },
      data: updateData,
      include: { empresa: { select: { nome: true } } }
    })

    if (!user || !user.email) return null

    return this.mapToUser(user)
  }

  async searchByCompany(params: SearchUsersParams): Promise<User[]> {
    const where: any = {
      idempresa: params.companyId,
      email: {
        not: null
      }
    }

    if (params.query && params.query.length >= 2) {
      where.OR = [
        { nome: { contains: params.query } },
        { sobrenome: { contains: params.query } },
        { email: { contains: params.query } },
        { username: { contains: params.query } }
      ]
    }

    const users = await prismaSteel.usuario.findMany({
      where,
      take: params.limit || 10,
      orderBy: [
        { nome: 'asc' },
        { sobrenome: 'asc'}
      ],
      include: { empresa: { select: { nome: true } } }
    })

    let filteredUsers = users

    if (params.excludeProjectId) {
      const { prismaElo } = await import('@/src/lib/prisma')

      const projectMember = await prismaElo.projetoMembro.findMany({
        where: { projetoId: params.excludeProjectId },
        select: { usuarioId: true }
      })

      const memberIds = projectMember.map(m => m.usuarioId)
      filteredUsers = filteredUsers.filter(u => !memberIds.includes(u.id))
    }

    return filteredUsers.map(user => this.mapToUser(user))
  }

  async countByCompany(companyId: number): Promise<number> {
    return prismaSteel.usuario.count({
      where: {
        idempresa: companyId,
        email: { not: null }
      }
    })
  }
}
