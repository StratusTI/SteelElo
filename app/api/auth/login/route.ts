import type { NextRequest } from 'next/server'
import { setAuthCookies } from '@/src/lib/cookies'
import { LoginSchema } from '@/src/schemas/auth.schema'
import { AuthService } from '@/src/services/auth.service'
import { handleError, standardError, successResponse } from '@/utils/http-response'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = LoginSchema.safeParse(body)

  if (!parsed.success) {
    return standardError('VALIDATION_ERROR', 'Dados inválidos', parsed.error.issues)
  }

  const result = await AuthService.login(parsed.data)

  if (!result.ok) {
    return handleError(result.error)
  }

  await setAuthCookies(result.value.accessToken, result.value.refreshToken)

  return successResponse(result.value.user)
}
