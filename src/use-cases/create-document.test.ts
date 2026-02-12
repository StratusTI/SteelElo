import { beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../auth';
import { InMemoryDocumentRepository } from '../repositories/in-memory/in-memory-document-repository';
import { CreateDocumentUseCase } from './create-document';

let documentRepository: InMemoryDocumentRepository;
let sut: CreateDocumentUseCase;

const mockUser: AuthUser = {
  id: 1,
  email: 'john@example.com',
  admin: false,
  superadmin: false,
  enterpriseId: 1,
};

describe('Create Document Use Case', () => {
  beforeEach(() => {
    documentRepository = new InMemoryDocumentRepository();
    sut = new CreateDocumentUseCase(documentRepository);
  });

  it('should create a document with title', async () => {
    const { document } = await sut.execute({
      user: mockUser,
      data: { titulo: 'My Document' },
    });

    expect(document.id).toEqual(expect.any(String));
    expect(document.titulo).toBe('My Document');
    expect(document.createdBy).toBe(mockUser.id);
    expect(document.status).toBe('draft');
    expect(document.icone).toBe('📄');
  });

  it('should create a document with content and generate a version', async () => {
    const { document } = await sut.execute({
      user: mockUser,
      data: { titulo: 'Doc with content', conteudo: '# Hello World' },
    });

    expect(document.conteudo).toBe('# Hello World');

    const versions = await documentRepository.getVersions(document.id);
    expect(versions).toHaveLength(1);
    expect(versions[0].conteudo).toBe('# Hello World');
    expect(versions[0].versao).toBe(1);
  });

  it('should create a document without content and not generate a version', async () => {
    const { document } = await sut.execute({
      user: mockUser,
      data: { titulo: 'Empty doc' },
    });

    const versions = await documentRepository.getVersions(document.id);
    expect(versions).toHaveLength(0);
    expect(document.conteudo).toBeNull();
  });

  it('should create a document with custom icon', async () => {
    const { document } = await sut.execute({
      user: mockUser,
      data: { titulo: 'Rocket doc', icone: '🚀' },
    });

    expect(document.icone).toBe('🚀');
  });

  it('should create a document with parentId', async () => {
    const { document: parent } = await sut.execute({
      user: mockUser,
      data: { titulo: 'Parent doc' },
    });

    const { document: child } = await sut.execute({
      user: mockUser,
      data: { titulo: 'Child doc', parentId: parent.id },
    });

    expect(child.parentId).toBe(parent.id);
  });

  it('should default status to draft', async () => {
    const { document } = await sut.execute({
      user: mockUser,
      data: { titulo: 'Draft doc' },
    });

    expect(document.status).toBe('draft');
  });

  it('should set empresaId from user when not provided', async () => {
    const { document } = await sut.execute({
      user: mockUser,
      data: { titulo: 'Enterprise doc' },
    });

    expect(document.empresaId).toBe(mockUser.enterpriseId);
  });

  it('should allow explicit empresaId', async () => {
    const { document } = await sut.execute({
      user: mockUser,
      data: { titulo: 'Other enterprise', empresaId: 99 },
    });

    expect(document.empresaId).toBe(99);
  });
});
