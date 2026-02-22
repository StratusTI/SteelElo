import { AuthService } from '@/src/services/auth.service'
import { successResponse, errorResponse } from '@/src/lib/http'
import {
  setAuthCookies,
  clearAuthCookies,
  getRefreshToken,
} from '@/src/lib/cookies'
import { UnauthorizedError } from '@/src/errors'

export async function POST() {
  const refreshToken = await getRefreshToken()

  if (!refreshToken) {
    return errorResponse(new UnauthorizedError('Refresh token não encontrado'))
  }

  const result = await AuthService.refresh(refreshToken)

  if (!result.ok) {
    await clearAuthCookies()
    return errorResponse(result.error)
  }

  await setAuthCookies(result.value.accessToken, result.value.refreshToken)

  return successResponse(result.value.user)
}
