import { PrismaProjectsRepository } from "@/src/repositories/prisma/prisma-project-repository";
import { GetProjectsDetailsUseCase } from "../get-projects-details";

export function makeGetProjectDetailsUseCase(): GetProjectsDetailsUseCase {
  const projectRepository = new PrismaProjectsRepository()

  return new GetProjectsDetailsUseCase(projectRepository)
}
