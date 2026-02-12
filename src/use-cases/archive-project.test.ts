import { beforeEach, describe, expect, it } from 'vitest';
import { User } from '../@types/user';
import { ProjetoStatus } from '../generated/elo';
import { InMemoryProjectRepository } from '../repositories/in-memory/in-memory-project-repository';
import { ArchiveProjectUseCase } from './archive-project';
import { ResourceNotFoundError } from './errors/resource-not-found-error';

let projectsRepository: InMemoryProjectRepository;
let sut: ArchiveProjectUseCase;

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

let activeProjectId: string;

describe('Archive Project Use Case', () => {
  beforeEach(async () => {
    projectsRepository = new InMemoryProjectRepository();
    sut = new ArchiveProjectUseCase(projectsRepository);

    // Criar projeto inicial para testes
    const activeProject = await projectsRepository.create({
      nome: 'Active Project',
      ownerId: mockUser.id,
      idempresa: mockUser.idempresa!,
      status: ProjetoStatus.execution,
    });
    activeProjectId = activeProject.id;
  });

  it('should archive a project', async () => {
    const result = await sut.execute({
      user: mockUser,
      userRole: 'owner',
      projectId: activeProjectId,
    });

    expect(result.success).toBe(true);

    // Verificar que o status foi alterado
    const project = await projectsRepository.findById(activeProjectId);
    expect(project?.status).toBe(ProjetoStatus.cancelled);
  });

  it('should throw error if project not found', async () => {
    await expect(
      sut.execute({
        user: mockUser,
        userRole: 'owner',
        projectId: 'non-existent-id',
      })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });

  it('should archive project regardless of current status', async () => {
    // Criar projetos em diferentes status
    const draftProject = await projectsRepository.create({
      nome: 'Draft Project',
      ownerId: mockUser.id,
      idempresa: mockUser.idempresa!,
      status: ProjetoStatus.draft,
    });

    const completedProject = await projectsRepository.create({
      nome: 'Completed Project',
      ownerId: mockUser.id,
      idempresa: mockUser.idempresa!,
      status: ProjetoStatus.completed,
    });

    // Arquivar projeto em draft
    await sut.execute({
      user: mockUser,
      userRole: 'owner',
      projectId: draftProject.id,
    });

    // Arquivar projeto completed
    await sut.execute({
      user: mockUser,
      userRole: 'owner',
      projectId: completedProject.id,
    });

    const archivedDraft = await projectsRepository.findById(draftProject.id);
    const archivedCompleted = await projectsRepository.findById(completedProject.id);

    expect(archivedDraft?.status).toBe(ProjetoStatus.cancelled);
    expect(archivedCompleted?.status).toBe(ProjetoStatus.cancelled);
  });

  it('should not appear in findByNameAndCompany after archiving', async () => {
    // Arquivar projeto
    await sut.execute({
      user: mockUser,
      userRole: 'owner',
      projectId: activeProjectId,
    });

    // Tentar buscar por nome
    const result = await projectsRepository.findByNameAndCompany(
      'Active Project',
      mockUser.idempresa!
    );

    // Não deve retornar projetos arquivados
    expect(result).toBeNull();
  });

  it('should allow creating new project with same name after archiving', async () => {
    // Arquivar projeto
    await sut.execute({
      user: mockUser,
      userRole: 'owner',
      projectId: activeProjectId,
    });

    // Criar novo projeto com mesmo nome (deve permitir)
    const newProject = await projectsRepository.create({
      nome: 'Active Project',
      ownerId: mockUser.id,
      idempresa: mockUser.idempresa!,
    });

    expect(newProject.nome).toBe('Active Project');
    expect(newProject.id).not.toBe(activeProjectId);
    expect(newProject.status).not.toBe(ProjetoStatus.cancelled);
  });

  it('should be idempotent (archiving twice should work)', async () => {
    // Primeiro arquivamento
    const result1 = await sut.execute({
      user: mockUser,
      userRole: 'owner',
      projectId: activeProjectId,
    });

    // Segundo arquivamento
    const result2 = await sut.execute({
      user: mockUser,
      userRole: 'owner',
      projectId: activeProjectId,
    });

    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);

    const project = await projectsRepository.findById(activeProjectId);
    expect(project?.status).toBe(ProjetoStatus.cancelled);
  });
});
