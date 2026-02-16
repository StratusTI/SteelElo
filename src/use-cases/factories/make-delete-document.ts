import { PrismaDocumentRepository } from '@/src/repositories/prisma/prisma-document-repository';
import { DeleteDocumentUseCase } from '../delete-document';

export function makeDeleteDocumentUseCase(): DeleteDocumentUseCase {
  const documentRepository = new PrismaDocumentRepository();

  return new DeleteDocumentUseCase(documentRepository);
}
