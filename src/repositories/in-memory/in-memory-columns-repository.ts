import {
  Column,
  ColumnsRepository,
  CreatedColumnsData
} from "../columns-repository";

export class InMemoryColumnsRepository implements ColumnsRepository {
  public items: Column[] = []
  private idCounter = 1

  async create(data: CreatedColumnsData): Promise<Column> {
    const column: Column = {
      id: `col_${this.idCounter++}`,
      titulo: data.titulo,
      ordem: data.ordem,
      cor: data.cor || null,
      projetoId: data.projetoId,
      createdAt: new Date()
    }

    this.items.push(column)
    return column
  }

  async createMany(data: CreatedColumnsData[]): Promise<Column[]> {
    const created: Column[] = []
    for (const item of data) {
        const column = await this.create(item)
        created.push(column)
    }
    return created
  }

  async findByProject(projectId: string): Promise<Column[]> {
    return this.items
      .filter((c) => c.projetoId === projectId)
      .sort((a, b) => a.ordem - b.ordem)
  }

  async deleteByProject(projectId: string): Promise<void> {
    this.items = this.items.filter((c) => c.projetoId !== projectId)
  }
}
