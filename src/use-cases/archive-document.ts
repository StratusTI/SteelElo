import type { Document } from '../@types/document';
import type { AuthUser } from '../auth';
import type { DocumentRepository } from '../repositories/document-repository';
import {
  DocumentAlreadyArchivedError,
  DocumentNotFoundError,
  DocumentNotOwnedError,
} from './errors/document-errors';

interface ArchiveDocumentUseCaseRequest {
  user: AuthUser;
  documentId: string;
}

interface ArchiveDocumentUseCaseResponse {
  document: Document;
}

export class ArchiveDocumentUseCase {
  constructor(private documentRepository: DocumentRepository) {}

  async execute({
    user,
    documentId,
  }: ArchiveDocumentUseCaseRequest): Promise<ArchiveDocumentUseCaseResponse> {
    const existing = await this.documentRepository.findById(documentId);

    if (!existing) {
      throw new DocumentNotFoundError();
    }

    if (existing.createdBy !== user.id) {
      throw new DocumentNotOwnedError();
    }

    if (existing.status === 'archived') {
      throw new DocumentAlreadyArchivedError();
    }

    const document = await this.documentRepository.update(documentId, {
      status: 'archived',
    });

    return { document };
  }
}
