import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const PUBLIC_ROUTES = [
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/refresh',
  '/api/health',
]

const PROTECTED_API_PREFIXES = [
  '/api/projects',
  '/api/auth/me',
  '/api/company',
  '/api/users',
  '/api/integrations',
]

const JWT_SECRET = process.env.JWT_SECRET
const ENCODED_SECRET = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : null

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check if protected API route
  const isProtectedApi = PROTECTED_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )

  if (!isProtectedApi) {
    return NextResponse.next()
  }

  // Verify JWT_SECRET is configured
  if (!ENCODED_SECRET) {
    console.error('[Middleware] JWT_SECRET not configured')
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR' } },
      { status: 500 }
    )
  }

  const accessToken = request.cookies.get('auth_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  // No tokens present
  if (!accessToken && !refreshToken) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED' } },
      { status: 401 }
    )
  }

  // Verify access token
  if (accessToken) {
    try {
      await jose.jwtVerify(accessToken, ENCODED_SECRET, {
        algorithms: ['HS256'],
        issuer: 'nexo',
      })
      // Token valid - continue
      return NextResponse.next()
    } catch {
      // Token invalid/expired - try refresh below
    }
  }

  // Access token invalid, check refresh token
  if (refreshToken) {
    try {
      const { payload } = await jose.jwtVerify(refreshToken, ENCODED_SECRET, {
        algorithms: ['HS256'],
        issuer: 'nexo',
      })

      if (payload.type !== 'refresh') {
        throw new Error('Invalid refresh token type')
      }

      // Refresh token valid - let the request continue
      // The actual token refresh will happen in verifyAuth()
      return NextResponse.next()
    } catch {
      // Refresh token also invalid
    }
  }

  return NextResponse.json(
    { success: false, error: { code: 'INVALID_TOKEN' } },
    { status: 401 }
  )
}

export const config = {
  matcher: ['/api/:path*'],
}
