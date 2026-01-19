import { beforeEach, describe, expect, it } from 'vitest';
import { User } from '../@types/user';
import { ProjetoPriority, ProjetoStatus } from '../generated/elo';
import { InMemoryProjectRepository } from '../repositories/in-memory/in-memory-project-repository';
import { ResourceNotFoundError } from './errors/resource-not-found-error';
import { GetProjectDetailsUseCase } from './get-project-details';

let projectsRepository: InMemoryProjectRepository;
let sut: GetProjectDetailsUseCase;

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

describe('Get Project Details Use Case', () => {
  beforeEach(async () => {
    projectsRepository = new InMemoryProjectRepository();
    sut = new GetProjectDetailsUseCase(projectsRepository);

    // Criar projeto para testes
    await projectsRepository.create({
      nome: 'Test Project',
      projectId: 'PROJ-001',
      descricao: 'Project description',
      icone: '🚀',
      backgroundUrl: '#3B82F6',
      dataInicio: new Date('2024-01-01'),
      dataFim: new Date('2024-12-31'),
      ownerId: mockUser.id,
      idempresa: mockUser.idempresa!,
      status: ProjetoStatus.execution,
      prioridade: ProjetoPriority.high,
      acesso: true,
    });

    // Adicionar usuário como membro
    projectsRepository.addMember(1, mockUser.id);
  });

  it('should return project details for member', async () => {
    const { project } = await sut.execute({
      user: mockUser,
      projectId: 1,
    });

    expect(project.id).toBe(1);
    expect(project.nome).toBe('Test Project');
    expect(project.projectId).toBe('PROJ-001');
    expect(project.descricao).toBe('Project description');
    expect(project.icone).toBe('🚀');
    expect(project.backgroundUrl).toBe('#3B82F6');
    expect(project.status).toBe(ProjetoStatus.execution);
    expect(project.prioridade).toBe(ProjetoPriority.high);
  });

  it('should return project details for superadmin even if not member', async () => {
    const superadminUser = { ...mockUser, id: 999, superadmin: true };

    const { project } = await sut.execute({
      user: superadminUser,
      projectId: 1,
    });

    expect(project.nome).toBe('Test Project');
  });

  it('should throw error if project not found', async () => {
    await expect(
      sut.execute({
        user: mockUser,
        projectId: 999,
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should throw error if user is not member and not superadmin', async () => {
    const nonMemberUser = { ...mockUser, id: 999 };

    await expect(
      sut.execute({
        user: nonMemberUser,
        projectId: 1,
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should return all project fields correctly', async () => {
    const { project } = await sut.execute({
      user: mockUser,
      projectId: 1,
    });

    expect(project).toHaveProperty('id');
    expect(project).toHaveProperty('nome');
    expect(project).toHaveProperty('projectId');
    expect(project).toHaveProperty('descricao');
    expect(project).toHaveProperty('icone');
    expect(project).toHaveProperty('backgroundUrl');
    expect(project).toHaveProperty('dataInicio');
    expect(project).toHaveProperty('dataFim');
    expect(project).toHaveProperty('ownerId');
    expect(project).toHaveProperty('idempresa');
    expect(project).toHaveProperty('status');
    expect(project).toHaveProperty('prioridade');
    expect(project).toHaveProperty('acesso');
    expect(project).toHaveProperty('createdAt');
    expect(project).toHaveProperty('updatedAt');
  });

  it('should return project with null optional fields', async () => {
    // Criar projeto mínimo
    await projectsRepository.create({
      nome: 'Minimal Project',
      ownerId: mockUser.id,
      idempresa: mockUser.idempresa!,
    });

    projectsRepository.addMember(2, mockUser.id);

    const { project } = await sut.execute({
      user: mockUser,
      projectId: 2,
    });

    expect(project.nome).toBe('Minimal Project');
    expect(project.projectId).toBeNull();
    expect(project.descricao).toBeNull();
    expect(project.icone).toBeNull();
    expect(project.backgroundUrl).toBeNull();
    expect(project.dataInicio).toBeNull();
    expect(project.dataFim).toBeNull();
  });

  it('should return project dates as Date objects', async () => {
    const { project } = await sut.execute({
      user: mockUser,
      projectId: 1,
    });

    expect(project.dataInicio).toBeInstanceOf(Date);
    expect(project.dataFim).toBeInstanceOf(Date);
    expect(project.createdAt).toBeInstanceOf(Date);
    expect(project.updatedAt).toBeInstanceOf(Date);
  });
});
