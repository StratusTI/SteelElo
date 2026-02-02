import { NextRequest, NextResponse } from "next/server";
import { decodeToken } from "./src/utils/jwt";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.includes('.')
    ) {
      return NextResponse.next()
    }

  // Permitir acesso à página de login sem autenticação
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // Verificar token de autenticação
  const token = request.cookies.get('auth_token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const user = await decodeToken(token)

  if (!user) {
    // Token inválido ou expirado - limpar cookie e redirecionar
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth_token')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - public files (images, etc)
     */
     '/((?!_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
