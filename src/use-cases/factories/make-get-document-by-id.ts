import { PrismaDocumentRepository } from '@/src/repositories/prisma/prisma-document-repository';
import { GetDocumentByIdUseCase } from '../get-document-by-id';

export function makeGetDocumentByIdUseCase(): GetDocumentByIdUseCase {
  const documentRepository = new PrismaDocumentRepository();

  return new GetDocumentByIdUseCase(documentRepository);
}
