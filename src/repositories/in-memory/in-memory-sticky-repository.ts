import {
  CreateStickyRequest,
  Sticky,
  StickyColor,
  StickyFilters,
  UpdateStickyRequest
} from "@/src/@types/sticky";
import { StickyRepository } from "../sticky-repository";

export class InMemoryStickyRepository implements StickyRepository {
  public items: Sticky[] = [];
  private idCounter = 1;

  async create(
    data: CreateStickyRequest & { usuarioId: number }
  ): Promise<Sticky> {
    const sticky: Sticky = {
      id: this.idCounter++,
      usuarioId: data.usuarioId,
      content: data.content,
      backgroundColor: data.backgroundColor || 'gray' as StickyColor,
      isBold: data.isBold || false,
      isItalic: data.isItalic || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.items.push(sticky);

    return sticky;
  }

  async findById(id: number): Promise<Sticky | null> {
    const sticky = this.items.find((s) => s.id === id);
    return sticky || null;
  }

  async findByUserId(usuarioId: number, filters?: StickyFilters): Promise<Sticky[]> {
    let stickies = this.items.filter((s) => s.usuarioId === usuarioId);

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      stickies = stickies.filter((s) =>
        s.content.toLowerCase().includes(searchLower)
      );
    }

    // Order by createdAt desc (most recent first)
    stickies.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return stickies;
  }

  async update(id: number, data: UpdateStickyRequest): Promise<Sticky> {
    const index = this.items.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error('Sticky not found');
    }

    const sticky = this.items[index];

    this.items[index] = {
      ...sticky,
      content: data.content ?? sticky.content,
      backgroundColor: data.backgroundColor ?? sticky.backgroundColor,
      isBold: data.isBold ?? sticky.isBold,
      isItalic: data.isItalic ?? sticky.isItalic,
      updatedAt: new Date(),
    };

    return this.items[index];
  }

  async delete(id: number): Promise<void> {
    const index = this.items.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error('Sticky not found');
    }

    this.items.splice(index, 1);
  }
}
