import type {
  CreateDocumentRequest,
  CreateVersionRequest,
  Document,
  DocumentFilters,
  DocumentVersion,
  DocumentWithChildren,
  UpdateDocumentRequest,
} from '../@types/document';

export interface DocumentRepository {
  create(data: CreateDocumentRequest & { createdBy: number }): Promise<Document>;
  findById(id: string): Promise<Document | null>;
  findByEmpresa(empresaId: number, filters?: DocumentFilters): Promise<Document[]>;
  findByParentId(parentId: string): Promise<Document[]>;
  findByPublicToken(token: string): Promise<Document | null>;
  update(id: string, data: UpdateDocumentRequest): Promise<Document>;
  delete(id: string): Promise<void>;
  getTree(empresaId: number): Promise<DocumentWithChildren[]>;

  addFavorite(documentoId: string, usuarioId: number): Promise<void>;
  removeFavorite(documentoId: string, usuarioId: number): Promise<void>;
  isFavorite(documentoId: string, usuarioId: number): Promise<boolean>;
  findFavoritesByUser(usuarioId: number, empresaId: number): Promise<Document[]>;

  createVersion(data: CreateVersionRequest): Promise<DocumentVersion>;
  getVersions(documentoId: string): Promise<DocumentVersion[]>;
  getVersion(documentoId: string, versao: number): Promise<DocumentVersion | null>;
}
