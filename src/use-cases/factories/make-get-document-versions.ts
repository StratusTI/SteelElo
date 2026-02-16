import { PrismaDocumentRepository } from '@/src/repositories/prisma/prisma-document-repository';
import { GetDocumentVersionsUseCase } from '../get-document-versions';

export function makeGetDocumentVersionsUseCase(): GetDocumentVersionsUseCase {
  const documentRepository = new PrismaDocumentRepository();

  return new GetDocumentVersionsUseCase(documentRepository);
}
