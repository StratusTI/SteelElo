import { PrismaIntegrationsRepository } from "@/src/repositories/prisma/prisma-integrations-repository";
import { ConnectIntegrationUseCase } from "../connect-integration";

export function makeConnectIntegrationUseCase() {
  const integrationsRepository = new PrismaIntegrationsRepository();
  const useCase = new ConnectIntegrationUseCase(integrationsRepository);

  return useCase;
}
