import { beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../auth';
import { InMemoryDocumentRepository } from '../repositories/in-memory/in-memory-document-repository';
import { DocumentNotFoundError } from './errors/document-errors';
import { ToggleFavoriteDocumentUseCase } from './toggle-favorite-document';

let documentRepository: InMemoryDocumentRepository;
let sut: ToggleFavoriteDocumentUseCase;

const mockUser: AuthUser = {
  id: 1,
  email: 'john@example.com',
  admin: false,
  superadmin: false,
  enterpriseId: 1,
};

describe('Toggle Favorite Document Use Case', () => {
  beforeEach(() => {
    documentRepository = new InMemoryDocumentRepository();
    sut = new ToggleFavoriteDocumentUseCase(documentRepository);
  });

  it('should add document to favorites', async () => {
    const created = await documentRepository.create({
      titulo: 'Fav Doc',
      empresaId: 1,
      createdBy: mockUser.id,
    });

    const { isFavorite } = await sut.execute({
      user: mockUser,
      documentId: created.id,
    });

    expect(isFavorite).toBe(true);
  });

  it('should remove document from favorites on second toggle', async () => {
    const created = await documentRepository.create({
      titulo: 'Fav Doc',
      empresaId: 1,
      createdBy: mockUser.id,
    });

    await sut.execute({ user: mockUser, documentId: created.id });
    const { isFavorite } = await sut.execute({
      user: mockUser,
      documentId: created.id,
    });

    expect(isFavorite).toBe(false);
  });

  it('should throw DocumentNotFoundError for non-existent document', async () => {
    await expect(
      sut.execute({ user: mockUser, documentId: 'non-existent-id' }),
    ).rejects.toBeInstanceOf(DocumentNotFoundError);
  });
});
