import { PrismaDocumentRepository } from '@/src/repositories/prisma/prisma-document-repository';
import { MoveDocumentUseCase } from '../move-document';

export function makeMoveDocumentUseCase(): MoveDocumentUseCase {
  const documentRepository = new PrismaDocumentRepository();

  return new MoveDocumentUseCase(documentRepository);
}
