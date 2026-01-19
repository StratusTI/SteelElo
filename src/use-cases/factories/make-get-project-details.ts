import { PrismaProjectsRepository } from "@/src/repositories/prisma/prisma-project-repository";
import { GetProjectDetailsUseCase } from "../get-project-details";

export function makeGetProjectDetailsUseCase(): GetProjectDetailsUseCase {
  const projectRepository = new PrismaProjectsRepository()

  return new GetProjectDetailsUseCase(projectRepository)
}
