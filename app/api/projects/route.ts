import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { ProjetoPriority, ProjetoStatus } from '@/src/generated/elo';
import { verifyJWT } from '@/src/http/middlewares/verify-jwt';
import { makeGetProjectsUseCase } from '@/src/use-cases/factories/make-get-projects';
import { standardError, successResponse } from '@/src/utils/http-response';

const filtersSchema = z.object({
  search: z.string().optional(),
  status: z.array(z.enum(ProjetoStatus)).optional(),
  prioridade: z.array(z.enum(ProjetoPriority)).optional(),
  ownerId: z.coerce.number().optional(),
  memberId: z.coerce.number().optional(),
  orderBy: z.enum(['nome', 'createdAt', 'updatedAt']).optional(),
  orderDirection: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});

export async function GET(req: NextRequest) {
  const { user, error: authError } = await verifyJWT();

  if (authError || !user) {
    return authError;
  }

  try {
    const { searchParams } = new URL(req.url);

    // Parse query params
    const rawFilters: any = {
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

    // Remove undefined values
    Object.keys(rawFilters).forEach(
      (key) => rawFilters[key] === undefined && delete rawFilters[key],
    );

    const validatedFilters = filtersSchema.parse(rawFilters);

    const getProjects = makeGetProjectsUseCase();

    const result = await getProjects.execute({
      user,
      filters: validatedFilters,
    });

    return successResponse(result, 200);
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
