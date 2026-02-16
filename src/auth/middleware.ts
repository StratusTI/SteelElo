import { prismaSteel } from '@/src/lib/prisma'
import { standardError } from '@/src/utils/http-response'
import type { User } from '@/src/@types/user'
import type { AuthResult, AuthUser } from './types'
import {
  verifyAccessToken,
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
} from './tokens'
import { getAuthTokens, setAuthCookies, clearAuthCookies } from './cookies'

/**
 * Mapeia usuario do banco para AuthUser
 */
function dbUserToAuthUser(dbUser: {
  id: number
  email: string | null
  admin: boolean | null
  superadmin: boolean | null
  idempresa: number | null
}): AuthUser {
  return {
    id: dbUser.id,
    email: dbUser.email ?? '',
    admin: Boolean(dbUser.admin),
    superadmin: Boolean(dbUser.superadmin),
    enterpriseId: dbUser.idempresa ?? 0,
  }
}

/**
 * Busca usuario no banco e gera novos tokens
 * APENAS para uso em Route Handlers (onde cookies podem ser setados)
 */
async function refreshAuthTokens(
  refreshTokenData: { userId: number; familyId: string }
): Promise<AuthUser | null> {
  const dbUser = await prismaSteel.usuario.findUnique({
    where: { id: refreshTokenData.userId },
    select: {
      id: true,
      email: true,
      admin: true,
      superadmin: true,
      idempresa: true,
    },
  })

  if (!dbUser) {
    return null
  }

  const authUser = dbUserToAuthUser(dbUser)
  const newAccessToken = await generateAccessToken(authUser)
  const { token: newRefreshToken } = await generateRefreshToken(
    authUser.id,
    refreshTokenData.familyId
  )

  await setAuthCookies(newAccessToken, newRefreshToken)
  return authUser
}

/**
 * Verifica autenticacao JWT para API routes
 * Tenta refresh automatico se access token expirou
 * APENAS para uso em Route Handlers
 */
export async function verifyAuth(): Promise<AuthResult> {
  const { accessToken, refreshToken } = await getAuthTokens()

  if (!accessToken && !refreshToken) {
    return {
      user: null,
      error: standardError('UNAUTHORIZED', 'Authentication required'),
    }
  }

  if (accessToken) {
    const user = await verifyAccessToken(accessToken)
    if (user) {
      return { user }
    }
  }

  if (refreshToken) {
    const refreshData = await verifyRefreshToken(refreshToken)
    if (refreshData) {
      const user = await refreshAuthTokens(refreshData)
      if (user) {
        return { user, tokensRefreshed: true }
      }
    }
    await clearAuthCookies()
  }

  return {
    user: null,
    error: standardError('INVALID_TOKEN', 'Invalid or expired token'),
  }
}

/**
 * Obtem usuario autenticado sem fazer refresh
 * Seguro para usar em Server Components
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const { accessToken, refreshToken } = await getAuthTokens()

  // Tenta verificar access token
  if (accessToken) {
    const user = await verifyAccessToken(accessToken)
    if (user) return user
  }

  // Se access token falhou mas tem refresh token válido,
  // retorna null para forçar redirect ao endpoint de refresh
  if (refreshToken) {
    const refreshData = await verifyRefreshToken(refreshToken)
    if (refreshData) {
      // Refresh token é válido, mas não podemos setar cookies aqui
      // Retorna null para forçar redirect em requireAuth()
      return null
    }
  }

  return null
}

/**
 * Gera novos tokens a partir de um refresh token válido
 * Retorna os tokens sem setá-los (para uso em Route Handlers)
 */
export async function generateNewTokensFromRefresh(
  refreshTokenData: { userId: number; familyId: string }
): Promise<{ accessToken: string; refreshToken: string; authUser: AuthUser } | null> {
  const dbUser = await prismaSteel.usuario.findUnique({
    where: { id: refreshTokenData.userId },
    select: {
      id: true,
      email: true,
      admin: true,
      superadmin: true,
      idempresa: true,
    },
  })

  if (!dbUser) {
    return null
  }

  const authUser = dbUserToAuthUser(dbUser)
  const newAccessToken = await generateAccessToken(authUser)
  const { token: newRefreshToken } = await generateRefreshToken(
    authUser.id,
    refreshTokenData.familyId
  )

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    authUser,
  }
}

/**
 * Busca dados completos do usuario do banco
 */
export async function getFullUserProfile(authUser: AuthUser): Promise<User | null> {
  const dbUser = await prismaSteel.usuario.findUnique({
    where: { id: authUser.id },
    include: {
      empresa: {
        select: { nome: true },
      },
    },
  })

  if (!dbUser) return null

  return {
    id: dbUser.id,
    nome: dbUser.nome ?? '',
    sobrenome: dbUser.sobrenome ?? '',
    username: dbUser.username ?? '',
    foto: dbUser.foto ?? '',
    email: dbUser.email ?? '',
    telefone: dbUser.telefone ?? '',
    admin: Boolean(dbUser.admin),
    superadmin: Boolean(dbUser.superadmin),
    idempresa: dbUser.idempresa ?? 0,
    empresa: dbUser.empresa?.nome ?? '',
    departamento: dbUser.departamento ?? null,
    time: dbUser.time ?? null,
    online: dbUser.online,
  }
}
