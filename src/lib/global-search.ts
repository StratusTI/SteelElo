import { User } from '../@types/user'
import { GlobalSearchResponse, SearchEntityType } from '../@types/search'
import { GlobalSearchRepository } from '../repositories/global-search-repository'

interface GlobalSearchUseCaseRequest {
  user: User
  query: string
  types?: SearchEntityType[]
  limit?: number
}

export class GlobalSearchUseCase {
  constructor(private globalSearchRepository: GlobalSearchRepository) {}

  async execute({
    user,
    query,
    types,
    limit = 20,
  }: GlobalSearchUseCaseRequest): Promise<GlobalSearchResponse> {
    // Validar query mínima
    const trimmedQuery = query.trim()

    if (trimmedQuery.length < 2) {
      return {
        results: [],
        totalResults: 0,
        query: trimmedQuery,
        filters: { types },
      }
    }

    // Validar empresa do usuário
    if (!user.idempresa) {
      throw new Error('User company not found')
    }

    // Executar busca
    const results = await this.globalSearchRepository.searchGlobal({
      query: trimmedQuery,
      companyId: user.idempresa,
      types,
      limit,
    })

    return {
      results,
      totalResults: results.length,
      query: trimmedQuery,
      filters: types ? { types } : undefined,
    }
  }
}
