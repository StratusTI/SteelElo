import { IntegrationsRepository, UserIntegration } from "../repositories/integrations-repository";
import { ConflictError } from "./errors/conflict-error";

interface ConnectIntegrationRequest {
  userId: number
  provider: string
  providerId: string
  providerLogin?: string
  accessToken: string
  refreshToken?: string
  tokenExpires?: Date
  scopes?: string
}

interface ConnectIntegrationResponse {
  integration: UserIntegration
}

export class ConnectIntegrationUseCase {
  constructor(private integrationsRepository: IntegrationsRepository) {}

  async execute(request: ConnectIntegrationRequest): Promise<ConnectIntegrationResponse> {
    const existingIntegration = await this.integrationsRepository.findByUserAndProvider(
      request.userId,
      request.provider
    );

    if (existingIntegration) {
      const updated = await this.integrationsRepository.update({
        userId: request.userId,
        provider: request.provider,
        accessToken: request.accessToken,
        refreshToken: request.refreshToken,
        tokenExpires: request.tokenExpires,
        providerLogin: request.providerLogin,
        scopes: request.scopes,
      });

      if (!updated) {
        throw new ConflictError('Erro ao atualizar integração');
      }

      return { integration: updated };
    }

    const integration = await this.integrationsRepository.create({
      userId: request.userId,
      provider: request.provider,
      providerId: request.providerId,
      providerLogin: request.providerLogin,
      accessToken: request.accessToken,
      refreshToken: request.refreshToken,
      tokenExpires: request.tokenExpires,
      scopes: request.scopes,
    });

    return { integration };
  }
}
