import type { Document } from '../@types/document';
import type { AuthUser } from '../auth';
import type { DocumentRepository } from '../repositories/document-repository';
import {
  DocumentForbiddenError,
  DocumentNotFoundError,
} from './errors/document-errors';

interface DuplicateDocumentUseCaseRequest {
  user: AuthUser;
  documentId: string;
}

interface DuplicateDocumentUseCaseResponse {
  document: Document;
}

export class DuplicateDocumentUseCase {
  constructor(private documentRepository: DocumentRepository) {}

  async execute({
    user,
    documentId,
  }: DuplicateDocumentUseCaseRequest): Promise<DuplicateDocumentUseCaseResponse> {
    const original = await this.documentRepository.findById(documentId);

    if (!original) {
      throw new DocumentNotFoundError();
    }

    if (original.status !== 'published' && original.createdBy !== user.id) {
      throw new DocumentForbiddenError();
    }

    const document = await this.documentRepository.create({
      titulo: `${original.titulo} (cópia)`,
      icone: original.icone,
      conteudo: original.conteudo ?? undefined,
      parentId: original.parentId ?? undefined,
      empresaId: original.empresaId ?? undefined,
      projetoId: original.projetoId ?? undefined,
      status: 'draft',
      createdBy: user.id,
    });

    if (original.conteudo) {
      await this.documentRepository.createVersion({
        documentoId: document.id,
        conteudo: original.conteudo,
        usuarioId: user.id,
        comentario: `Cópia do documento #${original.id}`,
      });
    }

    return { document };
  }
}
