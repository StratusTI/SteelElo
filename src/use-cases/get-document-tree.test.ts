import { beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../auth';
import { InMemoryDocumentRepository } from '../repositories/in-memory/in-memory-document-repository';
import { GetDocumentTreeUseCase } from './get-document-tree';

let documentRepository: InMemoryDocumentRepository;
let sut: GetDocumentTreeUseCase;

const mockUser: AuthUser = {
  id: 1,
  email: 'john@example.com',
  admin: false,
  superadmin: false,
  enterpriseId: 1,
};

describe('Get Document Tree Use Case', () => {
  beforeEach(() => {
    documentRepository = new InMemoryDocumentRepository();
    sut = new GetDocumentTreeUseCase(documentRepository);
  });

  it('should return tree with nested children', async () => {
    const parent = await documentRepository.create({
      titulo: 'Parent',
      empresaId: 1,
      status: 'published',
      createdBy: mockUser.id,
    });

    await documentRepository.create({
      titulo: 'Child 1',
      empresaId: 1,
      parentId: parent.id,
      status: 'published',
      createdBy: mockUser.id,
    });

    await documentRepository.create({
      titulo: 'Child 2',
      empresaId: 1,
      parentId: parent.id,
      status: 'published',
      createdBy: mockUser.id,
    });

    const { tree } = await sut.execute({
      user: mockUser,
      empresaId: 1,
    });

    expect(tree).toHaveLength(1);
    expect(tree[0].titulo).toBe('Parent');
    expect(tree[0].children).toHaveLength(2);
  });

  it('should return empty tree when no documents exist', async () => {
    const { tree } = await sut.execute({
      user: mockUser,
      empresaId: 1,
    });

    expect(tree).toHaveLength(0);
  });

  it('should exclude archived documents from tree', async () => {
    await documentRepository.create({
      titulo: 'Active Doc',
      empresaId: 1,
      status: 'published',
      createdBy: mockUser.id,
    });

    await documentRepository.create({
      titulo: 'Archived Doc',
      empresaId: 1,
      status: 'archived',
      createdBy: mockUser.id,
    });

    const { tree } = await sut.execute({
      user: mockUser,
      empresaId: 1,
    });

    expect(tree).toHaveLength(1);
    expect(tree[0].titulo).toBe('Active Doc');
  });

  it('should handle deeply nested documents', async () => {
    const level1 = await documentRepository.create({
      titulo: 'Level 1',
      empresaId: 1,
      status: 'published',
      createdBy: mockUser.id,
    });

    const level2 = await documentRepository.create({
      titulo: 'Level 2',
      empresaId: 1,
      parentId: level1.id,
      status: 'published',
      createdBy: mockUser.id,
    });

    await documentRepository.create({
      titulo: 'Level 3',
      empresaId: 1,
      parentId: level2.id,
      status: 'published',
      createdBy: mockUser.id,
    });

    const { tree } = await sut.execute({
      user: mockUser,
      empresaId: 1,
    });

    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].children).toHaveLength(1);
    expect(tree[0].children[0].children[0].titulo).toBe('Level 3');
  });
});
