import {
  CreateQuickLinkRequest,
  QuickLink,
  UpdateQuickLinkRequest
} from "../@types/quick-link";

export interface QuickLinkRepository {
  create(data: CreateQuickLinkRequest & { usuarioId: number }): Promise<QuickLink>;
  findById(id: number): Promise<QuickLink | null>;
  findByUserIdAndUrl(usuarioId: number, url: string): Promise<QuickLink | null>;
  findByUserId(usuarioId: number): Promise<QuickLink[]>;
  update(id: number, data: UpdateQuickLinkRequest): Promise<QuickLink>;
  delete(id: number): Promise<void>;
}
