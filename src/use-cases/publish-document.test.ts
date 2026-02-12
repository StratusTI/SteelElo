import { beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../auth';
import { InMemoryDocumentRepository } from '../repositories/in-memory/in-memory-document-repository';
import { DocumentNotFoundError, DocumentNotOwnedError } from './errors/document-errors';
import { PublishDocumentUseCase } from './publish-document';

let documentRepository: InMemoryDocumentRepository;
let sut: PublishDocumentUseCase;

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

describe('Publish Document Use Case', () => {
  beforeEach(() => {
    documentRepository = new InMemoryDocumentRepository();
    sut = new PublishDocumentUseCase(documentRepository);
  });

  it('should publish a document and generate a share token', async () => {
    const created = await documentRepository.create({
      titulo: 'To Publish',
      empresaId: 1,
      status: 'draft',
      createdBy: mockUser.id,
    });

    const { document } = await sut.execute({
      user: mockUser,
      documentId: created.id,
    });

    expect(document.status).toBe('published');
    expect(document.publicShareToken).toBeTruthy();
    expect(document.publicShareToken!.length).toBeGreaterThan(0);
  });

  it('should keep existing token when re-publishing', async () => {
    const created = await documentRepository.create({
      titulo: 'Already Shared',
      empresaId: 1,
      status: 'draft',
      createdBy: mockUser.id,
    });

    await documentRepository.update(created.id, {
      publicShareToken: 'existing-token',
    });

    const { document } = await sut.execute({
      user: mockUser,
      documentId: created.id,
    });

    expect(document.publicShareToken).toBe('existing-token');
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
