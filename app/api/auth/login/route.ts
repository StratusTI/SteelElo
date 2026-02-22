import { type NextRequest, NextResponse } from 'next/server'
import { LoginSchema } from '@/src/schemas/auth.schema'
import { AuthService } from '@/src/services/auth.service'
import { successResponse, errorResponse } from '@/src/lib/http'
import { setAuthCookies } from '@/src/lib/cookies'
import { ValidationError } from '@/src/errors'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = LoginSchema.safeParse(body)

  if (!parsed.success) {
    return errorResponse(
      new ValidationError('Dados inválidos', parsed.error.issues),
    )
  }

  const result = await AuthService.login(parsed.data)

  if (!result.ok) {
    return errorResponse(result.error)
  }

  await setAuthCookies(result.value.accessToken, result.value.refreshToken)

  return successResponse(result.value.user)
}
