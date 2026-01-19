import {
  CreateProjectRequest,
  Project,
  ProjectFilters,
  UpdateProjectRequest,
} from '../../@types/project';
import { ProjetoStatus } from '../../generated/elo';
import { prismaElo } from '../../lib/prisma';
import { ProjectRepository } from '../project-repository';

export class PrismaProjectsRepository implements ProjectRepository {
  async create(
    data: CreateProjectRequest & { ownerId: number; idempresa: number }
  ): Promise<Project> {
    const project = await prismaElo.projeto.create({
      data: {
        nome: data.nome,
        projectId: data.projectId,
        descricao: data.descricao,
        icone: data.icone,
        backgroundUrl: data.backgroundUrl,
        dataInicio: data.dataInicio,
        dataFim: data.dataFim,
        ownerId: data.ownerId,
        idempresa: data.idempresa,
        status: data.status,
        prioridade: data.prioridade,
        acesso: data.acesso,
      },
    });

    return this.mapToProject(project);
  }

  async findById(id: number): Promise<Project | null> {
    const project = await prismaElo.projeto.findUnique({
      where: { id },
    });

    return project ? this.mapToProject(project) : null;
  }

  async findByNameAndCompany(
    nome: string,
    idempresa: number
  ): Promise<Project | null> {
    // MySQL já faz busca case-insensitive por padrão
    const project = await prismaElo.projeto.findFirst({
      where: {
        nome,
        idempresa,
        status: {
          not: ProjetoStatus.cancelled,
        },
      },
    });

    return project ? this.mapToProject(project) : null;
  }

  async findMany(
    filters: ProjectFilters,
    userId: number,
    isSuperadmin: boolean
  ): Promise<{
    projects: Project[];
    total: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Construir WHERE clause
    const where: any = {};

    // Filtro de acesso
    if (!isSuperadmin) {
      where.membros = {
        some: {
          usuarioId: userId,
        },
      };
    }

    // Filtro de busca
    if (filters.search) {
      where.OR = [
        {
          nome: {
            contains: filters.search,
          },
        },
        {
          descricao: {
            contains: filters.search,
          },
        },
      ];
    }

    // Filtro de status
    if (filters.status && filters.status.length > 0) {
      where.status = {
        in: filters.status,
      };
    }

    // Filtro de prioridade
    if (filters.prioridade && filters.prioridade.length > 0) {
      where.prioridade = {
        in: filters.prioridade,
      };
    }

    // Filtro de owner
    if (filters.ownerId) {
      where.ownerId = filters.ownerId;
    }

    // Filtro de membro
    if (filters.memberId) {
      where.membros = {
        some: {
          usuarioId: filters.memberId,
        },
      };
    }

    // Ordenação
    const orderBy = filters.orderBy || 'createdAt';
    const direction = filters.orderDirection || 'desc';

    // Executar queries
    const [projects, total] = await Promise.all([
      prismaElo.projeto.findMany({
        where,
        orderBy: {
          [orderBy]: direction,
        },
        skip,
        take: limit,
      }),
      prismaElo.projeto.count({ where }),
    ]);

    return {
      projects: projects.map(this.mapToProject),
      total,
    };
  }

  async update(id: number, data: UpdateProjectRequest): Promise<Project> {
    const project = await prismaElo.projeto.update({
      where: { id },
      data: {
        nome: data.nome,
        projectId: data.projectId,
        descricao: data.descricao,
        icone: data.icone,
        backgroundUrl: data.backgroundUrl,
        dataInicio: data.dataInicio,
        dataFim: data.dataFim,
        status: data.status,
        prioridade: data.prioridade,
        acesso: data.acesso,
      },
    });

    return this.mapToProject(project);
  }

  async archive(id: number): Promise<void> {
    await prismaElo.projeto.update({
      where: { id },
      data: {
        status: ProjetoStatus.cancelled,
      },
    });
  }

  async isUserMember(projectId: number, userId: number): Promise<boolean> {
    const member = await prismaElo.projetoMembro.findFirst({
      where: {
        projetoId: projectId,
        usuarioId: userId,
      },
    });

    return !!member;
  }

  private mapToProject(data: any): Project {
    return {
      id: data.id,
      nome: data.nome,
      projectId: data.projectId,
      descricao: data.descricao,
      icone: data.icone,
      backgroundUrl: data.backgroundUrl,
      dataInicio: data.dataInicio,
      dataFim: data.dataFim,
      ownerId: data.ownerId,
      idempresa: data.idempresa,
      status: data.status,
      prioridade: data.prioridade,
      acesso: data.acesso ?? true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
