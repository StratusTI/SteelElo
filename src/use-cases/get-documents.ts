import type { Document, DocumentFilters } from '../@types/document';
import type { AuthUser } from '../auth';
import type { DocumentRepository } from '../repositories/document-repository';

interface GetDocumentsUseCaseRequest {
  user: AuthUser;
  empresaId: number;
  filters?: DocumentFilters;
}

interface GetDocumentsUseCaseResponse {
  documents: Document[];
}

export class GetDocumentsUseCase {
  constructor(private documentRepository: DocumentRepository) {}

  async execute({
    user,
    empresaId,
    filters,
  }: GetDocumentsUseCaseRequest): Promise<GetDocumentsUseCaseResponse> {
    const docs = await this.documentRepository.findByEmpresa(empresaId, filters);

    const documents = docs.filter((doc) => {
      if (doc.status === 'published') return true;
      if (doc.createdBy === user.id) return true;
      return false;
    });

    return { documents };
  }
}
