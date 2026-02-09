import { unstable_cache } from 'next/cache';
import { verifyAuth } from '@/src/auth';
import { makeGetCompanyMembersCountUseCase } from '@/src/use-cases/factories/make-get-company-members-count';
import { standardError, successResponse } from '@/src/utils/http-response';
import type { User } from '@/src/@types/user';

export async function GET(request: Request) {
  const { user: authUser, error: authError } = await verifyAuth();

  if (authError || !authUser) {
    return authError;
  }

  const { searchParams } = new URL(request.url);
  const enterpriseId = searchParams.get('enterpriseId');

  if (!enterpriseId) {
    return standardError('BAD_REQUEST', 'enterpriseId is required');
  }

  try {
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

    const getCachedCount = unstable_cache(
      async (entId: string, userJson: string) => {
        const parsedUser = JSON.parse(userJson) as User;
        const getCompanyMembersCount = makeGetCompanyMembersCountUseCase();
        const result = await getCompanyMembersCount.execute({
          user: parsedUser,
          enterpriseId: Number(entId),
        });
        return result.count;
      },
      [`members-count-${enterpriseId}`],
      {
        revalidate: 60,
        tags: [`enterprise-${enterpriseId}-members`],
      },
    );

    const count = await getCachedCount(enterpriseId, JSON.stringify(user));

    return successResponse({ count }, 200);
  } catch (err) {
    console.error('[GET /api/company/members/count] Unexpected error:', err);
    return standardError(
      'INTERNAL_SERVER_ERROR',
      'Failed to get company members count',
    );
  }
}
