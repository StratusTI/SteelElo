import {
  CreateQuickLinkRequest,
  QuickLink,
  UpdateQuickLinkRequest,
} from '../../@types/quick-link';
import { prismaSteel } from '../../lib/prisma';
import { QuickLinkRepository } from '../quick-link-repository';

export class PrismaQuickLinkRepository implements QuickLinkRepository {
  async create(
    data: CreateQuickLinkRequest & { usuarioId: number }
  ): Promise<QuickLink> {
    const quickLink = await prismaSteel.quickLink.create({
      data: {
        usuarioId: data.usuarioId,
        url: data.url,
        titulo: data.titulo,
      },
    });

    return this.mapToQuickLink(quickLink);
  }

  async findById(id: number): Promise<QuickLink | null> {
    const quickLink = await prismaSteel.quickLink.findUnique({
      where: { id },
    });

    return quickLink ? this.mapToQuickLink(quickLink) : null;
  }

  async findByUserIdAndUrl(usuarioId: number, url: string): Promise<QuickLink | null> {
    const quickLink = await prismaSteel.quickLink.findFirst({
      where: {
        usuarioId,
        url,
      },
    });

    return quickLink ? this.mapToQuickLink(quickLink) : null;
  }

  async findByUserId(usuarioId: number): Promise<QuickLink[]> {
    const quickLinks = await prismaSteel.quickLink.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' },
    });

    return quickLinks.map(this.mapToQuickLink);
  }

  async update(id: number, data: UpdateQuickLinkRequest): Promise<QuickLink> {
    const quickLink = await prismaSteel.quickLink.update({
      where: { id },
      data: {
        url: data.url,
        titulo: data.titulo,
      },
    });

    return this.mapToQuickLink(quickLink);
  }

  async delete(id: number): Promise<void> {
    await prismaSteel.quickLink.delete({
      where: { id },
    });
  }

  private mapToQuickLink(data: any): QuickLink {
    return {
      id: data.id,
      usuarioId: data.usuarioId,
      url: data.url,
      titulo: data.titulo,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }
}
