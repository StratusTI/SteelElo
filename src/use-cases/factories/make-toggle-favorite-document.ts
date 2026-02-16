import { PrismaDocumentRepository } from '@/src/repositories/prisma/prisma-document-repository';
import { ToggleFavoriteDocumentUseCase } from '../toggle-favorite-document';

export function makeToggleFavoriteDocumentUseCase(): ToggleFavoriteDocumentUseCase {
  const documentRepository = new PrismaDocumentRepository();

  return new ToggleFavoriteDocumentUseCase(documentRepository);
}
