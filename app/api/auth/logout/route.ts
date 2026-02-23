import { clearAuthCookies, getAccessToken } from '@/src/lib/cookies'
import { verifyAccessToken } from '@/src/lib/jwt'
import { AuthService } from '@/src/services/auth.service'
import { successResponse } from '@/utils/http-response'

export async function POST() {
  const accessToken = await getAccessToken()

  if (!accessToken) {
    await clearAuthCookies()
    return successResponse(null)
  }

  const tokenResult = await verifyAccessToken(accessToken)

  if (tokenResult.ok) {
    await AuthService.logout(tokenResult.value.sub)
  }

  await clearAuthCookies()

  return successResponse(null)
}
