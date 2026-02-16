export interface Column {
  id: string
  titulo: string
  ordem: number
  cor: string | null
  projetoId: string
  createdAt: Date
}

export interface CreatedColumnsData {
  titulo: string
  ordem: number
  cor?: string | null
  projetoId: string
}

export interface ColumnsRepository {
  create(data: CreatedColumnsData): Promise<Column>;
  createMany(data: CreatedColumnsData[]): Promise<Column[]>;
  findByProject(projectId: string): Promise<Column[]>;
  deleteByProject(projectId: string): Promise<void>;
}
