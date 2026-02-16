import { PrismaDocumentRepository } from '@/src/repositories/prisma/prisma-document-repository';
import { GetDocumentsUseCase } from '../get-documents';

export function makeGetDocumentsUseCase(): GetDocumentsUseCase {
  const documentRepository = new PrismaDocumentRepository();

  return new GetDocumentsUseCase(documentRepository);
}
