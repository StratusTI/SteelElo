import { GET, POST } from '@/app/api/documents/route';
import { GET as GET_TREE } from '@/app/api/documents/tree/route';
import {
  DELETE,
  GET as GET_BY_ID,
  PATCH,
} from '@/app/api/documents/[id]/route';
import { POST as POST_ARCHIVE } from '@/app/api/documents/[id]/archive/route';
import { POST as POST_PUBLISH } from '@/app/api/documents/[id]/publish/route';
import { POST as POST_DUPLICATE } from '@/app/api/documents/[id]/duplicate/route';
import { POST as POST_FAVORITE } from '@/app/api/documents/[id]/favorite/route';
import { GET as GET_VERSIONS } from '@/app/api/documents/[id]/versions/route';
import { GET as GET_PUBLIC } from '@/app/api/documents/public/[token]/route';
import { type AuthUser, verifyAuth } from '@/src/auth';
import { makeCreateDocumentUseCase } from '@/src/use-cases/factories/make-create-document';
import { makeGetDocumentsUseCase } from '@/src/use-cases/factories/make-get-documents';
import { makeGetDocumentByIdUseCase } from '@/src/use-cases/factories/make-get-document-by-id';
import { makeGetDocumentByTokenUseCase } from '@/src/use-cases/factories/make-get-document-by-token';
import { makeUpdateDocumentUseCase } from '@/src/use-cases/factories/make-update-document';
import { makeDeleteDocumentUseCase } from '@/src/use-cases/factories/make-delete-document';
import { makeArchiveDocumentUseCase } from '@/src/use-cases/factories/make-archive-document';
import { makePublishDocumentUseCase } from '@/src/use-cases/factories/make-publish-document';
import { makeDuplicateDocumentUseCase } from '@/src/use-cases/factories/make-duplicate-document';
import { makeToggleFavoriteDocumentUseCase } from '@/src/use-cases/factories/make-toggle-favorite-document';
import { makeGetDocumentVersionsUseCase } from '@/src/use-cases/factories/make-get-document-versions';
import { makeGetDocumentTreeUseCase } from '@/src/use-cases/factories/make-get-document-tree';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/src/auth', () => ({
  verifyAuth: vi.fn(),
}));

vi.mock('@/src/utils/enrich-document-creator', () => ({
  enrichDocumentsWithCreator: vi.fn((docs) => Promise.resolve(docs)),
  enrichDocumentWithCreator: vi.fn((doc) => Promise.resolve(doc)),
}));

vi.mock('@/src/use-cases/factories/make-create-document', () => ({
  makeCreateDocumentUseCase: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-get-documents', () => ({
  makeGetDocumentsUseCase: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-get-document-by-id', () => ({
  makeGetDocumentByIdUseCase: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-get-document-by-token', () => ({
  makeGetDocumentByTokenUseCase: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-update-document', () => ({
  makeUpdateDocumentUseCase: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-delete-document', () => ({
  makeDeleteDocumentUseCase: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-archive-document', () => ({
  makeArchiveDocumentUseCase: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-publish-document', () => ({
  makePublishDocumentUseCase: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-duplicate-document', () => ({
  makeDuplicateDocumentUseCase: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-toggle-favorite-document', () => ({
  makeToggleFavoriteDocumentUseCase: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-get-document-versions', () => ({
  makeGetDocumentVersionsUseCase: vi.fn(),
}));

vi.mock('@/src/use-cases/factories/make-get-document-tree', () => ({
  makeGetDocumentTreeUseCase: vi.fn(),
}));

