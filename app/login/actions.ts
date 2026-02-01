'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return {
      success: false,
      message: 'Email e senha são obrigatórios',
    };
  }

  try {
    // Chamar a API de login
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || 'Erro ao realizar login',
      };
    }

    // Se o login foi bem-sucedido, copiar o token do response para o cookie
    // (caso a API não tenha setado o cookie corretamente)
    if (data.data?.token) {
      const cookieStore = await cookies();
      cookieStore.set('auth_token', data.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60, // 1 hora
        path: '/',
      });
    }
  } catch (error) {
    console.error('[loginAction] Error:', error);
    return {
      success: false,
      message: 'Erro ao conectar com o servidor',
    };
  }

  // Redirecionar APÓS o sucesso (fora do try-catch)
  redirect('/');
}
