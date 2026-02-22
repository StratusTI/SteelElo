import { SignJWT, jwtVerify } from 'jose'
import { UnauthorizedError } from '@/src/errors'
import { type Result, ok, err } from '@/src/lib/result'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

export interface AccessTokenPayload {
  sub: string
  role: string
  workspaceId: string | null
}

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT({ role: payload.role, workspaceId: payload.workspaceId })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret)
}

export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}

export async function verifyAccessToken(
  token: string,
): Promise<Result<AccessTokenPayload>> {
  try {
    const { payload } = await jwtVerify(token, secret)

    if (!payload.sub) {
      return err(new UnauthorizedError('Invalid token payload'))
    }

    return ok({
      sub: payload.sub,
      role: payload.role as string,
      workspaceId: (payload.workspaceId as string | null) ?? null,
    })
  } catch {
    return err(new UnauthorizedError('Invalid or expired token'))
  }
}

export async function verifyRefreshToken(
  token: string,
): Promise<Result<{ sub: string }>> {
  try {
    const { payload } = await jwtVerify(token, secret)

    if (!payload.sub) {
      return err(new UnauthorizedError('Invalid refresh token'))
    }

    return ok({ sub: payload.sub })
  } catch {
    return err(new UnauthorizedError('Invalid or expired refresh token'))
  }
}
