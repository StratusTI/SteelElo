import { IntegrationsRepository } from "../repositories/integrations-repository";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface DisconnectIntegrationRequest {
  userId: number
  provider: string
}

interface DisconnectIntegrationResponse {
  success: boolean
}

export class DisconnectIntegrationUseCase {
  constructor(private integrationsRepository: IntegrationsRepository) {}

  async execute({ userId, provider }: DisconnectIntegrationRequest): Promise<DisconnectIntegrationResponse> {
    const existingIntegration = await this.integrationsRepository.findByUserAndProvider(userId, provider);

    if (!existingIntegration) {
      throw new ResourceNotFoundError();
    }

    const deleted = await this.integrationsRepository.delete(userId, provider);

    if (!deleted) {
      throw new ResourceNotFoundError();
    }

    return { success: true };
  }
}
