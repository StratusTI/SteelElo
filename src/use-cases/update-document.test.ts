import { beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../auth';
import { InMemoryDocumentRepository } from '../repositories/in-memory/in-memory-document-repository';
import { DocumentNotFoundError, DocumentNotOwnedError } from './errors/document-errors';
import { UpdateDocumentUseCase } from './update-document';

let documentRepository: InMemoryDocumentRepository;
let sut: UpdateDocumentUseCase;

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

describe('Update Document Use Case', () => {
  beforeEach(() => {
    documentRepository = new InMemoryDocumentRepository();
    sut = new UpdateDocumentUseCase(documentRepository);
  });

  it('should update document title', async () => {
    const created = await documentRepository.create({
      titulo: 'Old Title',
      empresaId: 1,
      createdBy: mockUser.id,
    });

    const { document } = await sut.execute({
      user: mockUser,
      documentId: created.id,
      data: { titulo: 'New Title' },
    });

    expect(document.titulo).toBe('New Title');
  });

  it('should update content and create a version', async () => {
    const created = await documentRepository.create({
      titulo: 'Doc',
      conteudo: 'original content',
      empresaId: 1,
      createdBy: mockUser.id,
    });

    await sut.execute({
      user: mockUser,
      documentId: created.id,
      data: { conteudo: 'updated content' },
    });

    const versions = await documentRepository.getVersions(created.id);
    expect(versions).toHaveLength(1);
    expect(versions[0].conteudo).toBe('updated content');
  });

  it('should not create a version when content does not change', async () => {
    const created = await documentRepository.create({
      titulo: 'Doc',
      conteudo: 'same content',
      empresaId: 1,
      createdBy: mockUser.id,
    });

    await sut.execute({
      user: mockUser,
      documentId: created.id,
      data: { conteudo: 'same content' },
    });

    const versions = await documentRepository.getVersions(created.id);
    expect(versions).toHaveLength(0);
  });

  it('should throw DocumentNotFoundError for non-existent document', async () => {
    await expect(
      sut.execute({ user: mockUser, documentId: 'non-existent-id', data: { titulo: 'x' } }),
    ).rejects.toBeInstanceOf(DocumentNotFoundError);
  });

  it('should throw DocumentNotOwnedError when user is not the owner', async () => {
    const created = await documentRepository.create({
      titulo: 'Other doc',
      empresaId: 1,
      createdBy: otherUser.id,
    });

    await expect(
      sut.execute({
        user: mockUser,
        documentId: created.id,
        data: { titulo: 'Hacked' },
      }),
    ).rejects.toBeInstanceOf(DocumentNotOwnedError);
  });

  it('should update document status', async () => {
    const created = await documentRepository.create({
      titulo: 'Doc',
      empresaId: 1,
      createdBy: mockUser.id,
    });

    const { document } = await sut.execute({
      user: mockUser,
      documentId: created.id,
      data: { status: 'private' },
    });

    expect(document.status).toBe('private');
  });
});
