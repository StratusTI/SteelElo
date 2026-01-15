import { PrismaProjectMembersRepository } from "@/src/repositories/prisma/prisma-project-members-repository";
import { GetUserProjectRoleUseCase } from "../get-user-project-role";

export function makeGetUserProjectRoleUseCase(): GetUserProjectRoleUseCase {
  const projectMembersRepository = new PrismaProjectMembersRepository();
  const useCase = new GetUserProjectRoleUseCase(projectMembersRepository);

  return useCase;
}
