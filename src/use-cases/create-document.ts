import type { CreateDocumentRequest, Document } from '../@types/document';
import type { AuthUser } from '../auth';
import type { DocumentRepository } from '../repositories/document-repository';

interface CreateDocumentUseCaseRequest {
  user: AuthUser;
  data: CreateDocumentRequest;
}

interface CreateDocumentUseCaseResponse {
  document: Document;
}

export class CreateDocumentUseCase {
  constructor(private documentRepository: DocumentRepository) {}

  async execute({
    user,
    data,
  }: CreateDocumentUseCaseRequest): Promise<CreateDocumentUseCaseResponse> {
    const document = await this.documentRepository.create({
      ...data,
      empresaId: data.empresaId ?? user.enterpriseId,
      createdBy: user.id,
    });

    if (data.conteudo) {
      await this.documentRepository.createVersion({
        documentoId: document.id,
        conteudo: data.conteudo,
        usuarioId: user.id,
      });
    }

    return { document };
  }
}
