import { PrismaProjectsRepository } from "@/src/repositories/prisma/prisma-project-repository";
import { UpdateProjectUseCase } from "../update-project";

export function makeUpdateProjectUseCase(): UpdateProjectUseCase {
  const projectRepository = new PrismaProjectsRepository()

  return new UpdateProjectUseCase(projectRepository)
}
