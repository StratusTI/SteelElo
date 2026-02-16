import { beforeEach, describe, expect, it } from 'vitest';
import { AuthUser } from '../auth';
import { InMemoryStickyRepository } from '../repositories/in-memory/in-memory-sticky-repository';
import {
  EmptyStickyContentError,
  InvalidStickyColorError,
  StickyNotFoundError,
  StickyNotOwnedError,
} from './errors/sticky-errors';
import { UpdateStickyUseCase } from './update-sticky';

let stickyRepository: InMemoryStickyRepository;
let sut: UpdateStickyUseCase;

const mockUser: AuthUser = {
  id: 1,
  email: 'john@example.com',
  admin: false,
  superadmin: false,
  enterpriseId: 1,
};

describe('Update Sticky Use Case', () => {
  beforeEach(() => {
    stickyRepository = new InMemoryStickyRepository();
    sut = new UpdateStickyUseCase(stickyRepository);
  });

  it('should update sticky content', async () => {
    const created = await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'Old content',
    });

    const { sticky } = await sut.execute({
      user: mockUser,
      stickyId: created.id,
      data: {
        content: 'New content',
      },
    });

    expect(sticky.content).toBe('New content');
  });

  it('should update sticky background color', async () => {
    const created = await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'Some content',
      backgroundColor: 'gray',
    });

    const { sticky } = await sut.execute({
      user: mockUser,
      stickyId: created.id,
      data: {
        backgroundColor: 'purple',
      },
    });

    expect(sticky.backgroundColor).toBe('purple');
    expect(sticky.content).toBe('Some content');
  });

  it('should update sticky bold formatting', async () => {
    const created = await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'Some content',
      isBold: false,
    });

    const { sticky } = await sut.execute({
      user: mockUser,
      stickyId: created.id,
      data: {
        isBold: true,
      },
    });

    expect(sticky.isBold).toBe(true);
  });

  it('should update sticky italic formatting', async () => {
    const created = await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'Some content',
      isItalic: false,
    });

    const { sticky } = await sut.execute({
      user: mockUser,
      stickyId: created.id,
      data: {
        isItalic: true,
      },
    });

    expect(sticky.isItalic).toBe(true);
  });

  it('should throw error when sticky not found', async () => {
    await expect(
      sut.execute({
        user: mockUser,
        stickyId: 999,
        data: {
          content: 'New content',
        },
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
        data: {
          content: 'Hacked content',
        },
      })
    ).rejects.toBeInstanceOf(StickyNotOwnedError);
  });

  it('should reject empty content update', async () => {
    const created = await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'Some content',
    });

    await expect(
      sut.execute({
        user: mockUser,
        stickyId: created.id,
        data: {
          content: '',
        },
      })
    ).rejects.toBeInstanceOf(EmptyStickyContentError);
  });

  it('should reject invalid background color', async () => {
    const created = await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'Some content',
    });

    await expect(
      sut.execute({
        user: mockUser,
        stickyId: created.id,
        data: {
          backgroundColor: 'invalid' as any,
        },
      })
    ).rejects.toBeInstanceOf(InvalidStickyColorError);
  });

  it('should trim content when updating', async () => {
    const created = await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'Original',
    });

    const { sticky } = await sut.execute({
      user: mockUser,
      stickyId: created.id,
      data: {
        content: '  Updated with spaces  ',
      },
    });

    expect(sticky.content).toBe('Updated with spaces');
  });
});
