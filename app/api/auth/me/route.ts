import { type NextRequest, NextResponse } from 'next/server'
import { UpdateUserSchema } from '@/src/schemas/user.schema'
import { AuthService } from '@/src/services/auth.service'
import { UserService } from '@/src/services/user.service'
import { successResponse, errorResponse } from '@/src/lib/http'
import {
  verifyAccessToken,
  signAccessToken,
  signRefreshToken,
} from '@/src/lib/jwt'
import { getAccessToken, setAuthCookies } from '@/src/lib/cookies'
import { UnauthorizedError, ValidationError } from '@/src/errors'

async function authenticateRequest() {
  const accessToken = await getAccessToken()

  if (!accessToken) {
    return {
      ok: false as const,
      error: new UnauthorizedError('Token não encontrado'),
    }
  }

  const tokenResult = await verifyAccessToken(accessToken)

  if (!tokenResult.ok) {
    return { ok: false as const, error: tokenResult.error }
  }

  return { ok: true as const, value: tokenResult.value }
}

export async function GET() {
  const auth = await authenticateRequest()
  if (!auth.ok) return errorResponse(auth.error)

  const result = await UserService.getProfile(auth.value.sub)

  if (!result.ok) return errorResponse(result.error)

  return successResponse(result.value)
}

export async function PATCH(request: NextRequest) {
  const auth = await authenticateRequest()
  if (!auth.ok) return errorResponse(auth.error)

  const body = await request.json()
  const parsed = UpdateUserSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse(
      new ValidationError('Dados inválidos', parsed.error.issues),
    )
  }

  const result = await UserService.updateProfile(auth.value.sub, parsed.data)

  if (!result.ok) return errorResponse(result.error)

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({
      sub: result.value.id,
      role: result.value.role,
      workspaceId: result.value.workspaceId,
    }),
    signRefreshToken(result.value.id),
  ])

  await setAuthCookies(accessToken, refreshToken)

  return successResponse(result.value)
}
