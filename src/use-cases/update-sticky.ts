import { Sticky, UpdateStickyRequest } from "../@types/sticky";
import { AuthUser } from "../auth";
import { StickyRepository } from "../repositories/sticky-repository";
import { validateStickyColor } from "../utils/sticky-validation";
import {
  EmptyStickyContentError,
  InvalidStickyColorError,
  StickyNotFoundError,
  StickyNotOwnedError
} from "./errors/sticky-errors";

interface UpdateStickyUseCaseRequest {
  user: AuthUser;
  stickyId: number;
  data: UpdateStickyRequest;
}

interface UpdateStickyUseCaseResponse {
  sticky: Sticky;
}

export class UpdateStickyUseCase {
  constructor(private stickyRepository: StickyRepository) {}

  async execute({
    user,
    stickyId,
    data,
  }: UpdateStickyUseCaseRequest): Promise<UpdateStickyUseCaseResponse> {
    const existingSticky = await this.stickyRepository.findById(stickyId);

    if (!existingSticky) {
      throw new StickyNotFoundError();
    }

    if (existingSticky.usuarioId !== user.id) {
      throw new StickyNotOwnedError();
    }

    if (data.content !== undefined && data.content.trim().length === 0) {
      throw new EmptyStickyContentError();
    }

    if (data.backgroundColor && !validateStickyColor(data.backgroundColor)) {
      throw new InvalidStickyColorError();
    }

    const updateData: UpdateStickyRequest = {
      ...data,
      content: data.content?.trim(),
    };

    const sticky = await this.stickyRepository.update(stickyId, updateData);

    return { sticky };
  }
}
