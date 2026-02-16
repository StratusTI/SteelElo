import type { AuthUser } from '../auth';
import type { DocumentRepository } from '../repositories/document-repository';
import { DocumentNotFoundError } from './errors/document-errors';

interface ToggleFavoriteDocumentUseCaseRequest {
  user: AuthUser;
  documentId: string;
}

interface ToggleFavoriteDocumentUseCaseResponse {
  isFavorite: boolean;
}

export class ToggleFavoriteDocumentUseCase {
  constructor(private documentRepository: DocumentRepository) {}

  async execute({
    user,
    documentId,
  }: ToggleFavoriteDocumentUseCaseRequest): Promise<ToggleFavoriteDocumentUseCaseResponse> {
    const document = await this.documentRepository.findById(documentId);

    if (!document) {
      throw new DocumentNotFoundError();
    }

    const currentlyFavorite = await this.documentRepository.isFavorite(
      documentId,
      user.id,
    );

    if (currentlyFavorite) {
      await this.documentRepository.removeFavorite(documentId, user.id);
    } else {
      await this.documentRepository.addFavorite(documentId, user.id);
    }

    return { isFavorite: !currentlyFavorite };
  }
}
