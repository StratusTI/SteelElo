import bcrypt from 'bcryptjs'
import { ConflictError } from '@/src/errors'
import { type Result, ok, err } from '@/src/lib/result'
import { UserRepository } from '@/src/repositories/user.repository'
import { UserCache } from '@/src/cache/user.cache'
import { toUserDTO } from '@/src/mappers/user.mapper'
import type { CreateUserDTO, UpdateUserDTO } from '@/src/schemas/user.schema'
import type { UserDTO } from '@/types/user'

export const UserService = {
  async create(dto: CreateUserDTO): Promise<Result<UserDTO>> {
    const existingResult = await UserRepository.findByEmail(dto.email)
    if (!existingResult.ok) return existingResult

    if (existingResult.value) {
      return err(new ConflictError('E-mail já está em uso'))
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10)

    const result = await UserRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: dto.role as import('@prisma/client').Role | undefined,
    })
    if (!result.ok) return result

    const userDTO = toUserDTO(result.value)
    return ok(userDTO)
  },
  async getProfile(actorId: string): Promise<Result<UserDTO>> {
    const cached = await UserCache.get(actorId)
    if (cached) return ok(cached)

    const result = await UserRepository.findById(actorId)
    if (!result.ok) return result

    const userDTO = toUserDTO(result.value)
    await UserCache.set(actorId, userDTO)

    return ok(userDTO)
  },

  async updateProfile(
    actorId: string,
    dto: UpdateUserDTO,
  ): Promise<Result<UserDTO>> {
    if (dto.email) {
      const existingResult = await UserRepository.findByEmail(dto.email)
      if (!existingResult.ok) return existingResult

      if (existingResult.value && existingResult.value.id !== actorId) {
        return err(new ConflictError('E-mail já está em uso'))
      }
    }

    const result = await UserRepository.update(actorId, dto)
    if (!result.ok) return result

    const userDTO = toUserDTO(result.value)
    await UserCache.invalidate(actorId)

    return ok(userDTO)
  },
}
