import { beforeEach, describe, expect, it } from 'vitest';
import { InMemoryDocumentRepository } from '../repositories/in-memory/in-memory-document-repository';
import { DocumentNotFoundError } from './errors/document-errors';
import { GetDocumentByTokenUseCase } from './get-document-by-token';

let documentRepository: InMemoryDocumentRepository;
let sut: GetDocumentByTokenUseCase;

describe('Get Document By Token Use Case', () => {
  beforeEach(() => {
    documentRepository = new InMemoryDocumentRepository();
    sut = new GetDocumentByTokenUseCase(documentRepository);
  });

  it('should return published document by token', async () => {
    const created = await documentRepository.create({
      titulo: 'Shared Doc',
      empresaId: 1,
      status: 'published',
      createdBy: 1,
    });

    await documentRepository.update(created.id, {
      publicShareToken: 'abc123token',
    });

    const { document } = await sut.execute({ token: 'abc123token' });

    expect(document.titulo).toBe('Shared Doc');
  });

  it('should throw DocumentNotFoundError for invalid token', async () => {
    await expect(
      sut.execute({ token: 'nonexistent' }),
    ).rejects.toBeInstanceOf(DocumentNotFoundError);
  });

  it('should throw DocumentNotFoundError for non-published document', async () => {
    const created = await documentRepository.create({
      titulo: 'Draft Doc',
      empresaId: 1,
      status: 'draft',
      createdBy: 1,
    });

    await documentRepository.update(created.id, {
      publicShareToken: 'draft-token',
    });

    await expect(
      sut.execute({ token: 'draft-token' }),
    ).rejects.toBeInstanceOf(DocumentNotFoundError);
  });
});
