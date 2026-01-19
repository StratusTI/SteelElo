import { beforeEach, describe, expect, it } from 'vitest';
import { User } from '../@types/user';
import { ProjetoPriority, ProjetoStatus } from '../generated/elo';
import { InMemoryProjectRepository } from '../repositories/in-memory/in-memory-project-repository';
import { GetProjectsUseCase } from './get-projects';

let projectsRepository: InMemoryProjectRepository;
let sut: GetProjectsUseCase;

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

describe('Get Projects Use Case', () => {
  beforeEach(async () => {
    projectsRepository = new InMemoryProjectRepository();
    sut = new GetProjectsUseCase(projectsRepository);

    // Seed test data
    await projectsRepository.create({
      nome: 'Project A',
      descricao: 'First project',
      ownerId: 1,
      idempresa: 1,
      status: ProjetoStatus.execution,
      prioridade: ProjetoPriority.high,
    });

    await projectsRepository.create({
      nome: 'Project B',
      descricao: 'Second project',
      ownerId: 2,
      idempresa: 1,
      status: ProjetoStatus.draft,
      prioridade: ProjetoPriority.medium,
    });

    await projectsRepository.create({
      nome: 'Project C',
      descricao: 'Third project',
      ownerId: 1,
      idempresa: 2, // Different company
      status: ProjetoStatus.completed,
      prioridade: ProjetoPriority.low,
    });

    // Ajustar createdAt diretamente no array do repository
    // para garantir ordem previsível
    projectsRepository.items[0].createdAt = new Date('2024-01-01T10:00:00');
    projectsRepository.items[1].createdAt = new Date('2024-01-02T10:00:00');
    projectsRepository.items[2].createdAt = new Date('2024-01-03T10:00:00');
  });

  it('should list only projects where user is member (non-superadmin)', async () => {
    // User 1 is member of Project A only
    projectsRepository.addMember(1, mockUser.id);

    const result = await sut.execute({
      user: mockUser,
      filters: {},
    });

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].nome).toBe('Project A');
  });

  it('should list all projects for superadmin', async () => {
    const superadminUser = { ...mockUser, superadmin: true };

    const result = await sut.execute({
      user: superadminUser,
      filters: {},
    });

    expect(result.projects).toHaveLength(3);
  });

  it('should filter by search (name)', async () => {
    const superadminUser = { ...mockUser, superadmin: true };

    const result = await sut.execute({
      user: superadminUser,
      filters: {
        search: 'Project A',
      },
    });

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].nome).toBe('Project A');
  });

  it('should filter by search (description)', async () => {
    const superadminUser = { ...mockUser, superadmin: true };

    const result = await sut.execute({
      user: superadminUser,
      filters: {
        search: 'First',
      },
    });

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].nome).toBe('Project A');
  });

  it('should filter by status', async () => {
    const superadminUser = { ...mockUser, superadmin: true };

    const result = await sut.execute({
      user: superadminUser,
      filters: {
        status: [ProjetoStatus.draft],
      },
    });

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].nome).toBe('Project B');
  });

  it('should filter by prioridade', async () => {
    const superadminUser = { ...mockUser, superadmin: true };

    const result = await sut.execute({
      user: superadminUser,
      filters: {
        prioridade: [ProjetoPriority.high],
      },
    });

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].nome).toBe('Project A');
  });

  it('should filter by owner', async () => {
    const superadminUser = { ...mockUser, superadmin: true };

    const result = await sut.execute({
      user: superadminUser,
      filters: {
        ownerId: 2,
      },
    });

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].nome).toBe('Project B');
  });

  it('should filter by member', async () => {
    const superadminUser = { ...mockUser, superadmin: true };

    // Add user 1 as member of Project A
    projectsRepository.addMember(1, 1);

    const result = await sut.execute({
      user: superadminUser,
      filters: {
        memberId: 1,
      },
    });

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].nome).toBe('Project A');
  });

  it('should order by name ascending', async () => {
    const superadminUser = { ...mockUser, superadmin: true };

    const result = await sut.execute({
      user: superadminUser,
      filters: {
        orderBy: 'nome',
        orderDirection: 'asc',
      },
    });

    expect(result.projects[0].nome).toBe('Project A');
    expect(result.projects[1].nome).toBe('Project B');
    expect(result.projects[2].nome).toBe('Project C');
  });

  it('should order by createdAt descending (default)', async () => {
    const superadminUser = { ...mockUser, superadmin: true };

    const result = await sut.execute({
      user: superadminUser,
      filters: {},
    });

    // Most recent first
    expect(result.projects[0].nome).toBe('Project C');
    expect(result.projects[2].nome).toBe('Project A');
  });

  it('should paginate results', async () => {
    const superadminUser = { ...mockUser, superadmin: true };

    const result = await sut.execute({
      user: superadminUser,
      filters: {
        page: 1,
        limit: 2,
      },
    });

    expect(result.projects).toHaveLength(2);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
  });

  it('should return correct pagination metadata', async () => {
    const superadminUser = { ...mockUser, superadmin: true };

    const result = await sut.execute({
      user: superadminUser,
      filters: {
        page: 2,
        limit: 2,
      },
    });

    expect(result.page).toBe(2);
    expect(result.limit).toBe(2);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
    expect(result.projects).toHaveLength(1);
  });

  it('should combine multiple filters', async () => {
    const superadminUser = { ...mockUser, superadmin: true };

    const result = await sut.execute({
      user: superadminUser,
      filters: {
        search: 'project',
        status: [ProjetoStatus.draft, ProjetoStatus.execution],
        ownerId: 1,
      },
    });

    expect(result.projects).toHaveLength(1);
    expect(result.projects[0].nome).toBe('Project A');
  });
});
