import { prismaElo } from '../../lib/prisma';
import {
  Column,
  ColumnsRepository,
  CreatedColumnsData
} from '../columns-repository';

export class PrismaColumnsRepository implements ColumnsRepository {
  async create(data: CreatedColumnsData): Promise<Column> {
    const column = await prismaElo.coluna.create({
      data: {
        titulo: data.titulo,
        ordem: data.ordem,
        cor: data.cor,
        projetoId: data.projetoId,
      },
    });

    return this.mapToColumn(column);
  }

  async createMany(columns: CreatedColumnsData[]): Promise<Column[]> {
    // Prisma createMany não retorna os dados criados, então fazemos create individual
    const created: Column[] = [];

    for (const data of columns) {
      const column = await this.create(data);
      created.push(column);
    }

    return created;
  }

  async findByProject(projectId: number): Promise<Column[]> {
    const columns = await prismaElo.coluna.findMany({
      where: { projetoId: projectId },
      orderBy: { ordem: 'asc' },
    });

    return columns.map(this.mapToColumn);
  }

  async deleteByProject(projectId: number): Promise<void> {
    await prismaElo.coluna.deleteMany({
      where: { projetoId: projectId },
    });
  }

  private mapToColumn(data: any): Column {
    return {
      id: data.id,
      titulo: data.titulo,
      ordem: data.ordem,
      cor: data.cor,
      projetoId: data.projetoId,
      createdAt: data.createdAt,
    };
  }
}
