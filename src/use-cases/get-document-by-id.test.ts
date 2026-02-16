import { beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../auth';
import { InMemoryDocumentRepository } from '../repositories/in-memory/in-memory-document-repository';
import { DocumentForbiddenError, DocumentNotFoundError } from './errors/document-errors';
import { GetDocumentByIdUseCase } from './get-document-by-id';

let documentRepository: InMemoryDocumentRepository;
let sut: GetDocumentByIdUseCase;

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

describe('Get Document By Id Use Case', () => {
  beforeEach(() => {
    documentRepository = new InMemoryDocumentRepository();
    sut = new GetDocumentByIdUseCase(documentRepository);
  });

  it('should return a published document for any user', async () => {
    const created = await documentRepository.create({
      titulo: 'Public Doc',
      empresaId: 1,
      status: 'published',
      createdBy: otherUser.id,
    });

    const { document } = await sut.execute({
      user: mockUser,
      documentId: created.id,
    });

    expect(document.titulo).toBe('Public Doc');
  });

  it('should return own private document', async () => {
    const created = await documentRepository.create({
      titulo: 'My Private',
      empresaId: 1,
      status: 'private',
      createdBy: mockUser.id,
    });

    const { document } = await sut.execute({
      user: mockUser,
      documentId: created.id,
    });

    expect(document.titulo).toBe('My Private');
  });

  it('should throw DocumentNotFoundError for non-existent document', async () => {
    await expect(
      sut.execute({ user: mockUser, documentId: 'non-existent-id' }),
    ).rejects.toBeInstanceOf(DocumentNotFoundError);
  });

  it('should throw DocumentForbiddenError for other users private document', async () => {
    const created = await documentRepository.create({
      titulo: 'Other Private',
      empresaId: 1,
      status: 'private',
      createdBy: otherUser.id,
    });

    await expect(
      sut.execute({ user: mockUser, documentId: created.id }),
    ).rejects.toBeInstanceOf(DocumentForbiddenError);
  });

  it('should return isFavorite status', async () => {
    const created = await documentRepository.create({
      titulo: 'Fav Doc',
      empresaId: 1,
      status: 'published',
      createdBy: mockUser.id,
    });

    await documentRepository.addFavorite(created.id, mockUser.id);

    const { isFavorite } = await sut.execute({
      user: mockUser,
      documentId: created.id,
    });

    expect(isFavorite).toBe(true);
  });
});
