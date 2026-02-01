import { IntegrationsRepository, UserIntegration } from "../repositories/integrations-repository";

interface GetUserIntegrationsRequest {
  userId: number
}

interface GetUserIntegrationsResponse {
  integrations: UserIntegration[]
}

export class GetUserIntegrationsUseCase {
  constructor(private integrationsRepository: IntegrationsRepository) {}

  async execute({ userId }: GetUserIntegrationsRequest): Promise<GetUserIntegrationsResponse> {
    const integrations = await this.integrationsRepository.findAllByUser(userId);

    return { integrations };
  }
}
