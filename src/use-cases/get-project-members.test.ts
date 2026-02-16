import { createId } from '@paralleldrive/cuid2';
import { beforeEach, describe, expect, it } from 'vitest';
import { User } from '../@types/user';
import { InMemoryProjectMembersRepository } from '../repositories/in-memory/in-memory-project-members-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { GetProjectMembersUseCase } from './get-project-members';

let projectMembersRepository: InMemoryProjectMembersRepository;
let sut: GetProjectMembersUseCase;

const mockUser: User = {
  id: 1,
  nome: 'John',
  sobrenome: 'Doe',
  username: 'johndoe',
  email: 'john@example.com',
  foto: '',
  telefone: '',
  admin: false,
  superadmin: false,
  idempresa: 1,
  empresa: 'Test Company',
  departamento: 'Engineering',
  time: 'Backend',
  online: true,
};

let testProjectId: string;

describe('GetProjectMembersUseCase', () => {
  beforeEach(() => {
    projectMembersRepository = new InMemoryProjectMembersRepository();
    sut = new GetProjectMembersUseCase(projectMembersRepository);

    testProjectId = createId();

    // Setup mock users
    projectMembersRepository.users = [
      { id: 1, nome: 'Alice', sobrenome: 'Admin', email: 'alice@test.com', foto: null },
      { id: 2, nome: 'Bob', sobrenome: 'Member', email: 'bob@test.com', foto: null },
      { id: 3, nome: 'Charlie', sobrenome: 'Owner', email: 'charlie@test.com', foto: null },
    ];
  });

  it('should get all members of a project', async () => {
    // Arrange
    await projectMembersRepository.create({
      projectId: testProjectId,
      userId: 1,
      role: 'admin',
    });

    await projectMembersRepository.create({
      projectId: testProjectId,
      userId: 2,
      role: 'member',
    });

    // Act
    const result = await sut.execute({
      user: mockUser,
      projectId: testProjectId,
    });

    // Assert
    expect(result.members).toHaveLength(2);
    expect(result.members[0]).toMatchObject({
      usuarioId: 1,
      role: 'admin',
    });
    expect(result.members[0].usuario).toMatchObject({
      nome: 'Alice',
      email: 'alice@test.com',
    });
  });

  it('should sort owners first, then alphabetically', async () => {
    // Arrange
    await projectMembersRepository.create({
      projectId: testProjectId,
      userId: 1,
      role: 'admin',
    });

    await projectMembersRepository.create({
      projectId: testProjectId,
      userId: 2,
      role: 'member',
    });

    await projectMembersRepository.create({
      projectId: testProjectId,
      userId: 3,
      role: 'owner',
    });

    // Act
    const result = await sut.execute({
      user: mockUser,
      projectId: testProjectId,
    });

    // Assert
    expect(result.members).toHaveLength(3);
    expect(result.members[0].role).toBe('owner'); // Owner first
    expect(result.members[1].usuario.nome).toBe('Alice'); // Then alphabetically
    expect(result.members[2].usuario.nome).toBe('Bob');
  });

  it('should throw error if project has no members', async () => {
    // Act & Assert
    await expect(() =>
      sut.execute({
        user: mockUser,
        projectId: 'non-existent-id',
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
