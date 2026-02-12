import { beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../auth';
import { InMemoryDocumentRepository } from '../repositories/in-memory/in-memory-document-repository';
import { GetDocumentsUseCase } from './get-documents';

let documentRepository: InMemoryDocumentRepository;
let sut: GetDocumentsUseCase;

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

describe('Get Documents Use Case', () => {
  beforeEach(() => {
    documentRepository = new InMemoryDocumentRepository();
    sut = new GetDocumentsUseCase(documentRepository);
  });

  it('should return published documents for any user in the enterprise', async () => {
    await documentRepository.create({
      titulo: 'Public Doc',
      empresaId: 1,
      status: 'published',
      createdBy: otherUser.id,
    });

    const { documents } = await sut.execute({
      user: mockUser,
      empresaId: 1,
    });

    expect(documents).toHaveLength(1);
    expect(documents[0].titulo).toBe('Public Doc');
  });

  it('should return own private documents', async () => {
    await documentRepository.create({
      titulo: 'My Private Doc',
      empresaId: 1,
      status: 'private',
      createdBy: mockUser.id,
    });

    const { documents } = await sut.execute({
      user: mockUser,
      empresaId: 1,
    });

    expect(documents).toHaveLength(1);
  });

  it('should NOT return other users private documents', async () => {
    await documentRepository.create({
      titulo: 'Other Private Doc',
      empresaId: 1,
      status: 'private',
      createdBy: otherUser.id,
    });

    const { documents } = await sut.execute({
      user: mockUser,
      empresaId: 1,
    });

    expect(documents).toHaveLength(0);
  });

  it('should filter by status', async () => {
    await documentRepository.create({
      titulo: 'Draft Doc',
      empresaId: 1,
      status: 'draft',
      createdBy: mockUser.id,
    });
    await documentRepository.create({
      titulo: 'Published Doc',
      empresaId: 1,
      status: 'published',
      createdBy: mockUser.id,
    });

    const { documents } = await sut.execute({
      user: mockUser,
      empresaId: 1,
      filters: { status: 'draft' },
    });

    expect(documents).toHaveLength(1);
    expect(documents[0].titulo).toBe('Draft Doc');
  });

  it('should filter by search term', async () => {
    await documentRepository.create({
      titulo: 'Architecture Guide',
      empresaId: 1,
      status: 'published',
      createdBy: mockUser.id,
    });
    await documentRepository.create({
      titulo: 'API Reference',
      empresaId: 1,
      status: 'published',
      createdBy: mockUser.id,
    });

    const { documents } = await sut.execute({
      user: mockUser,
      empresaId: 1,
      filters: { search: 'Architecture' },
    });

    expect(documents).toHaveLength(1);
    expect(documents[0].titulo).toBe('Architecture Guide');
  });

  it('should return empty array when no documents exist', async () => {
    const { documents } = await sut.execute({
      user: mockUser,
      empresaId: 1,
    });

    expect(documents).toHaveLength(0);
  });
});
