import type { Document } from '../@types/document';
import type { AuthUser } from '../auth';
import type { DocumentRepository } from '../repositories/document-repository';
import {
  DocumentCircularReferenceError,
  DocumentNotFoundError,
  DocumentNotOwnedError,
} from './errors/document-errors';

interface MoveDocumentUseCaseRequest {
  user: AuthUser;
  documentId: string;
  parentId: string | null;
  ordem?: number;
  projetoId?: string | null;
}

interface MoveDocumentUseCaseResponse {
  document: Document;
}

export class MoveDocumentUseCase {
  constructor(private documentRepository: DocumentRepository) {}

  async execute({
    user,
    documentId,
    parentId,
    ordem,
    projetoId,
  }: MoveDocumentUseCaseRequest): Promise<MoveDocumentUseCaseResponse> {
    const existing = await this.documentRepository.findById(documentId);

    if (!existing) {
      throw new DocumentNotFoundError();
    }

    if (existing.createdBy !== user.id) {
      throw new DocumentNotOwnedError();
    }

    if (parentId !== null) {
      if (parentId === documentId) {
        throw new DocumentCircularReferenceError();
      }

      const parent = await this.documentRepository.findById(parentId);
      if (!parent) {
        throw new DocumentNotFoundError();
      }

      let currentId: string | null = parent.parentId;
      while (currentId !== null) {
        if (currentId === documentId) {
          throw new DocumentCircularReferenceError();
        }
        const ancestor = await this.documentRepository.findById(currentId);
        currentId = ancestor?.parentId ?? null;
      }
    }

    const updateData: { parentId: string | null; ordem?: number; projetoId?: string | null } = {
      parentId,
      ordem,
    };

    if (projetoId !== undefined) {
      updateData.projetoId = projetoId;
    }

    const document = await this.documentRepository.update(documentId, updateData);

    return { document };
  }
}
