import { PrismaDocumentRepository } from '@/src/repositories/prisma/prisma-document-repository';
import { ArchiveDocumentUseCase } from '../archive-document';

export function makeArchiveDocumentUseCase(): ArchiveDocumentUseCase {
  const documentRepository = new PrismaDocumentRepository();

  return new ArchiveDocumentUseCase(documentRepository);
}
