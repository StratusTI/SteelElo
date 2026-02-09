import { beforeEach, describe, expect, it } from 'vitest';
import { AuthUser } from '../auth';
import { InMemoryQuickLinkRepository } from '../repositories/in-memory/in-memory-quick-link-repository';
import { DeleteQuickLinkUseCase } from './delete-quick-link';
import {
  QuickLinkNotFoundError,
  QuickLinkNotOwnedError,
} from './errors/quick-link-errors';

let quickLinkRepository: InMemoryQuickLinkRepository;
let sut: DeleteQuickLinkUseCase;

const mockUser: AuthUser = {
  id: 1,
  email: 'john@example.com',
  admin: false,
  superadmin: false,
  enterpriseId: 1,
};

describe('Delete Quick Link Use Case', () => {
  beforeEach(() => {
    quickLinkRepository = new InMemoryQuickLinkRepository();
    sut = new DeleteQuickLinkUseCase(quickLinkRepository);
  });

  it('should delete a quick link', async () => {
    const created = await quickLinkRepository.create({
      usuarioId: mockUser.id,
      url: 'https://example.com',
      titulo: 'Example',
    });

    await sut.execute({
      user: mockUser,
      quickLinkId: created.id,
    });

    const found = await quickLinkRepository.findById(created.id);
    expect(found).toBeNull();
  });

  it('should throw error when quick link not found', async () => {
    await expect(
      sut.execute({
        user: mockUser,
        quickLinkId: 999,
      })
    ).rejects.toBeInstanceOf(QuickLinkNotFoundError);
  });

  it('should throw error when user does not own the quick link', async () => {
    const otherUser: AuthUser = {
      ...mockUser,
      id: 2,
    };

    const created = await quickLinkRepository.create({
      usuarioId: otherUser.id,
      url: 'https://example.com',
      titulo: 'Example',
    });

    await expect(
      sut.execute({
        user: mockUser,
        quickLinkId: created.id,
      })
    ).rejects.toBeInstanceOf(QuickLinkNotOwnedError);
  });

  it('should not affect other quick links when deleting', async () => {
    const link1 = await quickLinkRepository.create({
      usuarioId: mockUser.id,
      url: 'https://example1.com',
      titulo: 'Example 1',
    });

    const link2 = await quickLinkRepository.create({
      usuarioId: mockUser.id,
      url: 'https://example2.com',
      titulo: 'Example 2',
    });

    await sut.execute({
      user: mockUser,
      quickLinkId: link1.id,
    });

    const remainingLinks = await quickLinkRepository.findByUserId(mockUser.id);
    expect(remainingLinks).toHaveLength(1);
    expect(remainingLinks[0].id).toBe(link2.id);
  });
});
