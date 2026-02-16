import { beforeEach, describe, expect, it } from 'vitest';
import { User } from '../@types/user';
import { InMemoryProjectMembersRepository } from '../repositories/in-memory/in-memory-project-members-repository';
import { InMemoryProjectRepository } from '../repositories/in-memory/in-memory-project-repository';
import { InMemoryUsersRepository } from '../repositories/in-memory/in-memory-users-repository';
import { AddProjectMemberUseCase } from './add-project-member';
import { ConflictError } from './errors/conflict-error';
import { InsufficientPermissionsError } from './errors/insufficient-permissions-error';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

let projectsRepository: InMemoryProjectRepository;
let projectMembersRepository: InMemoryProjectMembersRepository;
let usersRepository: InMemoryUsersRepository;
let sut: AddProjectMemberUseCase;

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

const mockUserToAdd: User = {
  id: 2,
  nome: 'New',
  sobrenome: 'Member',
  username: 'newmember',
  email: 'new@test.com',
  foto: '',
  telefone: '',
  admin: false,
  superadmin: false,
  idempresa: 1,
  empresa: 'Test Company',
  departamento: 'Design',
  time: 'Frontend',
  online: true,
};

describe('AddProjectMemberUseCase', () => {
  beforeEach(() => {
    projectsRepository = new InMemoryProjectRepository();
    projectMembersRepository = new InMemoryProjectMembersRepository();
    usersRepository = new InMemoryUsersRepository();

    sut = new AddProjectMemberUseCase(
      projectMembersRepository,
      projectsRepository,
      usersRepository
    );

    // Setup users
    usersRepository.items = [mockOwner, mockUserToAdd];
  });

  it('should add a new member to project', async () => {
    // Arrange
    const project = await projectsRepository.create({
      nome: 'Test Project',
      ownerId: mockOwner.id,
      idempresa: mockOwner.idempresa!,
    });

    // Act
    const result = await sut.execute({
      user: mockOwner,
      projectId: project.id,
      userId: mockUserToAdd.id,
      role: 'member',
    });

    // Assert
    expect(result.member).toMatchObject({
      projectId: project.id,
      userId: mockUserToAdd.id,
      role: 'member',
    });
    expect(result.member.user).toMatchObject({
      nome: 'New',
      sobrenome: 'Member',
      email: 'new@test.com',
    });
  });

  it('should throw error if project does not exist', async () => {
    // Act & Assert
    await expect(() =>
      sut.execute({
        user: mockOwner,
        projectId: 'non-existent-id',
        userId: mockUserToAdd.id,
        role: 'member',
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should throw error if user to add does not exist', async () => {
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
        role: 'member',
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should throw error if user is from different company', async () => {
    // Arrange
    const project = await projectsRepository.create({
      nome: 'Test Project',
      ownerId: mockOwner.id,
      idempresa: mockOwner.idempresa!,
    });

    const userFromOtherCompany: User = {
      ...mockUserToAdd,
      id: 3,
      idempresa: 2, // Different company
    };

    usersRepository.items.push(userFromOtherCompany);

    // Act & Assert
    await expect(() =>
      sut.execute({
        user: mockOwner,
        projectId: project.id,
        userId: userFromOtherCompany.id,
        role: 'member',
      })
    ).rejects.toBeInstanceOf(InsufficientPermissionsError);
  });

  it('should throw error if user is already a member', async () => {
    // Arrange
    const project = await projectsRepository.create({
      nome: 'Test Project',
      ownerId: mockOwner.id,
      idempresa: mockOwner.idempresa!,
    });

    await projectMembersRepository.create({
      projectId: project.id,
      userId: mockUserToAdd.id,
      role: 'member',
    });

    // Act & Assert
    await expect(() =>
      sut.execute({
        user: mockOwner,
        projectId: project.id,
        userId: mockUserToAdd.id,
        role: 'admin',
      })
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it('should allow adding user with owner role', async () => {
    // Arrange
    const project = await projectsRepository.create({
      nome: 'Test Project',
      ownerId: mockOwner.id,
      idempresa: mockOwner.idempresa!,
    });

    // Act
    const result = await sut.execute({
      user: mockOwner,
      projectId: project.id,
      userId: mockUserToAdd.id,
      role: 'owner',
    });

    // Assert
    expect(result.member.role).toBe('owner');
  });

  it('should allow superadmin to add members to any project', async () => {
    // Arrange
    const superadmin: User = { ...mockOwner, superadmin: true, idempresa: 2 };

    const project = await projectsRepository.create({
      nome: 'Test Project',
      ownerId: mockOwner.id,
      idempresa: 1, // Different company
    });

    // Act
    const result = await sut.execute({
      user: superadmin,
      projectId: project.id,
      userId: mockUserToAdd.id,
      role: 'member',
    });

    // Assert
    expect(result.member).toBeDefined();
  });
});
