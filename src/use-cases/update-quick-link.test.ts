import { beforeEach, describe, expect, it } from 'vitest';
import { AuthUser } from '../auth';
import { InMemoryQuickLinkRepository } from '../repositories/in-memory/in-memory-quick-link-repository';
import {
  InvalidUrlError,
  QuickLinkAlreadyExistsError,
  QuickLinkNotFoundError,
  QuickLinkNotOwnedError,
} from './errors/quick-link-errors';
import { UpdateQuickLinkUseCase } from './update-quick-link';

let quickLinkRepository: InMemoryQuickLinkRepository;
let sut: UpdateQuickLinkUseCase;

const mockUser: AuthUser = {
  id: 1,
  email: 'john@example.com',
  admin: false,
  superadmin: false,
  enterpriseId: 1,
};

describe('Update Quick Link Use Case', () => {
  beforeEach(() => {
    quickLinkRepository = new InMemoryQuickLinkRepository();
    sut = new UpdateQuickLinkUseCase(quickLinkRepository);
  });

  it('should update quick link titulo', async () => {
    const created = await quickLinkRepository.create({
      usuarioId: mockUser.id,
      url: 'https://example.com',
      titulo: 'Old Title',
    });

    const { quickLink } = await sut.execute({
      user: mockUser,
      quickLinkId: created.id,
      data: {
        titulo: 'New Title',
      },
    });

    expect(quickLink.titulo).toBe('New Title');
    expect(quickLink.url).toBe('https://example.com');
  });

  it('should update quick link URL', async () => {
    const created = await quickLinkRepository.create({
      usuarioId: mockUser.id,
      url: 'https://old-url.com',
      titulo: 'Example',
    });

    const { quickLink } = await sut.execute({
      user: mockUser,
      quickLinkId: created.id,
      data: {
        url: 'https://new-url.com',
      },
    });

    expect(quickLink.url).toBe('https://new-url.com');
    expect(quickLink.titulo).toBe('Example');
  });

  it('should throw error when quick link not found', async () => {
    await expect(
      sut.execute({
        user: mockUser,
        quickLinkId: 999,
        data: {
          titulo: 'New Title',
        },
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
        data: {
          titulo: 'Hacked Title',
        },
      })
    ).rejects.toBeInstanceOf(QuickLinkNotOwnedError);
  });

  it('should not allow updating to a duplicate URL', async () => {
    await quickLinkRepository.create({
      usuarioId: mockUser.id,
      url: 'https://existing-url.com',
      titulo: 'Existing',
    });

    const toUpdate = await quickLinkRepository.create({
      usuarioId: mockUser.id,
      url: 'https://my-url.com',
      titulo: 'To Update',
    });

    await expect(
      sut.execute({
        user: mockUser,
        quickLinkId: toUpdate.id,
        data: {
          url: 'https://existing-url.com',
        },
      })
    ).rejects.toBeInstanceOf(QuickLinkAlreadyExistsError);
  });

  it('should allow keeping the same URL when updating other fields', async () => {
    const created = await quickLinkRepository.create({
      usuarioId: mockUser.id,
      url: 'https://example.com',
      titulo: 'Old Title',
    });

    const { quickLink } = await sut.execute({
      user: mockUser,
      quickLinkId: created.id,
      data: {
        url: 'https://example.com',
        titulo: 'New Title',
      },
    });

    expect(quickLink.url).toBe('https://example.com');
    expect(quickLink.titulo).toBe('New Title');
  });

  it('should validate URL format on update', async () => {
    const created = await quickLinkRepository.create({
      usuarioId: mockUser.id,
      url: 'https://example.com',
      titulo: 'Example',
    });

    await expect(
      sut.execute({
        user: mockUser,
        quickLinkId: created.id,
        data: {
          url: 'not-a-valid-url',
        },
      })
    ).rejects.toBeInstanceOf(InvalidUrlError);
  });
});
