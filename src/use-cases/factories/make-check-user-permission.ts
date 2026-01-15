import { PrismaProjectMembersRepository } from "@/src/repositories/prisma/prisma-project-members-repository";
import { CheckUserPermissionUseCase } from "../check-user-permission";

export function makeCheckUserPermissionUseCase(): CheckUserPermissionUseCase {
  const projectMembersRepository = new PrismaProjectMembersRepository();
  const useCase = new CheckUserPermissionUseCase(projectMembersRepository);
  return useCase;
}
