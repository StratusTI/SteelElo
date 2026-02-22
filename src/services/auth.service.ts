import bcrypt from 'bcryptjs'
import { UnauthorizedError } from '@/src/errors'
import { type Result, ok, err } from '@/src/lib/result'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/src/lib/jwt'
import { UserRepository } from '@/src/repositories/user.repository'
import { UserCache } from '@/src/cache/user.cache'
import { SessionCache } from '@/src/cache/session.cache'
import { toUserDTO } from '@/src/mappers/user.mapper'
import type { LoginDTO } from '@/src/schemas/auth.schema'
import type { UserDTO } from '@/types/user'

interface AuthResult {
  user: UserDTO
  accessToken: string
  refreshToken: string
}

export const AuthService = {
  async login(dto: LoginDTO): Promise<Result<AuthResult>> {
    const result = await UserRepository.findByEmail(dto.email)
    if (!result.ok) return result

    const user = result.value
    if (!user) {
      return err(new UnauthorizedError('E-mail ou senha inválidos'))
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password)
    if (!passwordMatch) {
      return err(new UnauthorizedError('E-mail ou senha inválidos'))
    }

    const userDTO = toUserDTO(user)

    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken({ sub: user.id, role: user.role, workspaceId: user.workspaceId }),
      signRefreshToken(user.id),
    ])

    await Promise.all([
      SessionCache.storeRefreshToken(user.id, refreshToken),
      UserCache.set(user.id, userDTO),
    ])

    return ok({ user: userDTO, accessToken, refreshToken })
  },

  async refresh(currentRefreshToken: string): Promise<Result<AuthResult>> {
    const verifyResult = await verifyRefreshToken(currentRefreshToken)
    if (!verifyResult.ok) return verifyResult

    const userId = verifyResult.value.sub

    const storedToken = await SessionCache.getRefreshToken(userId)
    if (!storedToken || storedToken !== currentRefreshToken) {
      return err(new UnauthorizedError('Refresh token inválido'))
    }

    let userDTO = await UserCache.get(userId)

    if (!userDTO) {
      const userResult = await UserRepository.findById(userId)
      if (!userResult.ok) return err(new UnauthorizedError('Usuário não encontrado'))

      userDTO = toUserDTO(userResult.value)
      await UserCache.set(userId, userDTO)
    }

    const [accessToken, refreshToken] = await Promise.all([
      signAccessToken({ sub: userId, role: userDTO.role, workspaceId: userDTO.workspaceId }),
      signRefreshToken(userId),
    ])

    await SessionCache.storeRefreshToken(userId, refreshToken)

    return ok({ user: userDTO, accessToken, refreshToken })
  },

  async logout(userId: string): Promise<Result<void>> {
    await Promise.all([
      SessionCache.invalidateRefreshToken(userId),
      UserCache.invalidate(userId),
    ])

    return ok(undefined)
  },
}
