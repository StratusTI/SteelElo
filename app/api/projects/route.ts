import type { NextRequest } from 'next/server';
import { unstable_cache } from 'next/cache';
import { z } from 'zod';
import { ProjetoPriority, ProjetoStatus } from '@/src/generated/elo';
import { verifyAuth } from '@/src/auth';
import { makeGetProjectsUseCase } from '@/src/use-cases/factories/make-get-projects';
import { standardError, successResponse } from '@/src/utils/http-response';
import type { User } from '@/src/@types/user';

const filtersSchema = z.object({
  search: z.string().optional(),
  status: z.array(z.nativeEnum(ProjetoStatus)).optional(),
  prioridade: z.array(z.nativeEnum(ProjetoPriority)).optional(),
  ownerId: z.coerce.number().optional(),
  memberId: z.coerce.number().optional(),
  orderBy: z.enum(['nome', 'createdAt', 'updatedAt']).optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export async function GET(req: NextRequest) {
  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  try {
    const { searchParams } = new URL(req.url);

    const rawFilters: {
      search?: string;
      status?: string[];
      prioridade?: string[];
      ownerId?: string;
      memberId?: string;
      orderBy?: string;
      orderDirection?: string;
      page?: string;
      limit?: string;
    } = {
      search: searchParams.get('search') || undefined,
      status: searchParams.getAll('status') || undefined,
      prioridade: searchParams.getAll('prioridade') || undefined,
      ownerId: searchParams.get('ownerId') || undefined,
      memberId: searchParams.get('memberId') || undefined,
      orderBy: searchParams.get('orderBy') || undefined,
      orderDirection: searchParams.get('orderDirection') || undefined,
      page: searchParams.get('page') || undefined,
      limit: searchParams.get('limit') || undefined,
    };

    Object.keys(rawFilters).forEach((key) => {
      const typedKey = key as keyof typeof rawFilters;
      if (rawFilters[typedKey] === undefined) {
        delete rawFilters[typedKey];
      }
    });

    const validatedFilters = filtersSchema.parse(rawFilters);

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

    const cacheKey = `projects-${user.id}-${user.idempresa}`;
    const filtersCacheKey = JSON.stringify(validatedFilters);

    const getCachedProjects = unstable_cache(
      async (userJson: string, filtersJson: string) => {
        const parsedUser = JSON.parse(userJson) as User;
        const parsedFilters = JSON.parse(filtersJson);
        const getProjects = makeGetProjectsUseCase();
        return getProjects.execute({
          user: parsedUser,
          filters: parsedFilters,
        });
      },
      [cacheKey, filtersCacheKey],
      {
        revalidate: 30,
        tags: ['projects', `projects-enterprise-${user.idempresa}`],
      },
    );

    const result = await getCachedProjects(
      JSON.stringify(user),
      filtersCacheKey,
    );

    return successResponse(result, 200, undefined, {
      maxAge: 30,
      staleWhileRevalidate: 60,
      private: true,
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return standardError('VALIDATION_ERROR', 'Invalid query parameters', {
        errors: err.message,
      });
    }

    console.error('[GET /api/projects] Unexpected error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Failed to fetch projects');
  }
}
