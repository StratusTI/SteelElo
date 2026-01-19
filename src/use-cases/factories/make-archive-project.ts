import { PrismaProjectsRepository } from "@/src/repositories/prisma/prisma-project-repository";
import { ArchiveProjectUseCase } from "../archive-project";

export function makeArchiveProjectUseCase(): ArchiveProjectUseCase {
  const projectRepository = new PrismaProjectsRepository()

  return new ArchiveProjectUseCase(projectRepository)
}
