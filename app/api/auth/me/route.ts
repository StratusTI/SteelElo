import type { NextRequest } from 'next/server'
import { unauthorized } from '@/src/errors'
import { getAccessToken, setAuthCookies } from '@/src/lib/cookies'
import { signAccessToken, signRefreshToken, verifyAccessToken, type AccessTokenPayload } from '@/src/lib/jwt'
import { type Result, err } from '@/src/lib/result'
import { UpdateUserSchema } from '@/src/schemas/user.schema'
import { UserService } from '@/src/services/user.service'
import { handleError, standardError, successResponse } from '@/utils/http-response'

async function authenticateRequest(): Promise<Result<AccessTokenPayload>> {
  const accessToken = await getAccessToken()

  if (!accessToken) {
    return err(unauthorized('Token não encontrado'))
  }

  return verifyAccessToken(accessToken)
}

export async function GET() {
  const auth = await authenticateRequest()
  if (!auth.ok) return handleError(auth.error)

  const result = await UserService.getProfile(auth.value.sub)

  if (!result.ok) return handleError(result.error)

  return successResponse(result.value)
}

export async function PATCH(request: NextRequest) {
  const auth = await authenticateRequest()
  if (!auth.ok) return handleError(auth.error)

  const body = await request.json()
  const parsed = UpdateUserSchema.safeParse(body)

  if (!parsed.success) {
    return standardError('VALIDATION_ERROR', 'Dados inválidos', parsed.error.issues)
  }

  const result = await UserService.updateProfile(auth.value.sub, parsed.data)

  if (!result.ok) return handleError(result.error)

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
