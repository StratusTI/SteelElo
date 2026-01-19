import {
  CreateProjectRequest,
  Project,
  ProjectFilters,
  UpdateProjectRequest
} from "@/src/@types/project";
import { ProjetoPriority, ProjetoStatus } from "@/src/generated/elo";
import { normalizeSearchText } from "@/src/utils/project-validation";
import { ProjectRepository } from "../project-repository";

export class InMemoryProjectRepository implements ProjectRepository {
  public items: Project[] = []
  private idCounter = 1

  public memberships: Map<number, number[]> = new Map()

  async create(
    data: CreateProjectRequest & { ownerId: number; idempresa: number }
  ): Promise<Project> {
    const project: Project = {
      id: this.idCounter++,
      nome: data.nome,
      projectId: data.projectId || null,
      descricao: data.descricao || null,
      icone: data.icone || null,
      backgroundUrl: data.backgroundUrl || null,
      dataInicio: data.dataInicio || null,
      dataFim: data.dataFim || null,
      ownerId: data.ownerId,
      idempresa: data.idempresa,
      status: data.status || ProjetoStatus.draft,
      prioridade: data.prioridade || ProjetoPriority.none,
      acesso: data.acesso !== undefined ? data.acesso : true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.items.push(project)


    return project
  }

  async findById(id: number): Promise<Project | null> {
    const project = this.items.find((p) => p.id === id)
    return project || null
  }

  async findByNameAndCompany(nome: string, idempresa: number): Promise<Project | null> {
    const normalizedName = normalizeSearchText(nome)
    const project = this.items.find(
      (p) =>
        normalizeSearchText(p.nome) === normalizedName &&
        p.idempresa === idempresa &&
        p.status !== ProjetoStatus.cancelled
    )

    return project || null
  }

  async findMany(filters: ProjectFilters, userId: number, isSuperadmin: boolean): Promise<{ projects: Project[]; total: number; }> {
    let filtered = [...this.items]

    if (!isSuperadmin) {
      filtered = filtered.filter(
        (p) => this.memberships.get(p.id)?.includes(userId) || false
      )
    }

    if (filters.search) {
      const normalizedSearch = normalizeSearchText(filters.search)
      filtered = filtered.filter(
        (p) =>
          normalizeSearchText(p.nome).includes(normalizedSearch) ||
          (p.descricao && normalizeSearchText(p.descricao).includes(normalizedSearch))
      )
    }

    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter((p) => filters.status!.includes(p.status))
    }

    if (filters.prioridade && filters.prioridade.length > 0) {
      filtered = filtered.filter(
        (p) =>
          filters.prioridade!.includes(p.prioridade)
      )
    }

    if (filters.ownerId) {
      filtered = filtered.filter((p) => p.ownerId === filters.ownerId)
    }

    if (filters.memberId) {
      filtered = filtered.filter((p) => this.memberships.get(p.id)?.includes(filters.memberId!) || false)
    }

    const orderBy = filters.orderBy || 'createdAt'
    const direction = filters.orderDirection || 'desc'

    filtered.sort((a, b) => {
      const aVal = a[orderBy]
      const bVal = b[orderBy]

      if (aVal < bVal) return direction === 'asc' ? -1 : 1
      if (aVal > bVal) return direction === 'asc' ? 1 : -1
      return 0
    })

    const total = filtered.length

    const page = filters.page || 1
    const limit = filters.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit

    const projects = filtered.slice(startIndex, endIndex)

    return { projects, total}
  }

  async update(id: number, data: UpdateProjectRequest): Promise<Project> {
    const index = this.items.findIndex((p) => p.id === id)

    if (index === -1) {
      throw new Error('Project not found')
    }

    const project = this.items[index]

    this.items[index] = {
      ...project,
      ...data,
      updatedAt: new Date()
    }

    return this.items[index]
  }

  async archive(id: number): Promise<void> {
    const index = this.items.findIndex((p) => p.id === id)

    if (index === -1) {
      throw new Error('Project not found')
    }

    this.items[index].status = ProjetoStatus.cancelled
    this.items[index].updatedAt = new Date()
  }

  async isUserMember(projectId: number, userId: number): Promise<boolean> {
      const members = this.memberships.get(projectId)

      if (!members) {
        throw new Error('Project not found')
      }

      return members.includes(userId)
  }

  addMember(projectId: number, userId: number): void {
    const members = this.memberships.get(projectId) || [];
    if (!members.includes(userId)) {
        members.push(userId);
        this.memberships.set(projectId, members);
    }
  }
}
