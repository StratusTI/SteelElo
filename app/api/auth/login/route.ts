import bcrypt from 'bcryptjs';
import * as jose from 'jose';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { prismaSteel } from '@/src/lib/prisma';

const JWT_SECRET =
  process.env.JWT_SECRET || 'local-dev-secret-change-in-production';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validação básica
    if (!email || !password) {
      return Response.json(
        { success: false, message: 'Email e senha são obrigatórios' },
        { status: 400 },
      );
    }

    // Buscar usuário no banco (Steel)
    const user = await prismaSteel.usuario.findUnique({
      where: { email },
      include: {
        empresa: {
          select: { nome: true },
        },
      },
    });

    if (!user || !user.senha) {
      return Response.json(
        { success: false, message: 'Email ou senha inválidos' },
        { status: 401 },
      );
    }

    // Validar senha
    const isPasswordValid = await bcrypt.compare(password, user.senha);

    if (!isPasswordValid) {
      return Response.json(
        { success: false, message: 'Email ou senha inválidos' },
        { status: 401 },
      );
    }

    // Criar payload do JWT conforme especificação
    const payload = {
      iss: 'stratustelecom',
      sub: String(user.id),
      data: {
        id: user.id,
        nome: user.nome || '',
        sobrenome: user.sobrenome || '',
        username: user.username || '',
        foto: user.foto || '',
        email: user.email || '',
        admin: user.admin ? 1 : 0,
        superadmin: user.superadmin ? 1 : 0,
        idempresa: user.idempresa || 0,
        empresa: user.empresa?.nome || '',
      },
    };

    // Gerar token JWT
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1h')
      .sign(secret);

    // Salvar token em cookie httpOnly
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60, // 1 hora
      path: '/',
    });

    return Response.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: payload.data,
        token,
      },
    });
  } catch (error) {
    console.error('[Login] Error:', error);
    return Response.json(
      { success: false, message: 'Erro ao realizar login' },
      { status: 500 },
    );
  }
}
