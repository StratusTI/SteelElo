import { verifyAuth } from '@/src/auth';
import { makeGetUserIntegrationsUseCase } from '@/src/use-cases/factories/make-get-user-integrations';
import { standardError, successResponse } from '@/src/utils/http-response';

export async function GET() {
  const { user, error } = await verifyAuth();

  if (error || !user) {
    return error;
  }

  try {
    const getUserIntegrations = makeGetUserIntegrationsUseCase();
    const { integrations } = await getUserIntegrations.execute({
      userId: user.id,
    });

    const formattedIntegrations = integrations.map((integration) => ({
      id: integration.id,
      provider: integration.provider,
      providerLogin: integration.providerLogin,
      connectedAt: integration.createdAt,
    }));

    return successResponse(
      { integrations: formattedIntegrations },
      200,
      'Integracoes recuperadas com sucesso',
    );
  } catch (err) {
    console.error('[GET /api/integrations] Error:', err);
    return standardError('INTERNAL_SERVER_ERROR', 'Erro ao buscar integracoes');
  }
}
