import type { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { verifyJWT } from '@/src/http/middlewares/verify-jwt';
import { makeSearchUsersUseCase } from '@/src/use-cases/factories/make-search-users';
import { standardError, successResponse } from '@/src/utils/http-response';
import { searchUsersSchema } from '@/src/utils/zod-schemas/search-users-schema';

export async function GET(req: NextRequest) {
  const { user, error: authError } = await verifyJWT();

  if (authError) return authError;

  try {
    const { searchParams } = new URL(req.url);

    const rawParams = {
      q: searchParams.get('q') || undefined,
      excludeProjectId: searchParams.get('excludeProjectId') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    const validatedParams = searchUsersSchema.parse(rawParams);

    const searchUsers = makeSearchUsersUseCase();

    if (!user) {
      return standardError('UNAUTHORIZED', 'User not found');
    }

    const { users } = await searchUsers.execute({
      user: user,
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
