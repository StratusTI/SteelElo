import { beforeEach, describe, expect, it } from 'vitest';
import { AuthUser } from '../auth';
import { InMemoryQuickLinkRepository } from '../repositories/in-memory/in-memory-quick-link-repository';
import { GetQuickLinksUseCase } from './get-quick-links';

let quickLinkRepository: InMemoryQuickLinkRepository;
let sut: GetQuickLinksUseCase;

const mockUser: AuthUser = {
  id: 1,
  email: 'john@example.com',
  admin: false,
  superadmin: false,
  enterpriseId: 1,
};

describe('Get Quick Links Use Case', () => {
  beforeEach(() => {
    quickLinkRepository = new InMemoryQuickLinkRepository();
    sut = new GetQuickLinksUseCase(quickLinkRepository);
  });

  it('should return empty array when user has no quick links', async () => {
    const { quickLinks } = await sut.execute({
      user: mockUser,
    });

    expect(quickLinks).toHaveLength(0);
  });

  it('should return all quick links for the user', async () => {
    await quickLinkRepository.create({
      usuarioId: mockUser.id,
      url: 'https://example1.com',
      titulo: 'Example 1',
    });

    await quickLinkRepository.create({
      usuarioId: mockUser.id,
      url: 'https://example2.com',
      titulo: 'Example 2',
    });

    const { quickLinks } = await sut.execute({
      user: mockUser,
    });

    expect(quickLinks).toHaveLength(2);
  });

  it('should not return quick links from other users', async () => {
    const otherUser: AuthUser = {
      ...mockUser,
      id: 2,
    };

    await quickLinkRepository.create({
      usuarioId: mockUser.id,
      url: 'https://example1.com',
      titulo: 'User 1 Link',
    });

    await quickLinkRepository.create({
      usuarioId: otherUser.id,
      url: 'https://example2.com',
      titulo: 'User 2 Link',
    });

    const { quickLinks } = await sut.execute({
      user: mockUser,
    });

    expect(quickLinks).toHaveLength(1);
    expect(quickLinks[0].usuarioId).toBe(mockUser.id);
  });

  it('should return quick links ordered by createdAt desc', async () => {
    await quickLinkRepository.create({
      usuarioId: mockUser.id,
      url: 'https://first.com',
      titulo: 'First',
    });

    // Simulate time passing
    await new Promise((resolve) => setTimeout(resolve, 10));

    await quickLinkRepository.create({
      usuarioId: mockUser.id,
      url: 'https://second.com',
      titulo: 'Second',
    });

    const { quickLinks } = await sut.execute({
      user: mockUser,
    });

    expect(quickLinks[0].titulo).toBe('Second');
    expect(quickLinks[1].titulo).toBe('First');
  });
});
