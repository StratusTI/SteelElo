import { beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../auth';
import { InMemoryDocumentRepository } from '../repositories/in-memory/in-memory-document-repository';
import {
  DocumentAlreadyArchivedError,
  DocumentNotFoundError,
  DocumentNotOwnedError,
} from './errors/document-errors';
import { ArchiveDocumentUseCase } from './archive-document';

let documentRepository: InMemoryDocumentRepository;
let sut: ArchiveDocumentUseCase;

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

describe('Archive Document Use Case', () => {
  beforeEach(() => {
    documentRepository = new InMemoryDocumentRepository();
    sut = new ArchiveDocumentUseCase(documentRepository);
  });

  it('should archive a document', async () => {
    const created = await documentRepository.create({
      titulo: 'To Archive',
      empresaId: 1,
      status: 'draft',
      createdBy: mockUser.id,
    });

    const { document } = await sut.execute({
      user: mockUser,
      documentId: created.id,
    });

    expect(document.status).toBe('archived');
  });

  it('should throw DocumentAlreadyArchivedError for already archived document', async () => {
    const created = await documentRepository.create({
      titulo: 'Already Archived',
      empresaId: 1,
      status: 'archived',
      createdBy: mockUser.id,
    });

    await expect(
      sut.execute({ user: mockUser, documentId: created.id }),
    ).rejects.toBeInstanceOf(DocumentAlreadyArchivedError);
  });

  it('should throw DocumentNotFoundError for non-existent document', async () => {
    await expect(
      sut.execute({ user: mockUser, documentId: 'non-existent-id' }),
    ).rejects.toBeInstanceOf(DocumentNotFoundError);
  });

  it('should throw DocumentNotOwnedError when user is not the owner', async () => {
    const created = await documentRepository.create({
      titulo: 'Other doc',
      empresaId: 1,
      createdBy: otherUser.id,
    });

    await expect(
      sut.execute({ user: mockUser, documentId: created.id }),
    ).rejects.toBeInstanceOf(DocumentNotOwnedError);
  });
});
