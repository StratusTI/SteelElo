import { beforeEach, describe, expect, it } from 'vitest';
import { User } from '../@types/user';
import { ProjetoMemberRole } from '../generated/elo';
import { InMemoryProjectMembersRepository } from '../repositories/in-memory/in-memory-project-members-repository';
import { InMemoryProjectRepository } from '../repositories/in-memory/in-memory-project-repository';
import { CreateProjectUseCase } from './create-project';
import {
    InvalidColorFormatError,
    InvalidDateRangeError,
    ProjectNameAlreadyExistsError,
} from './errors/project-errors';

let projectsRepository: InMemoryProjectRepository;
let projectMembersRepository: InMemoryProjectMembersRepository;
let sut: CreateProjectUseCase;

const mockUser: User = {
  id: 1,
  nome: 'John',
  sobrenome: 'Doe',
  email: 'john@example.com',
  foto: '',
  telefone: '',
  admin: false,
  superadmin: false,
  idempresa: 1,
  departamento: 'Engineering',
  time: 'Backend',
  online: true,
};

describe('Create Project Use Case', () => {
  beforeEach(() => {
    projectsRepository = new InMemoryProjectRepository();
    projectMembersRepository = new InMemoryProjectMembersRepository();
    sut = new CreateProjectUseCase(
      projectsRepository,
      projectMembersRepository
    );
  });

  it('should create a project with default status', async () => {
    const { project } = await sut.execute({
      user: mockUser,
      data: {
        nome: 'New Project',
        descricao: 'Project description',
      },
    });

    expect(project.id).toEqual(expect.any(Number));
    expect(project.nome).toBe('New Project');
    expect(project.ownerId).toBe(mockUser.id);
    expect(project.idempresa).toBe(mockUser.idempresa);
    expect(project.status).toBe('draft');
  });

  it('should add owner as project member', async () => {
    const { project } = await sut.execute({
      user: mockUser,
      data: {
        nome: 'New Project',
      },
    });

    const members = await projectMembersRepository.findByProject(project.id);

    expect(members).toHaveLength(1);
    expect(members[0].usuarioId).toBe(mockUser.id);
    expect(members[0].role).toBe(ProjetoMemberRole.owner);
  });

  it('should not allow duplicate project names in the same company', async () => {
    await sut.execute({
      user: mockUser,
      data: {
        nome: 'Duplicate Project',
      },
    });

    await expect(
      sut.execute({
        user: mockUser,
        data: {
          nome: 'Duplicate Project',
        },
      })
    ).rejects.toBeInstanceOf(ProjectNameAlreadyExistsError);
  });

  it('should allow same project name in different companies', async () => {
    const userCompany1 = { ...mockUser, idempresa: 1 };
    const userCompany2 = { ...mockUser, id: 2, idempresa: 2 };

    await sut.execute({
      user: userCompany1,
      data: {
        nome: 'Same Name',
      },
    });

    const { project } = await sut.execute({
      user: userCompany2,
      data: {
        nome: 'Same Name',
      },
    });

    expect(project.nome).toBe('Same Name');
    expect(project.idempresa).toBe(2);
  });

  it('should validate date range (start < end)', async () => {
    await expect(
      sut.execute({
        user: mockUser,
        data: {
          nome: 'Invalid Dates',
          dataInicio: new Date('2024-12-31'),
          dataFim: new Date('2024-01-01'),
        },
      })
    ).rejects.toBeInstanceOf(InvalidDateRangeError);
  });

  it('should validate hex color format', async () => {
    await expect(
      sut.execute({
        user: mockUser,
        data: {
          nome: 'Invalid Color',
          backgroundUrl: 'invalid-color',
        },
      })
    ).rejects.toBeInstanceOf(InvalidColorFormatError);
  });

  it('should accept valid hex color', async () => {
    const { project } = await sut.execute({
      user: mockUser,
      data: {
        nome: 'Valid Color',
        backgroundUrl: '#FF5733',
      },
    });

    expect(project.backgroundUrl).toBe('#FF5733');
  });

  it('should create project with all optional fields', async () => {
    const { project } = await sut.execute({
      user: mockUser,
      data: {
        nome: 'Full Project',
        projectId: 'PROJ-001',
        descricao: 'Detailed description',
        icone: '🚀',
        backgroundUrl: '#3B82F6',
        dataInicio: new Date('2024-01-01'),
        dataFim: new Date('2024-12-31'),
        prioridade: 'high',
        acesso: true,
      },
    });

    expect(project.projectId).toBe('PROJ-001');
    expect(project.descricao).toBe('Detailed description');
    expect(project.icone).toBe('🚀');
    expect(project.prioridade).toBe('high');
  });
});
