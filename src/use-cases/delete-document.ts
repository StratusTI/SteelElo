import type { AuthUser } from '../auth';
import type { DocumentRepository } from '../repositories/document-repository';
import {
  DocumentNotFoundError,
  DocumentNotOwnedError,
} from './errors/document-errors';

interface DeleteDocumentUseCaseRequest {
  user: AuthUser;
  documentId: string;
}

export class DeleteDocumentUseCase {
  constructor(private documentRepository: DocumentRepository) {}

  async execute({ user, documentId }: DeleteDocumentUseCaseRequest): Promise<void> {
    const document = await this.documentRepository.findById(documentId);

    if (!document) {
      throw new DocumentNotFoundError();
    }

    if (document.createdBy !== user.id) {
      throw new DocumentNotOwnedError();
    }

    await this.documentRepository.delete(documentId);
  }
}
