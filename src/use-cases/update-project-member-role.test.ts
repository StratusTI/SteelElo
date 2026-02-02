import { beforeEach, describe, expect, it } from 'vitest';
import { User } from '../@types/user';
import { InMemoryProjectMembersRepository } from '../repositories/in-memory/in-memory-project-members-repository';
import { InMemoryProjectRepository } from '../repositories/in-memory/in-memory-project-repository';
import { InsufficientPermissionsError } from './errors/insufficient-permissions-error';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { UpdateProjectMemberRoleUseCase } from './update-project-member-role';

let projectsRepository: InMemoryProjectRepository;
let projectMembersRepository: InMemoryProjectMembersRepository;
let sut: UpdateProjectMemberRoleUseCase;

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

describe('UpdateProjectMemberRoleUseCase', () => {
  beforeEach(() => {
    projectsRepository = new InMemoryProjectRepository();
    projectMembersRepository = new InMemoryProjectMembersRepository();

    sut = new UpdateProjectMemberRoleUseCase(
      projectMembersRepository,
      projectsRepository,
    );
  });

  it('should update member role', async () => {
    // Arrange
    const project = await projectsRepository.create({
      nome: 'Test Project',
      ownerId: mockOwner.id,
      idempresa: mockOwner.idempresa!,
    });

    const member = await projectMembersRepository.create({
      projectId: project.id,
      userId: 2,
      role: 'member',
    });

    // Act
    const result = await sut.execute({
      user: mockOwner,
      projectId: project.id,
      userId: 2,
      newRole: 'admin',
    });

    // Assert
    expect(result.member.role).toBe('admin');
  });

  it('should throw error if project does not exist', async () => {
    // Act & Assert
    await expect(() =>
      sut.execute({
        user: mockOwner,
        projectId: 999,
        userId: 2,
        newRole: 'admin',
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
        newRole: 'admin',
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should NOT allow changing role of last owner (RN1.4)', async () => {
    // Arrange
    const project = await projectsRepository.create({
      nome: 'Test Project',
      ownerId: mockOwner.id,
      idempresa: mockOwner.idempresa!,
    });

    const ownerMember = await projectMembersRepository.create({
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
        newRole: 'admin',
      })
    ).rejects.toBeInstanceOf(InsufficientPermissionsError);
  });

  it('should allow changing owner role if there is another owner', async () => {
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
      newRole: 'admin',
    });

    // Assert
    expect(result.member.role).toBe('admin');
  });

  it('should allow promoting member to owner', async () => {
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
      newRole: 'owner',
    });

    // Assert
    expect(result.member.role).toBe('owner');
  });
});
