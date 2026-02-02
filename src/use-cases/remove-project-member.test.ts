import { beforeEach, describe, expect, it } from 'vitest';
import { User } from '../@types/user';
import { InMemoryProjectMembersRepository } from '../repositories/in-memory/in-memory-project-members-repository';
import { InMemoryProjectRepository } from '../repositories/in-memory/in-memory-project-repository';
import { InsufficientPermissionsError } from './errors/insufficient-permissions-error';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { RemoveProjectMemberUseCase } from './remove-project-member';

let projectsRepository: InMemoryProjectRepository;
let projectMembersRepository: InMemoryProjectMembersRepository;
let sut: RemoveProjectMemberUseCase;

const mockOwner: User = {
  id: 1,
  nome: 'Owner',
  sobrenome: 'User',
  username: 'owneruser',
  email: 'owner@test.com',
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

describe('RemoveProjectMemberUseCase', () => {
  beforeEach(() => {
    projectsRepository = new InMemoryProjectRepository();
    projectMembersRepository = new InMemoryProjectMembersRepository();

    sut = new RemoveProjectMemberUseCase(
      projectMembersRepository,
      projectsRepository,
    );
  });

  it('should remove a member from project', async () => {
    // Arrange
    const project = await projectsRepository.create({
      nome: 'Test Project',
      ownerId: mockOwner.id,
      idempresa: mockOwner.idempresa!,
    });

    await projectMembersRepository.create({
      projectId: project.id,
      userId: 2,
      role: 'member',
    });

    // Act
    const result = await sut.execute({
      user: mockOwner,
      projectId: project.id,
      userId: 2,
    });

    // Assert
    expect(result.success).toBe(true);

    const members = await projectMembersRepository.findByProject(project.id);
    expect(members).toHaveLength(0);
  });

  it('should throw error if project does not exist', async () => {
    // Act & Assert
    await expect(() =>
      sut.execute({
        user: mockOwner,
        projectId: 999,
        userId: 2,
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should throw error if membership does not exist', async () => {
    // Arrange
    const project = await projectsRepository.create({
      nome: 'Test Project',
      ownerId: mockOwner.id,
      idempresa: mockOwner.idempresa!,
    });

    // Act & Assert
    await expect(() =>
      sut.execute({
        user: mockOwner,
        projectId: project.id,
        userId: 999,
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should NOT allow removing last owner (RN1.4)', async () => {
    // Arrange
    const project = await projectsRepository.create({
      nome: 'Test Project',
      ownerId: mockOwner.id,
      idempresa: mockOwner.idempresa!,
    });

    await projectMembersRepository.create({
      projectId: project.id,
      userId: mockOwner.id,
      role: 'owner',
    });

    // Act & Assert
    await expect(() =>
      sut.execute({
        user: mockOwner,
        projectId: project.id,
        userId: mockOwner.id,
      })
    ).rejects.toBeInstanceOf(InsufficientPermissionsError);
  });

  it('should allow removing owner if there is another owner', async () => {
    // Arrange
    const project = await projectsRepository.create({
      nome: 'Test Project',
      ownerId: mockOwner.id,
      idempresa: mockOwner.idempresa!,
    });

    // Create two owners
    await projectMembersRepository.create({
      projectId: project.id,
      userId: mockOwner.id,
      role: 'owner',
    });

    await projectMembersRepository.create({
      projectId: project.id,
      userId: 2,
      role: 'owner',
    });

    // Act
    const result = await sut.execute({
      user: mockOwner,
      projectId: project.id,
      userId: 2,
    });

    // Assert
    expect(result.success).toBe(true);

    const ownerCount = await projectMembersRepository.countOwners(project.id);
    expect(ownerCount).toBe(1);
  });

  it('should allow removing non-owner members', async () => {
    // Arrange
    const project = await projectsRepository.create({
      nome: 'Test Project',
      ownerId: mockOwner.id,
      idempresa: mockOwner.idempresa!,
    });

    await projectMembersRepository.create({
      projectId: project.id,
      userId: 2,
      role: 'member',
    });

    await projectMembersRepository.create({
      projectId: project.id,
      userId: 3,
      role: 'admin',
    });

    // Act
    const result1 = await sut.execute({
      user: mockOwner,
      projectId: project.id,
      userId: 2,
    });

    const result2 = await sut.execute({
      user: mockOwner,
      projectId: project.id,
      userId: 3,
    });

    // Assert
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
  });
});
