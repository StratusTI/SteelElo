import { PrismaDocumentRepository } from '@/src/repositories/prisma/prisma-document-repository';
import { DuplicateDocumentUseCase } from '../duplicate-document';

export function makeDuplicateDocumentUseCase(): DuplicateDocumentUseCase {
  const documentRepository = new PrismaDocumentRepository();

  return new DuplicateDocumentUseCase(documentRepository);
}
