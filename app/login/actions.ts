'use server';

import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import {
  type AuthUser,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
} from '@/src/auth';
import { prismaSteel } from '@/src/lib/prisma';
import type { LoginState } from './types';

const loginSchema = z.object({
  email: z.email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return {
      success: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { email, password } = parsed.data;

  try {
    const dbUser = await prismaSteel.usuario.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        senha: true,
        admin: true,
        superadmin: true,
        idempresa: true,
      },
    });

    if (!dbUser?.senha) {
      return { success: false, message: 'Email ou senha inválidos' };
    }

    const isPasswordValid = await bcrypt.compare(password, dbUser.senha);
    if (!isPasswordValid) {
      return { success: false, message: 'Email ou senha inválidos' };
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
  } catch (error) {
    console.error('[loginAction]', error);
    return { success: false, message: 'Erro ao conectar com o servidor' };
  }

  redirect('/');
}
