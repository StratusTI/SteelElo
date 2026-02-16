import { PrismaDocumentRepository } from '@/src/repositories/prisma/prisma-document-repository';
import { GetDocumentTreeUseCase } from '../get-document-tree';

export function makeGetDocumentTreeUseCase(): GetDocumentTreeUseCase {
  const documentRepository = new PrismaDocumentRepository();

  return new GetDocumentTreeUseCase(documentRepository);
}
