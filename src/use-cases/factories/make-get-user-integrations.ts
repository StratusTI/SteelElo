import { PrismaIntegrationsRepository } from "@/src/repositories/prisma/prisma-integrations-repository";
import { GetUserIntegrationsUseCase } from "../get-user-integrations";

export function makeGetUserIntegrationsUseCase() {
  const integrationsRepository = new PrismaIntegrationsRepository();
  const useCase = new GetUserIntegrationsUseCase(integrationsRepository);

  return useCase;
}
