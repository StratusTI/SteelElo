import * as jose from 'jose'
import { randomUUID } from 'crypto'
import { getEncodedSecret, TOKEN_CONFIG } from './config'
import type { AuthUser } from './types'

/**
 * Gera access token JWT com payload minimalista
 */
export async function generateAccessToken(user: AuthUser): Promise<string> {
  const payload = {
    iss: TOKEN_CONFIG.issuer,
    sub: String(user.id),
    email: user.email,
    admin: user.admin,
    superadmin: user.superadmin,
    enterpriseId: user.enterpriseId,
  }

  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: TOKEN_CONFIG.algorithm })
    .setIssuedAt()
    .setExpirationTime(TOKEN_CONFIG.accessTokenExpiry)
    .sign(getEncodedSecret())
}

/**
 * Gera refresh token com family ID para rotacao
 */
export async function generateRefreshToken(
  userId: number,
  familyId?: string
): Promise<{ token: string; familyId: string }> {
  const family = familyId ?? randomUUID()

  const payload = {
    iss: TOKEN_CONFIG.issuer,
    sub: String(userId),
    type: 'refresh' as const,
    family,
  }

  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: TOKEN_CONFIG.algorithm })
    .setIssuedAt()
    .setExpirationTime(TOKEN_CONFIG.refreshTokenExpiry)
    .sign(getEncodedSecret())

  return { token, familyId: family }
}

/**
 * Verifica e decodifica access token
 */
export async function verifyAccessToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getEncodedSecret(), {
      algorithms: [TOKEN_CONFIG.algorithm],
      issuer: TOKEN_CONFIG.issuer,
    })

    if (!payload.sub || !payload.email) {
      return null
    }

    return {
      id: Number(payload.sub),
      email: payload.email as string,
      admin: Boolean(payload.admin),
      superadmin: Boolean(payload.superadmin),
      enterpriseId: Number(payload.enterpriseId),
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[Auth] Access token verification failed:',
        error instanceof Error ? error.message : error
      )
    }
    return null
  }
}

/**
 * Verifica refresh token
 */
export async function verifyRefreshToken(
  token: string
): Promise<{ userId: number; familyId: string } | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getEncodedSecret(), {
      algorithms: [TOKEN_CONFIG.algorithm],
      issuer: TOKEN_CONFIG.issuer,
    })

    if (payload.type !== 'refresh' || !payload.sub || !payload.family) {
      return null
    }

    return {
      userId: Number(payload.sub),
      familyId: payload.family as string,
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[Auth] Refresh token verification failed:',
        error instanceof Error ? error.message : error
      )
    }
    return null
  }
}

/**
 * Decodifica token sem verificar assinatura (para leitura rapida)
 * ATENCAO: Usar apenas para dados nao-criticos
 */
export function decodeAccessToken(token: string): AuthUser | null {
  try {
    const payload = jose.decodeJwt(token)

    if (!payload.sub || !payload.email) {
      return null
    }

    return {
      id: Number(payload.sub),
      email: payload.email as string,
      admin: Boolean(payload.admin),
      superadmin: Boolean(payload.superadmin),
      enterpriseId: Number(payload.enterpriseId),
    }
  } catch {
    return null
  }
}
