import { PrismaUsersRepository } from "@/src/repositories/prisma/prisma-users-repository";
import { UpdateUserProfileUseCase } from "../update-user-profile";

export function makeUpdateUserProfileUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const useCase = new UpdateUserProfileUseCase(usersRepository);

  return useCase;
}
