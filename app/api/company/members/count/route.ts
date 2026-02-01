import { unstable_cache } from 'next/cache';
import { verifyJWT } from '@/src/http/middlewares/verify-jwt';
import { makeGetCompanyMembersCountUseCase } from '@/src/use-cases/factories/make-get-company-members-count';
import { standardError, successResponse } from '@/src/utils/http-response';

export async function GET(request: Request) {
  const { user, error: authError } = await verifyJWT();
  if (authError) return authError;

  if (!user) {
    return standardError('UNAUTHORIZED', 'User not found');
  }

  const { searchParams } = new URL(request.url);
  const enterpriseId = searchParams.get('enterpriseId');

  if (!enterpriseId) {
    return standardError('BAD_REQUEST', 'enterpriseId is required');
  }

  try {
    // Função cacheada - a query key é baseada no enterpriseId
    const getCachedCount = unstable_cache(
      async (entId: string) => {
        const getCompanyMembersCount = makeGetCompanyMembersCountUseCase();
        const result = await getCompanyMembersCount.execute({
          user,
          enterpriseId: Number(entId),
        });
        return result.count;
      },
      [`members-count-${enterpriseId}`], // cache key
      {
        revalidate: 60, // revalida a cada 60 segundos
        tags: [`enterprise-${enterpriseId}-members`], // para invalidação manual
      },
    );

    const count = await getCachedCount(enterpriseId);

    return successResponse({ count }, 200);
  } catch (err) {
    console.error('[GET /api/company/members/count] Unexpected error:', err);
    return standardError(
      'INTERNAL_SERVER_ERROR',
      'Failed to get company members count',
    );
  }
}
