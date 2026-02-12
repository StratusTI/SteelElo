import { beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../auth';
import { InMemoryDocumentRepository } from '../repositories/in-memory/in-memory-document-repository';
import { DocumentNotFoundError, DocumentNotOwnedError } from './errors/document-errors';
import { DeleteDocumentUseCase } from './delete-document';

let documentRepository: InMemoryDocumentRepository;
let sut: DeleteDocumentUseCase;

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

describe('Delete Document Use Case', () => {
  beforeEach(() => {
    documentRepository = new InMemoryDocumentRepository();
    sut = new DeleteDocumentUseCase(documentRepository);
  });

  it('should delete an existing document', async () => {
    const created = await documentRepository.create({
      titulo: 'To Delete',
      empresaId: 1,
      createdBy: mockUser.id,
    });

    await sut.execute({ user: mockUser, documentId: created.id });

    const found = await documentRepository.findById(created.id);
    expect(found).toBeNull();
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
