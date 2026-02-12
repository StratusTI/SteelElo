import type { Document } from '../@types/document';
import type { DocumentRepository } from '../repositories/document-repository';
import { DocumentNotFoundError } from './errors/document-errors';

interface GetDocumentByTokenUseCaseRequest {
  token: string;
}

interface GetDocumentByTokenUseCaseResponse {
  document: Document;
}

export class GetDocumentByTokenUseCase {
  constructor(private documentRepository: DocumentRepository) {}

  async execute({
    token,
  }: GetDocumentByTokenUseCaseRequest): Promise<GetDocumentByTokenUseCaseResponse> {
    const document = await this.documentRepository.findByPublicToken(token);

    if (!document || document.status !== 'published') {
      throw new DocumentNotFoundError();
    }

    return { document };
  }
}
