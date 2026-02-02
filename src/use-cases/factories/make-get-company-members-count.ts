import { PrismaUsersRepository } from "@/src/repositories/prisma/prisma-users-repository";
import { GetCompanyMembersCountUseCase } from "../get-company-members-count";

export function makeGetCompanyMembersCountUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const useCase = new GetCompanyMembersCountUseCase(usersRepository);

  return useCase;
}
