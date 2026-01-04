import { NextRequest, NextResponse } from "next/server";
import { JWTService } from "../../auth/jwt-service";

const jwtService = new JWTService()

export async function authMiddleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) return NextResponse.redirect(new URL('https://painel.stratustelecom.com.br/main/login.php', request.url))

  const user = await jwtService.verifyToken(token)

  if (!user) return NextResponse.redirect(new URL('https://painel.stratustelecom.com.br/main/login.php', request.url))

  return NextResponse.next();
}
