import { beforeEach, describe, expect, it } from 'vitest';
import { AuthUser } from '../auth';
import { InMemoryStickyRepository } from '../repositories/in-memory/in-memory-sticky-repository';
import { CreateStickyUseCase } from './create-sticky';
import { InvalidStickyColorError } from './errors/sticky-errors';

let stickyRepository: InMemoryStickyRepository;
let sut: CreateStickyUseCase;

const mockUser: AuthUser = {
  id: 1,
  email: 'john@example.com',
  admin: false,
  superadmin: false,
  enterpriseId: 1,
};

describe('Create Sticky Use Case', () => {
  beforeEach(() => {
    stickyRepository = new InMemoryStickyRepository();
    sut = new CreateStickyUseCase(stickyRepository);
  });

  it('should create a sticky with content', async () => {
    const { sticky } = await sut.execute({
      user: mockUser,
      data: {
        content: 'My first sticky note',
      },
    });

    expect(sticky.id).toEqual(expect.any(Number));
    expect(sticky.content).toBe('My first sticky note');
    expect(sticky.usuarioId).toBe(mockUser.id);
    expect(sticky.backgroundColor).toBe('gray');
    expect(sticky.isBold).toBe(false);
    expect(sticky.isItalic).toBe(false);
  });

  it('should create a sticky with custom background color', async () => {
    const { sticky } = await sut.execute({
      user: mockUser,
      data: {
        content: 'Colorful sticky',
        backgroundColor: 'purple',
      },
    });

    expect(sticky.backgroundColor).toBe('purple');
  });

  it('should create a sticky with bold formatting', async () => {
    const { sticky } = await sut.execute({
      user: mockUser,
      data: {
        content: 'Bold text',
        isBold: true,
      },
    });

    expect(sticky.isBold).toBe(true);
  });

  it('should create a sticky with italic formatting', async () => {
    const { sticky } = await sut.execute({
      user: mockUser,
      data: {
        content: 'Italic text',
        isItalic: true,
      },
    });

    expect(sticky.isItalic).toBe(true);
  });

  it('should create a sticky with all formatting options', async () => {
    const { sticky } = await sut.execute({
      user: mockUser,
      data: {
        content: 'Styled sticky',
        backgroundColor: 'peach',
        isBold: true,
        isItalic: true,
      },
    });

    expect(sticky.backgroundColor).toBe('peach');
    expect(sticky.isBold).toBe(true);
    expect(sticky.isItalic).toBe(true);
  });

  it('should allow empty content for new stickies', async () => {
    const { sticky } = await sut.execute({
      user: mockUser,
      data: {
        content: '',
      },
    });

    expect(sticky.content).toBe('');
  });

  it('should trim whitespace-only content to empty', async () => {
    const { sticky } = await sut.execute({
      user: mockUser,
      data: {
        content: '   ',
      },
    });

    expect(sticky.content).toBe('');
  });

  it('should reject invalid background color', async () => {
    await expect(
      sut.execute({
        user: mockUser,
        data: {
          content: 'Some content',
          backgroundColor: 'invalid-color' as any,
        },
      })
    ).rejects.toBeInstanceOf(InvalidStickyColorError);
  });

  it('should trim content whitespace', async () => {
    const { sticky } = await sut.execute({
      user: mockUser,
      data: {
        content: '  Trimmed content  ',
      },
    });

    expect(sticky.content).toBe('Trimmed content');
  });

  it('should accept all valid colors', async () => {
    const colors = ['gray', 'peach', 'pink', 'orange', 'green', 'lightblue', 'darkblue', 'purple'] as const;

    for (const color of colors) {
      const { sticky } = await sut.execute({
        user: mockUser,
        data: {
          content: `Sticky with ${color}`,
          backgroundColor: color,
        },
      });

      expect(sticky.backgroundColor).toBe(color);
    }
  });
});
