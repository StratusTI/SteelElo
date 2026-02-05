import { cookies } from 'next/headers'
import type { NextResponse } from 'next/server'
import { COOKIE_CONFIG, COOKIE_NAMES, COOKIE_MAX_AGE } from './config'

type CookieStore = Awaited<ReturnType<typeof cookies>>

/**
 * Define cookies de autenticacao
 */
export async function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  cookieStore?: CookieStore
): Promise<void> {
  const store = cookieStore ?? (await cookies())

  store.set(COOKIE_NAMES.accessToken, accessToken, {
    ...COOKIE_CONFIG,
    maxAge: COOKIE_MAX_AGE.accessToken,
  })

  store.set(COOKIE_NAMES.refreshToken, refreshToken, {
    ...COOKIE_CONFIG,
    maxAge: COOKIE_MAX_AGE.refreshToken,
  })
}

/**
 * Remove cookies de autenticacao
 */
export async function clearAuthCookies(cookieStore?: CookieStore): Promise<void> {
  const store = cookieStore ?? (await cookies())

  store.delete(COOKIE_NAMES.accessToken)
  store.delete(COOKIE_NAMES.refreshToken)
}

/**
 * Obtem tokens dos cookies
 */
export async function getAuthTokens(
  cookieStore?: CookieStore
): Promise<{ accessToken?: string; refreshToken?: string }> {
  const store = cookieStore ?? (await cookies())

  return {
    accessToken: store.get(COOKIE_NAMES.accessToken)?.value,
    refreshToken: store.get(COOKIE_NAMES.refreshToken)?.value,
  }
}

/**
 * Define cookies de autenticacao em uma Response (para middleware)
 */
export function setAuthCookiesOnResponse(
  response: NextResponse,
  accessToken: string,
  refreshToken: string
): void {
  response.cookies.set(COOKIE_NAMES.accessToken, accessToken, {
    ...COOKIE_CONFIG,
    maxAge: COOKIE_MAX_AGE.accessToken,
  })

  response.cookies.set(COOKIE_NAMES.refreshToken, refreshToken, {
    ...COOKIE_CONFIG,
    maxAge: COOKIE_MAX_AGE.refreshToken,
  })
}
