export type SearchEntityType = 'project' | 'sprint' | 'task' | 'document'

interface SearchResultBase {
  id: string
  type: SearchEntityType
  title: string
  description?: string
  url: string
  relevanceScore: number
}

export interface ProjectSearchResult extends SearchResultBase {
  type: 'project'
  projectId?: string
  status?: string
  owner?: {
    id: number
    name: string
  }
}

export interface SprintSearchResult extends SearchResultBase {
  type: 'sprint'
  projectId: string
  projectName: string
  startDate: Date
  endDate: Date
  status?: string
}

export interface TaskSearchResult extends SearchResultBase {
  type: 'task'
  projectId: string
  projectName: string
  status?: string
  assignees?: Array<{ id: number; name: string }>
}

export interface DocumentSearchResult extends SearchResultBase {
  type: 'document'
  projectId: string
  projectName: string
  icon: string
}

export type SearchResult =
  | ProjectSearchResult
  | SprintSearchResult
  | TaskSearchResult
  | DocumentSearchResult

export interface GlobalSearchResponse {
  results: SearchResult[]
  totalResults: number
  query: string
  filters?: {
    types?: SearchEntityType[]
  }
}

export interface GlobalSearchRequest {
  query: string
  types?: SearchEntityType[]
  limit?: number
  companyId?: number
}
