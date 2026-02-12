import type { Document } from '../@types/document';
import type { AuthUser } from '../auth';
import type { DocumentRepository } from '../repositories/document-repository';
import {
  DocumentForbiddenError,
  DocumentNotFoundError,
} from './errors/document-errors';

interface GetDocumentByIdUseCaseRequest {
  user: AuthUser;
  documentId: string;
}

interface GetDocumentByIdUseCaseResponse {
  document: Document;
  isFavorite: boolean;
}

export class GetDocumentByIdUseCase {
  constructor(private documentRepository: DocumentRepository) {}

  async execute({
    user,
    documentId,
  }: GetDocumentByIdUseCaseRequest): Promise<GetDocumentByIdUseCaseResponse> {
    const document = await this.documentRepository.findById(documentId);

    if (!document) {
      throw new DocumentNotFoundError();
    }

    if (document.status !== 'published' && document.createdBy !== user.id) {
      throw new DocumentForbiddenError();
    }

    const isFavorite = await this.documentRepository.isFavorite(
      documentId,
      user.id,
    );

    return { document, isFavorite };
  }
}
