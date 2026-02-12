import { PrismaDocumentRepository } from '@/src/repositories/prisma/prisma-document-repository';
import { UpdateDocumentUseCase } from '../update-document';

export function makeUpdateDocumentUseCase(): UpdateDocumentUseCase {
  const documentRepository = new PrismaDocumentRepository();

  return new UpdateDocumentUseCase(documentRepository);
}
