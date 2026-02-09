import {
  CreateStickyRequest,
  Sticky,
  StickyFilters,
  UpdateStickyRequest,
} from '../../@types/sticky';
import { prismaSteel } from '../../lib/prisma';
import { StickyRepository } from '../sticky-repository';

export class PrismaStickyRepository implements StickyRepository {
  async create(
    data: CreateStickyRequest & { usuarioId: number }
  ): Promise<Sticky> {
    const sticky = await prismaSteel.sticky.create({
      data: {
        usuarioId: data.usuarioId,
        content: data.content,
        backgroundColor: data.backgroundColor,
        isBold: data.isBold,
        isItalic: data.isItalic,
      },
    });

    return this.mapToSticky(sticky);
  }

  async findById(id: number): Promise<Sticky | null> {
    const sticky = await prismaSteel.sticky.findUnique({
      where: { id },
    });

    return sticky ? this.mapToSticky(sticky) : null;
  }

  async findByUserId(usuarioId: number, filters?: StickyFilters): Promise<Sticky[]> {
    const where: any = { usuarioId };

    if (filters?.search) {
      where.content = {
        contains: filters.search,
      };
    }

    const stickies = await prismaSteel.sticky.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return stickies.map(this.mapToSticky);
  }

  async update(id: number, data: UpdateStickyRequest): Promise<Sticky> {
    const sticky = await prismaSteel.sticky.update({
      where: { id },
      data: {
        content: data.content,
        backgroundColor: data.backgroundColor,
        isBold: data.isBold,
        isItalic: data.isItalic,
      },
    });

    return this.mapToSticky(sticky);
  }

  async delete(id: number): Promise<void> {
    await prismaSteel.sticky.delete({
      where: { id },
    });
  }

  private mapToSticky(data: any): Sticky {
    return {
      id: data.id,
      usuarioId: data.usuarioId,
      content: data.content,
      backgroundColor: data.backgroundColor,
      isBold: data.isBold,
      isItalic: data.isItalic,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
