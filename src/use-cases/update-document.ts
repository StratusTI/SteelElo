import type { Document, UpdateDocumentRequest } from '../@types/document';
import type { AuthUser } from '../auth';
import type { DocumentRepository } from '../repositories/document-repository';
import {
  DocumentNotFoundError,
  DocumentNotOwnedError,
} from './errors/document-errors';

interface UpdateDocumentUseCaseRequest {
  user: AuthUser;
  documentId: string;
  data: UpdateDocumentRequest;
}

interface UpdateDocumentUseCaseResponse {
  document: Document;
}

export class UpdateDocumentUseCase {
  constructor(private documentRepository: DocumentRepository) {}

  async execute({
    user,
    documentId,
    data,
  }: UpdateDocumentUseCaseRequest): Promise<UpdateDocumentUseCaseResponse> {
    const existing = await this.documentRepository.findById(documentId);

    if (!existing) {
      throw new DocumentNotFoundError();
    }

    if (existing.createdBy !== user.id) {
      throw new DocumentNotOwnedError();
    }

    const contentChanged =
      data.conteudo !== undefined && data.conteudo !== existing.conteudo;

    const document = await this.documentRepository.update(documentId, data);

    if (contentChanged && data.conteudo) {
      await this.documentRepository.createVersion({
        documentoId: documentId,
        conteudo: data.conteudo,
        usuarioId: user.id,
      });
    }

    return { document };
  }
}