describe('Documents API', () => {
  const mockAuthUser: AuthUser = {
    id: 1,
    email: 'john.doe@example.com',
    admin: false,
    superadmin: false,
    enterpriseId: 1,
  };

  const mockDocId = 'clxyz1234567890abcdefgh';

  const mockDocument = {
    id: mockDocId,
    titulo: 'Test Document',
    icone: '📄',
    conteudo: '# Hello',
    parentId: null,
    ordem: 0,
    empresaId: 1,
    projetoId: null,
    status: 'draft',
    createdBy: 1,
    publicShareToken: null,
    isFullWidth: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/documents', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: null,
        error: Response.json(
          { success: false, statusCode: 401, error: { code: 'UNAUTHORIZED' } },
          { status: 401 },
        ) as any,
      });

      const request = new NextRequest('http://localhost/api/documents');
      const response = await GET(request);
      const data = await response?.json();

      expect(response?.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return documents when authenticated', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({ user: mockAuthUser });

      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({ documents: [mockDocument] }),
      };
      vi.mocked(makeGetDocumentsUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest('http://localhost/api/documents');
      const response = await GET(request);
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.data.documents).toHaveLength(1);
      expect(data.data.documents[0].titulo).toBe('Test Document');
    });

    it('should pass filters to use case', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({ user: mockAuthUser });

      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({ documents: [] }),
      };
      vi.mocked(makeGetDocumentsUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest(
        'http://localhost/api/documents?status=published&search=test',
      );
      await GET(request);

      expect(mockUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          filters: expect.objectContaining({
            status: 'published',
            search: 'test',
          }),
        }),
      );
    });
  });

  describe('POST /api/documents', () => {
    it('should return 401 when not authenticated', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({
        user: null,
        error: Response.json(
          { success: false, statusCode: 401, error: { code: 'UNAUTHORIZED' } },
          { status: 401 },
        ) as any,
      });

      const request = new NextRequest('http://localhost/api/documents', {
        method: 'POST',
        body: JSON.stringify({ titulo: 'Test' }),
      });

      const response = await POST(request);
      expect(response?.status).toBe(401);
    });

    it('should create document with valid data', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({ user: mockAuthUser });

      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({ document: mockDocument }),
      };
      vi.mocked(makeCreateDocumentUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest('http://localhost/api/documents', {
        method: 'POST',
        body: JSON.stringify({ titulo: 'Test Document' }),
      });

      const response = await POST(request);
      const data = await response?.json();

      expect(response?.status).toBe(201);
      expect(data.message).toBe('Document created successfully');
    });

    it('should return validation error for missing titulo', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({ user: mockAuthUser });

      const request = new NextRequest('http://localhost/api/documents', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response?.json();

      expect(response?.status).toBe(422);
      expect(data.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/documents/[id]', () => {
    it('should return 400 for invalid ID', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({ user: mockAuthUser });

      const request = new NextRequest('http://localhost/api/documents/abc');
      const response = await GET_BY_ID(request, {
        params: Promise.resolve({ id: 'abc' }),
      });
      const data = await response?.json();

      expect(response?.status).toBe(400);
      expect(data.error.code).toBe('BAD_REQUEST');
    });

    it('should return document by id', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({ user: mockAuthUser });

      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({
          document: mockDocument,
          isFavorite: false,
        }),
      };
      vi.mocked(makeGetDocumentByIdUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest(`http://localhost/api/documents/${mockDocId}`);
      const response = await GET_BY_ID(request, {
        params: Promise.resolve({ id: mockDocId }),
      });
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.data.document.titulo).toBe('Test Document');
      expect(data.data.isFavorite).toBe(false);
    });
  });

  describe('PATCH /api/documents/[id]', () => {
    it('should update document', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({ user: mockAuthUser });

      const updatedDoc = { ...mockDocument, titulo: 'Updated Title' };
      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({ document: updatedDoc }),
      };
      vi.mocked(makeUpdateDocumentUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest(`http://localhost/api/documents/${mockDocId}`, {
        method: 'PATCH',
        body: JSON.stringify({ titulo: 'Updated Title' }),
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: mockDocId }),
      });
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.data.document.titulo).toBe('Updated Title');
    });
  });

  describe('DELETE /api/documents/[id]', () => {
    it('should delete document', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({ user: mockAuthUser });

      const mockUseCase = {
        execute: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(makeDeleteDocumentUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest(`http://localhost/api/documents/${mockDocId}`, {
        method: 'DELETE',
      });

      const response = await DELETE(request, {
        params: Promise.resolve({ id: mockDocId }),
      });
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.message).toBe('Document deleted successfully');
    });
  });

  describe('POST /api/documents/[id]/archive', () => {
    it('should archive document', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({ user: mockAuthUser });

      const archivedDoc = { ...mockDocument, status: 'archived' };
      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({ document: archivedDoc }),
      };
      vi.mocked(makeArchiveDocumentUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest(
        `http://localhost/api/documents/${mockDocId}/archive`,
        { method: 'POST' },
      );

      const response = await POST_ARCHIVE(request, {
        params: Promise.resolve({ id: mockDocId }),
      });
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.data.document.status).toBe('archived');
    });
  });

  describe('POST /api/documents/[id]/publish', () => {
    it('should publish document and return token', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({ user: mockAuthUser });

      const publishedDoc = {
        ...mockDocument,
        status: 'published',
        publicShareToken: 'share-token-123',
      };
      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({ document: publishedDoc }),
      };
      vi.mocked(makePublishDocumentUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest(
        `http://localhost/api/documents/${mockDocId}/publish`,
        { method: 'POST' },
      );

      const response = await POST_PUBLISH(request, {
        params: Promise.resolve({ id: mockDocId }),
      });
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.data.document.publicShareToken).toBe('share-token-123');
    });
  });

  describe('POST /api/documents/[id]/favorite', () => {
    it('should toggle favorite', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({ user: mockAuthUser });

      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({ isFavorite: true }),
      };
      vi.mocked(makeToggleFavoriteDocumentUseCase).mockReturnValue(
        mockUseCase as any,
      );

      const request = new NextRequest(
        `http://localhost/api/documents/${mockDocId}/favorite`,
        { method: 'POST' },
      );

      const response = await POST_FAVORITE(request, {
        params: Promise.resolve({ id: mockDocId }),
      });
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.data.isFavorite).toBe(true);
    });
  });

  describe('GET /api/documents/[id]/versions', () => {
    it('should return versions', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({ user: mockAuthUser });

      const mockVersions = [
        { id: 'v1id', documentoId: mockDocId, versao: 2, conteudo: 'v2', usuarioId: 1, createdAt: new Date() },
        { id: 'v2id', documentoId: mockDocId, versao: 1, conteudo: 'v1', usuarioId: 1, createdAt: new Date() },
      ];
      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({ versions: mockVersions }),
      };
      vi.mocked(makeGetDocumentVersionsUseCase).mockReturnValue(
        mockUseCase as any,
      );

      const request = new NextRequest(
        `http://localhost/api/documents/${mockDocId}/versions`,
      );

      const response = await GET_VERSIONS(request, {
        params: Promise.resolve({ id: mockDocId }),
      });
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.data.versions).toHaveLength(2);
    });
  });

  describe('GET /api/documents/public/[token]', () => {
    it('should return public document without auth', async () => {
      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({
          document: { ...mockDocument, status: 'published', publicShareToken: 'token123' },
        }),
      };
      vi.mocked(makeGetDocumentByTokenUseCase).mockReturnValue(
        mockUseCase as any,
      );

      const request = new NextRequest(
        'http://localhost/api/documents/public/token123',
      );

      const response = await GET_PUBLIC(request, {
        params: Promise.resolve({ token: 'token123' }),
      });
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.data.document.publicShareToken).toBe('token123');
    });
  });

  describe('GET /api/documents/tree', () => {
    it('should return document tree', async () => {
      vi.mocked(verifyAuth).mockResolvedValue({ user: mockAuthUser });

      const mockTree = [
        { ...mockDocument, children: [{ ...mockDocument, id: 2, titulo: 'Child', children: [] }] },
      ];
      const mockUseCase = {
        execute: vi.fn().mockResolvedValue({ tree: mockTree }),
      };
      vi.mocked(makeGetDocumentTreeUseCase).mockReturnValue(mockUseCase as any);

      const request = new NextRequest(
        'http://localhost/api/documents/tree',
      );

      const response = await GET_TREE(request);
      const data = await response?.json();

      expect(response?.status).toBe(200);
      expect(data.data.tree).toHaveLength(1);
      expect(data.data.tree[0].children).toHaveLength(1);
    });
  });
});
