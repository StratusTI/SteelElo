import { PrismaDocumentRepository } from '@/src/repositories/prisma/prisma-document-repository';
import { GetDocumentByTokenUseCase } from '../get-document-by-token';

export function makeGetDocumentByTokenUseCase(): GetDocumentByTokenUseCase {
  const documentRepository = new PrismaDocumentRepository();

  return new GetDocumentByTokenUseCase(documentRepository);
}
