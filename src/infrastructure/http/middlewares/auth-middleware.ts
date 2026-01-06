export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { JWTService } from "../../auth/jwt-service";

const jwtService = new JWTService()

export async function authMiddleware(request: NextRequest) {
  console.log('🔍 Middleware executando para:', request.url);

  const token = request.cookies.get('auth_token')?.value

  console.log('🍪 Cookie auth_token:', token ? 'Encontrado' : 'NÃO encontrado');

  if (!token) {
    console.log('❌ Redirecionando: sem token');
    return NextResponse.redirect(new URL('https://painel.stratustelecom.com.br/main/login.php', request.url))
  }

  const user = await jwtService.verifyToken(token)

  if (!user) {
    console.log('❌ Redirecionando: token inválido');
    return NextResponse.redirect(new URL('https://painel.stratustelecom.com.br/main/login.php', request.url))
  }

  console.log('✅ Usuário autenticado:', user.nome);
  return NextResponse.next();
}
