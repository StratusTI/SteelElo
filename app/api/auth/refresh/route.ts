import { clearAuthCookies, getRefreshToken, setAuthCookies } from '@/src/lib/cookies'
import { AuthService } from '@/src/services/auth.service'
import { handleError, standardError, successResponse } from '@/utils/http-response'

export async function POST() {
  const refreshToken = await getRefreshToken()

  if (!refreshToken) {
    return standardError('UNAUTHORIZED', 'Refresh token não encontrado')
  }

  const result = await AuthService.refresh(refreshToken)

  if (!result.ok) {
    await clearAuthCookies()
    return handleError(result.error)
  }

  await setAuthCookies(result.value.accessToken, result.value.refreshToken)

  return successResponse(result.value.user)
}
