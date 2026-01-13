import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./src/utils/jwt";

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_tokne')?.value

  if (!token) {
    return NextResponse.redirect(
      new URL('https://painel.stratustelecom.com.br/main/login.php', request.url)
    )
  }

  const user = await verifyToken(token)

  if (!user) {
    return NextResponse.redirect(
      new URL('https://painel.stratustelecom.com.br/main/login.php', request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|reference|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};
