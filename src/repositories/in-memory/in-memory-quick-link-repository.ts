import {
  CreateQuickLinkRequest,
  QuickLink,
  UpdateQuickLinkRequest
} from "@/src/@types/quick-link";
import { QuickLinkRepository } from "../quick-link-repository";

export class InMemoryQuickLinkRepository implements QuickLinkRepository {
  public items: QuickLink[] = [];
  private idCounter = 1;

  async create(
    data: CreateQuickLinkRequest & { usuarioId: number }
  ): Promise<QuickLink> {
    const quickLink: QuickLink = {
      id: this.idCounter++,
      usuarioId: data.usuarioId,
      url: data.url,
      titulo: data.titulo || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.push(quickLink);

    return quickLink;
  }

  async findById(id: number): Promise<QuickLink | null> {
    const quickLink = this.items.find((ql) => ql.id === id);
    return quickLink || null;
  }

  async findByUserIdAndUrl(usuarioId: number, url: string): Promise<QuickLink | null> {
    const quickLink = this.items.find(
      (ql) => ql.usuarioId === usuarioId && ql.url === url
    );
    return quickLink || null;
  }

  async findByUserId(usuarioId: number): Promise<QuickLink[]> {
    const quickLinks = this.items
      .filter((ql) => ql.usuarioId === usuarioId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return quickLinks;
  }

  async update(id: number, data: UpdateQuickLinkRequest): Promise<QuickLink> {
    const index = this.items.findIndex((ql) => ql.id === id);

    if (index === -1) {
      throw new Error('QuickLink not found');
    }

    const quickLink = this.items[index];

    this.items[index] = {
      ...quickLink,
      url: data.url ?? quickLink.url,
      titulo: data.titulo !== undefined ? data.titulo : quickLink.titulo,
      updatedAt: new Date(),
    };

    return this.items[index];
  }

  async delete(id: number): Promise<void> {
    const index = this.items.findIndex((ql) => ql.id === id);

    if (index === -1) {
      throw new Error('QuickLink not found');
    }

    this.items.splice(index, 1);
  }
}
