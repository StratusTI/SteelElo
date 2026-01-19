export interface Column {
  id: number
  titulo: string
  ordem: number
  cor: string | null
  projetoId: number
  createdAt: Date
}

export interface CreatedColumnsData {
  titulo: string
  ordem: number
  cor?: string | null
  projetoId: number
}

export interface ColumnsRepository {
  create(data: CreatedColumnsData): Promise<Column>;
  createMany(data: CreatedColumnsData[]): Promise<Column[]>;
  findByProject(projectId: number): Promise<Column[]>;
  deleteByProject(projectId: number): Promise<void>;
}
