import { beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../auth';
import { InMemoryDocumentRepository } from '../repositories/in-memory/in-memory-document-repository';
import { DocumentForbiddenError, DocumentNotFoundError } from './errors/document-errors';
import { DuplicateDocumentUseCase } from './duplicate-document';

let documentRepository: InMemoryDocumentRepository;
let sut: DuplicateDocumentUseCase;

const mockUser: AuthUser = {
  id: 1,
  email: 'john@example.com',
  admin: false,
  superadmin: false,
  enterpriseId: 1,
};

const otherUser: AuthUser = {
  id: 2,
  email: 'jane@example.com',
  admin: false,
  superadmin: false,
  enterpriseId: 1,
};

describe('Duplicate Document Use Case', () => {
  beforeEach(() => {
    documentRepository = new InMemoryDocumentRepository();
    sut = new DuplicateDocumentUseCase(documentRepository);
  });

  it('should duplicate a document with new title', async () => {
    const original = await documentRepository.create({
      titulo: 'Original',
      conteudo: '# Content',
      icone: '🚀',
      empresaId: 1,
      status: 'published',
      createdBy: mockUser.id,
    });

    const { document } = await sut.execute({
      user: mockUser,
      documentId: original.id,
    });

    expect(document.titulo).toBe('Original (cópia)');
    expect(document.conteudo).toBe('# Content');
    expect(document.icone).toBe('🚀');
    expect(document.status).toBe('draft');
    expect(document.id).not.toBe(original.id);
  });

  it('should create a version for the duplicate', async () => {
    const original = await documentRepository.create({
      titulo: 'With Content',
      conteudo: 'Some content',
      empresaId: 1,
      status: 'published',
      createdBy: mockUser.id,
    });

    const { document } = await sut.execute({
      user: mockUser,
      documentId: original.id,
    });

    const versions = await documentRepository.getVersions(document.id);
    expect(versions).toHaveLength(1);
  });

  it('should allow duplicating a published doc from another user', async () => {
    const original = await documentRepository.create({
      titulo: 'Public Doc',
      conteudo: 'Public content',
      empresaId: 1,
      status: 'published',
      createdBy: otherUser.id,
    });

    const { document } = await sut.execute({
      user: mockUser,
      documentId: original.id,
    });

    expect(document.createdBy).toBe(mockUser.id);
  });

  it('should throw DocumentForbiddenError for private doc of another user', async () => {
    const original = await documentRepository.create({
      titulo: 'Private Doc',
      empresaId: 1,
      status: 'private',
      createdBy: otherUser.id,
    });

    await expect(
      sut.execute({ user: mockUser, documentId: original.id }),
    ).rejects.toBeInstanceOf(DocumentForbiddenError);
  });

  it('should throw DocumentNotFoundError for non-existent document', async () => {
    await expect(
      sut.execute({ user: mockUser, documentId: 'non-existent-id' }),
    ).rejects.toBeInstanceOf(DocumentNotFoundError);
  });
});
