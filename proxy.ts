import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_ROUTES = ['/login', '/api/auth/login', '/api/auth/refresh', '/api/auth/', '/api/users']

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

async function isValidAccessToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  const accessToken = request.cookies.get('auth_token')?.value

  const isAuthenticated = accessToken ? await isValidAccessToken(accessToken) : false

  if (isPublic) {
    if (isAuthenticated && pathname.startsWith('/login')) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  if (!isAuthenticated) {
    const refreshToken = request.cookies.get('refresh_token')?.value

    if (refreshToken) {
      const refreshUrl = new URL('/api/auth/refresh', request.url)
      const refreshResponse = await fetch(refreshUrl, {
        method: 'POST',
        headers: { Cookie: `refresh_token=${refreshToken}` },
      })

      if (refreshResponse.ok) {
        const response = NextResponse.redirect(request.url)

        for (const cookie of refreshResponse.headers.getSetCookie()) {
          response.headers.append('Set-Cookie', cookie)
        }

        return response
      }
    }

    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
