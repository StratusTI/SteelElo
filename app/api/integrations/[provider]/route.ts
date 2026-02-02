import { verifyJWT } from '@/src/http/middlewares/verify-jwt';
import {
  isValidProvider,
  type OAuthProvider,
  revokeToken,
} from '@/src/lib/oauth/providers';
import { PrismaIntegrationsRepository } from '@/src/repositories/prisma/prisma-integrations-repository';
import { ResourceNotFoundError } from '@/src/use-cases/errors/resource-not-found-error';
import { makeDisconnectIntegrationUseCase } from '@/src/use-cases/factories/make-disconnect-integration';
import { standardError, successResponse } from '@/src/utils/http-response';

interface RouteParams {
  params: Promise<{ provider: string }>;
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { provider } = await params;

  if (!isValidProvider(provider)) {
    return standardError('BAD_REQUEST', 'Provider inválido');
  }

  const { user, error } = await verifyJWT();

  if (error || !user) {
    return error;
  }

  try {
    const integrationsRepository = new PrismaIntegrationsRepository();
    const existingIntegration =
      await integrationsRepository.findByUserAndProvider(user.id, provider);

    if (existingIntegration) {
      await revokeToken(
        provider as OAuthProvider,
        existingIntegration.accessToken,
      );
    }

    const disconnectIntegration = makeDisconnectIntegrationUseCase();
    await disconnectIntegration.execute({
      userId: user.id,
      provider,
    });

    return successResponse(
      { provider },
      200,
      'Integração desconectada com sucesso',
    );
  } catch (err) {
    if (err instanceof ResourceNotFoundError) {
      return standardError('RESOURCE_NOT_FOUND', 'Integração não encontrada');
    }

    console.error(`[DELETE /api/integrations/${provider}] Error:`, err);
    return standardError(
      'INTERNAL_SERVER_ERROR',
      'Erro ao desconectar integração',
    );
  }
}
