import { beforeEach, describe, expect, it } from 'vitest';
import { User } from '../@types/user';
import { ProjetoPriority, ProjetoStatus } from '../generated/elo';
import { InMemoryProjectRepository } from '../repositories/in-memory/in-memory-project-repository';
import {
    InvalidColorFormatError,
    InvalidDateRangeError,
    ProjectNameAlreadyExistsError,
} from './errors/project-errors';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { UpdateProjectUseCase } from './update-project';

let projectsRepository: InMemoryProjectRepository;
let sut: UpdateProjectUseCase;

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

describe('Update Project Use Case', () => {
  beforeEach(async () => {
    projectsRepository = new InMemoryProjectRepository();
    sut = new UpdateProjectUseCase(projectsRepository);

    // Criar projeto inicial para testes
    await projectsRepository.create({
      nome: 'Existing Project',
      ownerId: mockUser.id,
      idempresa: mockUser.idempresa!,
      status: ProjetoStatus.draft,
    });
  });

  it('should update project name', async () => {
    const { project } = await sut.execute({
      user: mockUser,
      userRole: 'admin',
      projectId: 1,
      data: {
        nome: 'Updated Project',
      },
    });

    expect(project.nome).toBe('Updated Project');
  });

  it('should update project description', async () => {
    const { project } = await sut.execute({
      user: mockUser,
      userRole: 'admin',
      projectId: 1,
      data: {
        descricao: 'New description',
      },
    });

    expect(project.descricao).toBe('New description');
  });

  it('should update project status', async () => {
    const { project } = await sut.execute({
      user: mockUser,
      userRole: 'admin',
      projectId: 1,
      data: {
        status: ProjetoStatus.planning,
      },
    });

    expect(project.status).toBe(ProjetoStatus.planning);
  });

  it('should update project priority', async () => {
    const { project } = await sut.execute({
      user: mockUser,
      userRole: 'admin',
      projectId: 1,
      data: {
        prioridade: ProjetoPriority.high,
      },
    });

    expect(project.prioridade).toBe(ProjetoPriority.high);
  });

  it('should update multiple fields at once', async () => {
    const { project } = await sut.execute({
      user: mockUser,
      userRole: 'owner',
      projectId: 1,
      data: {
        nome: 'Multi Update',
        descricao: 'Multiple fields updated',
        status: ProjetoStatus.execution,
        prioridade: ProjetoPriority.urgent,
      },
    });

    expect(project.nome).toBe('Multi Update');
    expect(project.descricao).toBe('Multiple fields updated');
    expect(project.status).toBe(ProjetoStatus.execution);
    expect(project.prioridade).toBe(ProjetoPriority.urgent);
  });

  it('should throw error if project not found', async () => {
    await expect(
      sut.execute({
        user: mockUser,
        userRole: 'admin',
        projectId: 999,
        data: {
          nome: 'Non-existent',
        },
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should validate hex color format', async () => {
    await expect(
      sut.execute({
        user: mockUser,
        userRole: 'admin',
        projectId: 1,
        data: {
          backgroundUrl: 'invalid-color',
        },
      })
    ).rejects.toBeInstanceOf(InvalidColorFormatError);
  });

  it('should accept valid hex color', async () => {
    const { project } = await sut.execute({
      user: mockUser,
      userRole: 'admin',
      projectId: 1,
      data: {
        backgroundUrl: '#FF5733',
      },
    });

    expect(project.backgroundUrl).toBe('#FF5733');
  });

  it('should validate date range', async () => {
    await expect(
      sut.execute({
        user: mockUser,
        userRole: 'admin',
        projectId: 1,
        data: {
          dataInicio: new Date('2024-12-31'),
          dataFim: new Date('2024-01-01'),
        },
      })
    ).rejects.toBeInstanceOf(InvalidDateRangeError);
  });

  it('should not allow duplicate project names in same company', async () => {
    // Criar segundo projeto
    await projectsRepository.create({
      nome: 'Another Project',
      ownerId: mockUser.id,
      idempresa: mockUser.idempresa!,
    });

    // Tentar renomear primeiro projeto para nome do segundo
    await expect(
      sut.execute({
        user: mockUser,
        userRole: 'admin',
        projectId: 1,
        data: {
          nome: 'Another Project',
        },
      })
    ).rejects.toBeInstanceOf(ProjectNameAlreadyExistsError);
  });

  it('should allow same project name in different companies', async () => {
    // Criar projeto em empresa diferente
    await projectsRepository.create({
      nome: 'Same Name',
      ownerId: 2,
      idempresa: 2,
    });

    // Renomear projeto da empresa 1 para mesmo nome (deve permitir)
    const { project } = await sut.execute({
      user: mockUser,
      userRole: 'admin',
      projectId: 1,
      data: {
        nome: 'Same Name',
      },
    });

    expect(project.nome).toBe('Same Name');
    expect(project.idempresa).toBe(1);
  });

  it('should allow keeping the same name', async () => {
    const { project } = await sut.execute({
      user: mockUser,
      userRole: 'admin',
      projectId: 1,
      data: {
        nome: 'Existing Project', // Mesmo nome
        descricao: 'Just updating description',
      },
    });

    expect(project.nome).toBe('Existing Project');
    expect(project.descricao).toBe('Just updating description');
  });

  it('should update dates correctly', async () => {
    const dataInicio = new Date('2024-01-01');
    const dataFim = new Date('2024-12-31');

    const { project } = await sut.execute({
      user: mockUser,
      userRole: 'admin',
      projectId: 1,
      data: {
        dataInicio,
        dataFim,
      },
    });

    expect(project.dataInicio).toEqual(dataInicio);
    expect(project.dataFim).toEqual(dataFim);
  });

  it('should update only provided fields', async () => {
    // Atualizar apenas a descrição
    const { project } = await sut.execute({
      user: mockUser,
      userRole: 'admin',
      projectId: 1,
      data: {
        descricao: 'Only description changed',
      },
    });

    // Nome deve permanecer o original
    expect(project.nome).toBe('Existing Project');
    expect(project.descricao).toBe('Only description changed');
  });
});
