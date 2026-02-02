import { beforeEach, describe, expect, it } from 'vitest'
import { User } from '../@types/user'
import { GlobalSearchUseCase } from './global-search'
import {
  GlobalSearchRepository,
  SearchFilters,
} from '../repositories/global-search-repository'
import { SearchResult } from '../@types/search'

// Mock repository
class InMemoryGlobalSearchRepository implements GlobalSearchRepository {
  private projects: SearchResult[] = []

  async searchGlobal(filters: SearchFilters): Promise<SearchResult[]> {
    const { query, companyId } = filters

    return this.projects.filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description?.toLowerCase().includes(query.toLowerCase())
    )
  }

  async searchProjects() {
    return []
  }

  async searchSprints() {
    return []
  }

  async searchTasks() {
    return []
  }

  async searchDocuments() {
    return []
  }

  // Helper para testes
  addProject(project: SearchResult) {
    this.projects.push(project)
  }

  clear() {
    this.projects = []
  }
}

let repository: InMemoryGlobalSearchRepository
let sut: GlobalSearchUseCase

const mockUser: User = {
  id: 1,
  nome: 'Test',
  sobrenome: 'User',
  username: 'testuser',
  email: 'test@example.com',
  foto: '',
  telefone: '',
  admin: false,
  superadmin: false,
  idempresa: 1,
  empresa: 'Test Company',
  departamento: 'Engineering',
  time: 'Backend',
  online: true,
}

describe('GlobalSearchUseCase', () => {
  beforeEach(() => {
    repository = new InMemoryGlobalSearchRepository()
    sut = new GlobalSearchUseCase(repository)
  })

  it('should return empty results for query less than 2 characters', async () => {
    const result = await sut.execute({
      user: mockUser,
      query: 'a',
    })

    expect(result.results).toHaveLength(0)
    expect(result.totalResults).toBe(0)
  })

  it('should return empty results for empty query', async () => {
    const result = await sut.execute({
      user: mockUser,
      query: '',
    })

    expect(result.results).toHaveLength(0)
  })

  it('should trim query before searching', async () => {
    repository.addProject({
      id: 1,
      type: 'project',
      title: 'Test Project',
      url: '/projects/1',
      relevanceScore: 100,
    })

    const result = await sut.execute({
      user: mockUser,
      query: '  test  ',
    })

    expect(result.query).toBe('test')
    expect(result.results).toHaveLength(1)
  })

  it('should search and return results', async () => {
    repository.addProject({
      id: 1,
      type: 'project',
      title: 'Project Alpha',
      description: 'First project',
      url: '/projects/1',
      relevanceScore: 100,
    })

    repository.addProject({
      id: 2,
      type: 'project',
      title: 'Project Beta',
      description: 'Second project',
      url: '/projects/2',
      relevanceScore: 90,
    })

    const result = await sut.execute({
      user: mockUser,
      query: 'project',
    })

    expect(result.results).toHaveLength(2)
    expect(result.totalResults).toBe(2)
    expect(result.query).toBe('project')
  })

  it('should filter results by query', async () => {
    repository.addProject({
      id: 1,
      type: 'project',
      title: 'Alpha Project',
      url: '/projects/1',
      relevanceScore: 100,
    })

    repository.addProject({
      id: 2,
      type: 'project',
      title: 'Beta Sprint',
      url: '/projects/2',
      relevanceScore: 90,
    })

    const result = await sut.execute({
      user: mockUser,
      query: 'alpha',
    })

    expect(result.results).toHaveLength(1)
    expect(result.results[0].title).toBe('Alpha Project')
  })

  it('should search in description', async () => {
    repository.addProject({
      id: 1,
      type: 'project',
      title: 'Project X',
      description: 'Contains alpha keyword',
      url: '/projects/1',
      relevanceScore: 75,
    })

    const result = await sut.execute({
      user: mockUser,
      query: 'alpha',
    })

    expect(result.results).toHaveLength(1)
  })

  it('should return filter metadata when types specified', async () => {
    const result = await sut.execute({
      user: mockUser,
      query: 'test',
      types: ['project', 'task'],
    })

    expect(result.filters?.types).toEqual(['project', 'task'])
  })

  it('should throw error if user has no company', async () => {
    const userWithoutCompany = { ...mockUser, idempresa: undefined } as unknown as User

    await expect(
      sut.execute({
        user: userWithoutCompany,
        query: 'test',
      })
    ).rejects.toThrow('User company not found')
  })
})
