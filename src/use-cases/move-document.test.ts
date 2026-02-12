import { beforeEach, describe, expect, it } from 'vitest';
import type { AuthUser } from '../auth';
import { InMemoryDocumentRepository } from '../repositories/in-memory/in-memory-document-repository';
import {
  DocumentCircularReferenceError,
  DocumentNotFoundError,
  DocumentNotOwnedError,
} from './errors/document-errors';
import { MoveDocumentUseCase } from './move-document';

let documentRepository: InMemoryDocumentRepository;
let sut: MoveDocumentUseCase;

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

describe('Move Document Use Case', () => {
  beforeEach(() => {
    documentRepository = new InMemoryDocumentRepository();
    sut = new MoveDocumentUseCase(documentRepository);
  });

  it('should move document to a new parent', async () => {
    const parent = await documentRepository.create({
      titulo: 'New Parent',
      empresaId: 1,
      createdBy: mockUser.id,
    });

    const child = await documentRepository.create({
      titulo: 'Child',
      empresaId: 1,
      createdBy: mockUser.id,
    });

    const { document } = await sut.execute({
      user: mockUser,
      documentId: child.id,
      parentId: parent.id,
    });

    expect(document.parentId).toBe(parent.id);
  });

  it('should move document to root (parentId = null)', async () => {
    const parent = await documentRepository.create({
      titulo: 'Parent',
      empresaId: 1,
      createdBy: mockUser.id,
    });

    const child = await documentRepository.create({
      titulo: 'Child',
      empresaId: 1,
      parentId: parent.id,
      createdBy: mockUser.id,
    });

    const { document } = await sut.execute({
      user: mockUser,
      documentId: child.id,
      parentId: null,
    });

    expect(document.parentId).toBeNull();
  });

  it('should throw DocumentCircularReferenceError when moving to self', async () => {
    const doc = await documentRepository.create({
      titulo: 'Self',
      empresaId: 1,
      createdBy: mockUser.id,
    });

    await expect(
      sut.execute({ user: mockUser, documentId: doc.id, parentId: doc.id }),
    ).rejects.toBeInstanceOf(DocumentCircularReferenceError);
  });

  it('should throw DocumentCircularReferenceError for circular reference', async () => {
    const parent = await documentRepository.create({
      titulo: 'Parent',
      empresaId: 1,
      createdBy: mockUser.id,
    });

    const child = await documentRepository.create({
      titulo: 'Child',
      empresaId: 1,
      parentId: parent.id,
      createdBy: mockUser.id,
    });

    await expect(
      sut.execute({ user: mockUser, documentId: parent.id, parentId: child.id }),
    ).rejects.toBeInstanceOf(DocumentCircularReferenceError);
  });

  it('should throw DocumentNotFoundError for non-existent document', async () => {
    await expect(
      sut.execute({ user: mockUser, documentId: 'non-existent-id', parentId: null }),
    ).rejects.toBeInstanceOf(DocumentNotFoundError);
  });

  it('should throw DocumentNotOwnedError when user is not the owner', async () => {
    const doc = await documentRepository.create({
      titulo: 'Other doc',
      empresaId: 1,
      createdBy: otherUser.id,
    });

    await expect(
      sut.execute({ user: mockUser, documentId: doc.id, parentId: null }),
    ).rejects.toBeInstanceOf(DocumentNotOwnedError);
  });
});
