import { beforeEach, describe, expect, it } from 'vitest';
import { AuthUser } from '../auth';
import { InMemoryQuickLinkRepository } from '../repositories/in-memory/in-memory-quick-link-repository';
import { CreateQuickLinkUseCase } from './create-quick-link';
import {
  InvalidUrlError,
  QuickLinkAlreadyExistsError,
} from './errors/quick-link-errors';

let quickLinkRepository: InMemoryQuickLinkRepository;
let sut: CreateQuickLinkUseCase;

const mockUser: AuthUser = {
  id: 1,
  email: 'john@example.com',
  admin: false,
  superadmin: false,
  enterpriseId: 1,
};

describe('Create Quick Link Use Case', () => {
  beforeEach(() => {
    quickLinkRepository = new InMemoryQuickLinkRepository();
    sut = new CreateQuickLinkUseCase(quickLinkRepository);
  });

  it('should create a quick link with valid URL', async () => {
    const { quickLink } = await sut.execute({
      user: mockUser,
      data: {
        url: 'https://example.com',
        titulo: 'Example',
      },
    });

    expect(quickLink.id).toEqual(expect.any(Number));
    expect(quickLink.url).toBe('https://example.com');
    expect(quickLink.titulo).toBe('Example');
    expect(quickLink.usuarioId).toBe(mockUser.id);
  });

  it('should create a quick link without titulo', async () => {
    const { quickLink } = await sut.execute({
      user: mockUser,
      data: {
        url: 'https://example.com',
      },
    });

    expect(quickLink.url).toBe('https://example.com');
    expect(quickLink.titulo).toBeNull();
  });

  it('should not allow duplicate URLs for the same user', async () => {
    await sut.execute({
      user: mockUser,
      data: {
        url: 'https://example.com',
        titulo: 'First Link',
      },
    });

    await expect(
      sut.execute({
        user: mockUser,
        data: {
          url: 'https://example.com',
          titulo: 'Second Link',
        },
      })
    ).rejects.toBeInstanceOf(QuickLinkAlreadyExistsError);
  });

  it('should allow same URL for different users', async () => {
    const userA = { ...mockUser, id: 1 };
    const userB = { ...mockUser, id: 2 };

    await sut.execute({
      user: userA,
      data: {
        url: 'https://example.com',
      },
    });

    const { quickLink } = await sut.execute({
      user: userB,
      data: {
        url: 'https://example.com',
      },
    });

    expect(quickLink.usuarioId).toBe(userB.id);
  });

  it('should reject invalid URL format', async () => {
    await expect(
      sut.execute({
        user: mockUser,
        data: {
          url: 'not-a-valid-url',
        },
      })
    ).rejects.toBeInstanceOf(InvalidUrlError);
  });

  it('should reject URL without http/https protocol', async () => {
    await expect(
      sut.execute({
        user: mockUser,
        data: {
          url: 'ftp://example.com',
        },
      })
    ).rejects.toBeInstanceOf(InvalidUrlError);
  });

  it('should accept http URL', async () => {
    const { quickLink } = await sut.execute({
      user: mockUser,
      data: {
        url: 'http://example.com',
      },
    });

    expect(quickLink.url).toBe('http://example.com');
  });

  it('should accept https URL', async () => {
    const { quickLink } = await sut.execute({
      user: mockUser,
      data: {
        url: 'https://example.com',
      },
    });

    expect(quickLink.url).toBe('https://example.com');
  });
});
