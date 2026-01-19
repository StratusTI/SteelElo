import { PrismaProjectsRepository } from "@/src/repositories/prisma/prisma-project-repository";
import { GetProjectsUseCase } from "../get-projects";

export function makeGetProjectsUseCase(): GetProjectsUseCase {
  const projectRepository = new PrismaProjectsRepository()

  return new GetProjectsUseCase(projectRepository)
}
