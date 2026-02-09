import { beforeEach, describe, expect, it } from 'vitest';
import { AuthUser } from '../auth';
import { InMemoryStickyRepository } from '../repositories/in-memory/in-memory-sticky-repository';
import { GetStickiesUseCase } from './get-stickies';

let stickyRepository: InMemoryStickyRepository;
let sut: GetStickiesUseCase;

const mockUser: AuthUser = {
  id: 1,
  email: 'john@example.com',
  admin: false,
  superadmin: false,
  enterpriseId: 1,
};

describe('Get Stickies Use Case', () => {
  beforeEach(() => {
    stickyRepository = new InMemoryStickyRepository();
    sut = new GetStickiesUseCase(stickyRepository);
  });

  it('should return empty array when user has no stickies', async () => {
    const { stickies } = await sut.execute({
      user: mockUser,
    });

    expect(stickies).toHaveLength(0);
  });

  it('should return all stickies for the user', async () => {
    await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'First sticky',
    });

    await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'Second sticky',
    });

    const { stickies } = await sut.execute({
      user: mockUser,
    });

    expect(stickies).toHaveLength(2);
  });

  it('should not return stickies from other users', async () => {
    const otherUser: AuthUser = {
      ...mockUser,
      id: 2,
    };

    await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'User 1 sticky',
    });

    await stickyRepository.create({
      usuarioId: otherUser.id,
      content: 'User 2 sticky',
    });

    const { stickies } = await sut.execute({
      user: mockUser,
    });

    expect(stickies).toHaveLength(1);
    expect(stickies[0].usuarioId).toBe(mockUser.id);
  });

  it('should return stickies ordered by createdAt desc (most recent first)', async () => {
    await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'First',
    });

    // Simulate time passing
    await new Promise((resolve) => setTimeout(resolve, 10));

    await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'Second',
    });

    const { stickies } = await sut.execute({
      user: mockUser,
    });

    expect(stickies[0].content).toBe('Second');
    expect(stickies[1].content).toBe('First');
  });

  it('should filter stickies by search term', async () => {
    await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'Important task to do',
    });

    await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'Meeting notes',
    });

    await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'Another task',
    });

    const { stickies } = await sut.execute({
      user: mockUser,
      filters: { search: 'task' },
    });

    expect(stickies).toHaveLength(2);
    expect(stickies.every((s) => s.content.toLowerCase().includes('task'))).toBe(true);
  });

  it('should be case-insensitive when searching', async () => {
    await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'IMPORTANT NOTE',
    });

    await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'important reminder',
    });

    const { stickies } = await sut.execute({
      user: mockUser,
      filters: { search: 'important' },
    });

    expect(stickies).toHaveLength(2);
  });

  it('should return empty array when search has no matches', async () => {
    await stickyRepository.create({
      usuarioId: mockUser.id,
      content: 'Some content',
    });

    const { stickies } = await sut.execute({
      user: mockUser,
      filters: { search: 'nonexistent' },
    });

    expect(stickies).toHaveLength(0);
  });
});
