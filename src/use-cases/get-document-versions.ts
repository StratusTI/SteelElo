import type { DocumentVersion } from '../@types/document';
import type { AuthUser } from '../auth';
import type { DocumentRepository } from '../repositories/document-repository';
import {
  DocumentForbiddenError,
  DocumentNotFoundError,
} from './errors/document-errors';

interface GetDocumentVersionsUseCaseRequest {
  user: AuthUser;
  documentId: string;
}

interface GetDocumentVersionsUseCaseResponse {
  versions: DocumentVersion[];
}

export class GetDocumentVersionsUseCase {
  constructor(private documentRepository: DocumentRepository) {}

  async execute({
    user,
    documentId,
  }: GetDocumentVersionsUseCaseRequest): Promise<GetDocumentVersionsUseCaseResponse> {
    const document = await this.documentRepository.findById(documentId);

    if (!document) {
      throw new DocumentNotFoundError();
    }

    if (document.createdBy !== user.id && document.status !== 'published') {
      throw new DocumentForbiddenError();
    }

    const versions = await this.documentRepository.getVersions(documentId);

    return { versions };
  }
}
