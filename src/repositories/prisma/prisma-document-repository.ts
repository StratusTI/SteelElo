import type {
  CreateDocumentRequest,
  CreateVersionRequest,
  Document,
  DocumentFilters,
  DocumentStatus,
  DocumentVersion,
  DocumentWithChildren,
  UpdateDocumentRequest,
} from '../../@types/document';
import { prismaElo } from '../../lib/prisma';
import type { DocumentRepository } from '../document-repository';

export class PrismaDocumentRepository implements DocumentRepository {
  async create(
    data: CreateDocumentRequest & { createdBy: number },
  ): Promise<Document> {
    const doc = await prismaElo.documento.create({
      data: {
        titulo: data.titulo,
        icone: data.icone ?? '📄',
        conteudo: data.conteudo ?? null,
        parentId: data.parentId ?? null,
        empresaId: data.empresaId ?? null,
        projetoId: data.projetoId ?? null,
        status: data.status ?? 'draft',
        createdBy: data.createdBy,
      },
    });

    return this.mapToDocument(doc);
  }

  async findById(id: string): Promise<Document | null> {
    const doc = await prismaElo.documento.findUnique({
      where: { id },
    });

    return doc ? this.mapToDocument(doc) : null;
  }

  async findByEmpresa(
    empresaId: number,
    filters?: DocumentFilters,
  ): Promise<Document[]> {
    const where: any = { empresaId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { titulo: { contains: filters.search } },
        { conteudo: { contains: filters.search } },
      ];
    }

    if (filters?.createdBy) {
      where.createdBy = filters.createdBy;
    }

    if (filters?.parentId !== undefined) {
      where.parentId = filters.parentId;
    }

    const docs = await prismaElo.documento.findMany({
      where,
      orderBy: [{ ordem: 'asc' }, { createdAt: 'desc' }],
    });

    return docs.map(this.mapToDocument);
  }

  async findByParentId(parentId: string): Promise<Document[]> {
    const docs = await prismaElo.documento.findMany({
      where: { parentId },
      orderBy: { ordem: 'asc' },
    });

    return docs.map(this.mapToDocument);
  }

  async findByPublicToken(token: string): Promise<Document | null> {
    const doc = await prismaElo.documento.findUnique({
      where: { publicShareToken: token },
    });

    return doc ? this.mapToDocument(doc) : null;
  }

  async update(id: string, data: UpdateDocumentRequest): Promise<Document> {
    const doc = await prismaElo.documento.update({
      where: { id },
      data: {
        titulo: data.titulo,
        icone: data.icone,
        conteudo: data.conteudo,
        status: data.status,
        parentId: data.parentId,
        ordem: data.ordem,
        isFullWidth: data.isFullWidth,
        publicShareToken: data.publicShareToken,
      },
    });

    return this.mapToDocument(doc);
  }

  async delete(id: string): Promise<void> {
    await prismaElo.documento.delete({
      where: { id },
    });
  }

  async getTree(empresaId: number): Promise<DocumentWithChildren[]> {
    const docs = await prismaElo.documento.findMany({
      where: {
        empresaId,
        status: { not: 'archived' },
      },
      orderBy: [{ ordem: 'asc' }, { createdAt: 'asc' }],
    });

    const mapped = docs.map(this.mapToDocument);
    return this.buildTree(mapped);
  }

  async addFavorite(documentoId: string, usuarioId: number): Promise<void> {
    await prismaElo.documentoFavorito.create({
      data: { documentoId, usuarioId },
    });
  }

  async removeFavorite(documentoId: string, usuarioId: number): Promise<void> {
    await prismaElo.documentoFavorito.delete({
      where: {
        documentoId_usuarioId: { documentoId, usuarioId },
      },
    });
  }

  async isFavorite(documentoId: string, usuarioId: number): Promise<boolean> {
    const fav = await prismaElo.documentoFavorito.findUnique({
      where: {
        documentoId_usuarioId: { documentoId, usuarioId },
      },
    });

    return fav !== null;
  }

  async findFavoritesByUser(
    usuarioId: number,
    empresaId: number,
  ): Promise<Document[]> {
    const favs = await prismaElo.documentoFavorito.findMany({
      where: { usuarioId },
      include: { documento: true },
    });

    return favs
      .filter((f) => f.documento.empresaId === empresaId)
      .map((f) => this.mapToDocument(f.documento));
  }

  async createVersion(data: CreateVersionRequest): Promise<DocumentVersion> {
    const lastVersion = await prismaElo.documentoVersao.findFirst({
      where: { documentoId: data.documentoId },
      orderBy: { versao: 'desc' },
    });

    const nextVersion = (lastVersion?.versao ?? 0) + 1;

    const contentBuffer = Buffer.from(data.conteudo, 'utf-8');
    const hashBuffer = await crypto.subtle.digest('SHA-256', contentBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    const version = await prismaElo.documentoVersao.create({
      data: {
        documentoId: data.documentoId,
        versao: nextVersion,
        conteudo: data.conteudo,
        usuarioId: data.usuarioId,
        comentario: data.comentario ?? null,
        hashConteudo: hashHex,
        tamanhoBytes: contentBuffer.byteLength,
      },
    });

    return this.mapToVersion(version);
  }

  async getVersions(documentoId: string): Promise<DocumentVersion[]> {
    const versions = await prismaElo.documentoVersao.findMany({
      where: { documentoId },
      orderBy: { versao: 'desc' },
    });

    return versions.map(this.mapToVersion);
  }

  async getVersion(
    documentoId: string,
    versao: number,
  ): Promise<DocumentVersion | null> {
    const version = await prismaElo.documentoVersao.findFirst({
      where: { documentoId, versao },
    });

    return version ? this.mapToVersion(version) : null;
  }

  private buildTree(docs: Document[]): DocumentWithChildren[] {
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

  private mapToDocument(data: any): Document {
    return {
      id: data.id,
      titulo: data.titulo,
      icone: data.icone,
      conteudo: data.conteudo,
      parentId: data.parentId,
      ordem: data.ordem,
      empresaId: data.empresaId,
      projetoId: data.projetoId,
      status: data.status as DocumentStatus,
      createdBy: data.createdBy,
      publicShareToken: data.publicShareToken,
      isFullWidth: data.isFullWidth,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private mapToVersion(data: any): DocumentVersion {
    return {
      id: data.id,
      documentoId: data.documentoId,
      versao: data.versao,
      conteudo: data.conteudo,
      usuarioId: data.usuarioId,
      comentario: data.comentario,
      hashConteudo: data.hashConteudo,
      createdAt: data.createdAt,
      alteracoesResumo: data.alteracoesResumo,
      tamanhoBytes: data.tamanhoBytes,
    };
  }
}
