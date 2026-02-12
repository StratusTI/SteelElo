import type { Document } from '../@types/document';
import type { AuthUser } from '../auth';
import type { DocumentRepository } from '../repositories/document-repository';
import {
  DocumentNotFoundError,
  DocumentNotOwnedError,
} from './errors/document-errors';

interface PublishDocumentUseCaseRequest {
  user: AuthUser;
  documentId: string;
}

interface PublishDocumentUseCaseResponse {
  document: Document;
}

export class PublishDocumentUseCase {
  constructor(private documentRepository: DocumentRepository) {}

  async execute({
    user,
    documentId,
  }: PublishDocumentUseCaseRequest): Promise<PublishDocumentUseCaseResponse> {
    const existing = await this.documentRepository.findById(documentId);

    if (!existing) {
      throw new DocumentNotFoundError();
    }

    if (existing.createdBy !== user.id) {
      throw new DocumentNotOwnedError();
    }

    const publicShareToken =
      existing.publicShareToken ?? crypto.randomUUID().replace(/-/g, '');

    const document = await this.documentRepository.update(documentId, {
      status: 'published',
      publicShareToken,
    });

    return { document };
  }
}
