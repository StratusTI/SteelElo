import bcrypt from 'bcryptjs';
import type { NextRequest } from 'next/server';
import { prismaSteel } from '@/src/lib/prisma';
import { successResponse, standardError } from '@/src/utils/http-response';
import {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  type AuthUser,
} from '@/src/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return standardError('BAD_REQUEST', 'Email e senha sao obrigatorios');
    }

    const dbUser = await prismaSteel.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        senha: true,
        admin: true,
        superadmin: true,
        idempresa: true,
        nome: true,
        sobrenome: true,
      },
    });

    if (!dbUser?.senha) {
      return standardError('INVALID_CREDENTIALS', 'Email ou senha invalidos');
    }

    const isPasswordValid = await bcrypt.compare(password, dbUser.senha);
    if (!isPasswordValid) {
      return standardError('INVALID_CREDENTIALS', 'Email ou senha invalidos');
    }

    const authUser: AuthUser = {
      id: dbUser.id,
      email: dbUser.email ?? '',
      admin: Boolean(dbUser.admin),
      superadmin: Boolean(dbUser.superadmin),
      enterpriseId: dbUser.idempresa ?? 0,
    };

    const accessToken = await generateAccessToken(authUser);
    const { token: refreshToken } = await generateRefreshToken(authUser.id);

    await setAuthCookies(accessToken, refreshToken);

    return successResponse(
      {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          nome: dbUser.nome,
          sobrenome: dbUser.sobrenome,
          admin: authUser.admin,
          superadmin: authUser.superadmin,
          enterpriseId: authUser.enterpriseId,
        },
      },
      200,
      'Login realizado com sucesso',
    );
  } catch (error) {
    console.error('[Login] Error:', error);
    return standardError('INTERNAL_SERVER_ERROR', 'Erro ao realizar login');
  }
}
