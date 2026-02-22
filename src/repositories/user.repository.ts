import type { Role, User } from '@prisma/client'
import { prisma } from '@/src/lib/prisma'
import { type Result, ok, err } from '@/src/lib/result'
import { ConflictError, DatabaseError, NotFoundError } from '@/src/errors'

export const UserRepository = {
  async findById(id: string): Promise<Result<User>> {
    try {
      const user = await prisma.user.findUnique({ where: { id } })

      if (!user) {
        return err(new NotFoundError('User'))
      }

      return ok(user)
    } catch {
      return err(new DatabaseError('Failed to find user by id'))
    }
  },

  async findByEmail(email: string): Promise<Result<User | null>> {
    try {
      const user = await prisma.user.findUnique({ where: { email } })
      return ok(user)
    } catch {
      return err(new DatabaseError('Failed to find user by email'))
    }
  },

  async create(data: {
    name: string
    email: string
    password: string
    role?: Role
    workspaceId?: string
  }): Promise<Result<User>> {
    try {
      const user = await prisma.user.create({ data })
      return ok(user)
    } catch (error) {
      if (
        error instanceof Error &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        return err(new ConflictError('E-mail já está em uso'))
      }
      return err(new DatabaseError('Failed to create user'))
    }
  },

  async update(
    id: string,
    data: { name?: string; email?: string },
  ): Promise<Result<User>> {
    try {
      const user = await prisma.user.update({ where: { id }, data })
      return ok(user)
    } catch {
      return err(new DatabaseError('Failed to update user'))
    }
  },
}
