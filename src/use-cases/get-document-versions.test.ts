import { beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../auth';
import { InMemoryDocumentRepository } from '../repositories/in-memory/in-memory-document-repository';
import { DocumentForbiddenError, DocumentNotFoundError } from './errors/document-errors';
import { GetDocumentVersionsUseCase } from './get-document-versions';

let documentRepository: InMemoryDocumentRepository;
let sut: GetDocumentVersionsUseCase;

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

describe('Get Document Versions Use Case', () => {
  beforeEach(() => {
    documentRepository = new InMemoryDocumentRepository();
    sut = new GetDocumentVersionsUseCase(documentRepository);
  });

  it('should return versions for own document', async () => {
    const created = await documentRepository.create({
      titulo: 'Versioned Doc',
      empresaId: 1,
      createdBy: mockUser.id,
    });

    await documentRepository.createVersion({
      documentoId: created.id,
      conteudo: 'Version 1',
      usuarioId: mockUser.id,
    });
    await documentRepository.createVersion({
      documentoId: created.id,
      conteudo: 'Version 2',
      usuarioId: mockUser.id,
    });

    const { versions } = await sut.execute({
      user: mockUser,
      documentId: created.id,
    });

    expect(versions).toHaveLength(2);
    expect(versions[0].versao).toBe(2);
    expect(versions[1].versao).toBe(1);
  });

  it('should return empty array for document without versions', async () => {
    const created = await documentRepository.create({
      titulo: 'No Versions',
      empresaId: 1,
      createdBy: mockUser.id,
    });

    const { versions } = await sut.execute({
      user: mockUser,
      documentId: created.id,
    });

    expect(versions).toHaveLength(0);
  });

  it('should throw DocumentNotFoundError for non-existent document', async () => {
    await expect(
      sut.execute({ user: mockUser, documentId: 'non-existent-id' }),
    ).rejects.toBeInstanceOf(DocumentNotFoundError);
  });

  it('should throw DocumentForbiddenError for private doc of another user', async () => {
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
});
