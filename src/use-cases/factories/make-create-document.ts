import { PrismaDocumentRepository } from '@/src/repositories/prisma/prisma-document-repository';
import { CreateDocumentUseCase } from '../create-document';

export function makeCreateDocumentUseCase(): CreateDocumentUseCase {
  const documentRepository = new PrismaDocumentRepository();

  return new CreateDocumentUseCase(documentRepository);
}
