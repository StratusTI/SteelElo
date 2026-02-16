import type { DocumentWithChildren } from '../@types/document';
import type { AuthUser } from '../auth';
import type { DocumentRepository } from '../repositories/document-repository';

interface GetDocumentTreeUseCaseRequest {
  user: AuthUser;
  empresaId: number;
}

interface GetDocumentTreeUseCaseResponse {
  tree: DocumentWithChildren[];
}

export class GetDocumentTreeUseCase {
  constructor(private documentRepository: DocumentRepository) {}

  async execute({
    empresaId,
  }: GetDocumentTreeUseCaseRequest): Promise<GetDocumentTreeUseCaseResponse> {
    const tree = await this.documentRepository.getTree(empresaId);

    return { tree };
  }
}
