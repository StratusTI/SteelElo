import { PrismaIntegrationsRepository } from "@/src/repositories/prisma/prisma-integrations-repository";
import { DisconnectIntegrationUseCase } from "../disconnect-integration";

export function makeDisconnectIntegrationUseCase() {
  const integrationsRepository = new PrismaIntegrationsRepository();
  const useCase = new DisconnectIntegrationUseCase(integrationsRepository);

  return useCase;
}
