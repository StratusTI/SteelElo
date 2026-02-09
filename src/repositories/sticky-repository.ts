import {
  CreateStickyRequest,
  Sticky,
  StickyFilters,
  UpdateStickyRequest
} from "../@types/sticky";

export interface StickyRepository {
  create(data: CreateStickyRequest & { usuarioId: number }): Promise<Sticky>;
  findById(id: number): Promise<Sticky | null>;
  findByUserId(usuarioId: number, filters?: StickyFilters): Promise<Sticky[]>;
  update(id: number, data: UpdateStickyRequest): Promise<Sticky>;
  delete(id: number): Promise<void>;
}
