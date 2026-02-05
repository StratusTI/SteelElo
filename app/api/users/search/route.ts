import type { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { verifyAuth } from '@/src/auth';
import { makeSearchUsersUseCase } from '@/src/use-cases/factories/make-search-users';
import { standardError, successResponse } from '@/src/utils/http-response';
import { searchUsersSchema } from '@/src/utils/zod-schemas/search-users-schema';
import type { User } from '@/src/@types/user';

export async function GET(req: NextRequest) {
  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  try {
    const { searchParams } = new URL(req.url);

    const rawParams = {
      q: searchParams.get('q') || undefined,
      excludeProjectId: searchParams.get('excludeProjectId') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    const validatedParams = searchUsersSchema.parse(rawParams);

    // Criar User parcial para o use case
    const user: User = {
      id: authUser.id,
      email: authUser.email,
      admin: authUser.admin,
      superadmin: authUser.superadmin,
      idempresa: authUser.enterpriseId,
      nome: '',
      sobrenome: '',
      username: '',
      foto: '',
      telefone: '',
      empresa: '',
      departamento: null,
      time: null,
      online: false,
    };

    const searchUsers = makeSearchUsersUseCase();

    const { users } = await searchUsers.execute({
      user,
      query: validatedParams.q,
      excludeProjectId: validatedParams.excludeProjectId,
      limit: validatedParams.limit,
    });

    return successResponse(
      {
        users: users.map((u) => ({
          id: u.id,
          nome: u.nome,
          sobrenome: u.sobrenome,
          nomeCompleto: `${u.nome} ${u.sobrenome}`.trim(),
          email: u.email,
          foto: u.foto,
          departamento: u.departamento,
        })),
      },
      200,
    );
  } catch (err) {
    if (err instanceof ZodError) {
      return standardError('VALIDATION_ERROR', 'Invalid parameters');
    }

    console.error('[GET /api/users/search] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to search users');
  }
}
