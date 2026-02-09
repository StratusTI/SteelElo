import { beforeEach, describe, expect, it } from 'vitest';
import { AuthUser } from '../auth';
import { InMemoryStickyRepository } from '../repositories/in-memory/in-memory-sticky-repository';
import { DeleteStickyUseCase } from './delete-sticky';
import {
  StickyNotFoundError,
  StickyNotOwnedError,
} from './errors/sticky-errors';

let stickyRepository: InMemoryStickyRepository;
let sut: DeleteStickyUseCase;

const mockUser: AuthUser = {
  id: 1,
  email: 'john@example.com',
  admin: false,
  superadmin: false,
  enterpriseId: 1,
};

describe('Delete Sticky Use Case', () => {
  beforeEach(() => {
    stickyRepository = new InMemoryStickyRepository();
    sut = new DeleteStickyUseCase(stickyRepository);
  });

  it('should delete a sticky', async () => {
    const created = await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'To be deleted',
    });

    await sut.execute({
      user: mockUser,
      stickyId: created.id,
    });

    const found = await stickyRepository.findById(created.id);
    expect(found).toBeNull();
  });

  it('should throw error when sticky not found', async () => {
    await expect(
      sut.execute({
        user: mockUser,
        stickyId: 999,
      })
    ).rejects.toBeInstanceOf(StickyNotFoundError);
  });

  it('should throw error when user does not own the sticky', async () => {
    const otherUser: AuthUser = {
      ...mockUser,
      id: 2,
    };

    const created = await stickyRepository.create({
      usuarioId: otherUser.id,
      content: 'Other user sticky',
    });

    await expect(
      sut.execute({
        user: mockUser,
        stickyId: created.id,
      })
    ).rejects.toBeInstanceOf(StickyNotOwnedError);
  });

  it('should not affect other stickies when deleting', async () => {
    const sticky1 = await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'First sticky',
    });

    const sticky2 = await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'Second sticky',
    });

    await sut.execute({
      user: mockUser,
      stickyId: sticky1.id,
    });

    const remainingStickies = await stickyRepository.findByUserId(mockUser.id);
    expect(remainingStickies).toHaveLength(1);
    expect(remainingStickies[0].id).toBe(sticky2.id);
  });
});
