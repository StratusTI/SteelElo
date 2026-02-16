import { createId } from '@paralleldrive/cuid2';
import type {
  CreateDocumentRequest,
  CreateVersionRequest,
  Document,
  DocumentFilters,
  DocumentStatus,
  DocumentVersion,
  DocumentWithChildren,
  UpdateDocumentRequest,
} from '@/src/@types/document';
import type { DocumentRepository } from '../document-repository';

export class InMemoryDocumentRepository implements DocumentRepository {
  public items: Document[] = [];
  public versions: DocumentVersion[] = [];
  public favorites: { documentoId: string; usuarioId: number }[] = [];

  async create(
    data: CreateDocumentRequest & { createdBy: number },
  ): Promise<Document> {
    const doc: Document = {
      id: createId(),
      titulo: data.titulo,
      icone: data.icone ?? '📄',
      conteudo: data.conteudo ?? null,
      parentId: data.parentId ?? null,
      ordem: 0,
      empresaId: data.empresaId ?? null,
      projetoId: data.projetoId ?? null,
      status: (data.status ?? 'draft') as DocumentStatus,
      createdBy: data.createdBy,
      publicShareToken: null,
      isFullWidth: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.push(doc);
    return doc;
  }

  async findById(id: string): Promise<Document | null> {
    return this.items.find((d) => d.id === id) || null;
  }

  async findByEmpresa(
    empresaId: number,
    filters?: DocumentFilters,
  ): Promise<Document[]> {
    let docs = this.items.filter((d) => d.empresaId === empresaId);

    if (filters?.status) {
      docs = docs.filter((d) => d.status === filters.status);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.titulo.toLowerCase().includes(search) ||
          d.conteudo?.toLowerCase().includes(search),
      );
    }

    if (filters?.createdBy) {
      docs = docs.filter((d) => d.createdBy === filters.createdBy);
    }

    if (filters?.parentId !== undefined) {
      docs = docs.filter((d) => d.parentId === filters.parentId);
    }

    if (filters?.favouriteUserId) {
      const favDocIds = this.favorites
        .filter((f) => f.usuarioId === filters.favouriteUserId)
        .map((f) => f.documentoId);
      docs = docs.filter((d) => favDocIds.includes(d.id));
    }

    docs.sort((a, b) => a.ordem - b.ordem || b.createdAt.getTime() - a.createdAt.getTime());

    return docs;
  }

  async findByParentId(parentId: string): Promise<Document[]> {
    return this.items
      .filter((d) => d.parentId === parentId)
      .sort((a, b) => a.ordem - b.ordem);
  }

  async findByPublicToken(token: string): Promise<Document | null> {
    return this.items.find((d) => d.publicShareToken === token) || null;
  }

  async update(id: string, data: UpdateDocumentRequest): Promise<Document> {
    const index = this.items.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error('Document not found');
    }

    const doc = this.items[index];
    this.items[index] = {
      ...doc,
      titulo: data.titulo ?? doc.titulo,
      icone: data.icone ?? doc.icone,
      conteudo: data.conteudo !== undefined ? data.conteudo : doc.conteudo,
      status: (data.status ?? doc.status) as DocumentStatus,
      parentId: data.parentId !== undefined ? data.parentId : doc.parentId,
      ordem: data.ordem ?? doc.ordem,
      isFullWidth: data.isFullWidth ?? doc.isFullWidth,
      publicShareToken: data.publicShareToken !== undefined ? data.publicShareToken : doc.publicShareToken,
      updatedAt: new Date(),
    };

    return this.items[index];
  }

  async delete(id: string): Promise<void> {
    const index = this.items.findIndex((d) => d.id === id);
    if (index === -1) {
      throw new Error('Document not found');
    }
    this.items.splice(index, 1);
    this.versions = this.versions.filter((v) => v.documentoId !== id);
    this.favorites = this.favorites.filter((f) => f.documentoId !== id);
  }

  async getTree(empresaId: number): Promise<DocumentWithChildren[]> {
    const docs = this.items.filter(
      (d) => d.empresaId === empresaId && d.status !== 'archived',
    );

    const map = new Map<string, DocumentWithChildren>();
    const roots: DocumentWithChildren[] = [];

    for (const doc of docs) {
      map.set(doc.id, { ...doc, children: [] });
    }

    for (const doc of docs) {
      const node = map.get(doc.id)!;
      if (doc.parentId && map.has(doc.parentId)) {
        map.get(doc.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  async addFavorite(documentoId: string, usuarioId: number): Promise<void> {
    this.favorites.push({ documentoId, usuarioId });
  }

  async removeFavorite(documentoId: string, usuarioId: number): Promise<void> {
    this.favorites = this.favorites.filter(
      (f) => !(f.documentoId === documentoId && f.usuarioId === usuarioId),
    );
  }

  async isFavorite(documentoId: string, usuarioId: number): Promise<boolean> {
    return this.favorites.some(
      (f) => f.documentoId === documentoId && f.usuarioId === usuarioId,
    );
  }

  async findFavoritesByUser(
    usuarioId: number,
    empresaId: number,
  ): Promise<Document[]> {
    const favDocIds = this.favorites
      .filter((f) => f.usuarioId === usuarioId)
      .map((f) => f.documentoId);

    return this.items.filter(
      (d) => favDocIds.includes(d.id) && d.empresaId === empresaId,
    );
  }

  async createVersion(data: CreateVersionRequest): Promise<DocumentVersion> {
    const existingVersions = this.versions.filter(
      (v) => v.documentoId === data.documentoId,
    );
    const nextVersion =
      existingVersions.length > 0
        ? Math.max(...existingVersions.map((v) => v.versao)) + 1
        : 1;

    const version: DocumentVersion = {
      id: createId(),
      documentoId: data.documentoId,
      versao: nextVersion,
      conteudo: data.conteudo,
      usuarioId: data.usuarioId,
      comentario: data.comentario ?? null,
      hashConteudo: null,
      createdAt: new Date(),
      alteracoesResumo: null,
      tamanhoBytes: Buffer.from(data.conteudo, 'utf-8').byteLength,
    };

    this.versions.push(version);
    return version;
  }

  async getVersions(documentoId: string): Promise<DocumentVersion[]> {
    return this.versions
      .filter((v) => v.documentoId === documentoId)
      .sort((a, b) => b.versao - a.versao);
  }

  async getVersion(
    documentoId: string,
    versao: number,
  ): Promise<DocumentVersion | null> {
    return (
      this.versions.find(
        (v) => v.documentoId === documentoId && v.versao === versao,
      ) || null
    );
  }
}
