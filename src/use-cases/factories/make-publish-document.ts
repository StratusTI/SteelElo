import { PrismaDocumentRepository } from '@/src/repositories/prisma/prisma-document-repository';
import { PublishDocumentUseCase } from '../publish-document';

export function makePublishDocumentUseCase(): PublishDocumentUseCase {
  const documentRepository = new PrismaDocumentRepository();

  return new PublishDocumentUseCase(documentRepository);
}
