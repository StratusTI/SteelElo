import { AuthUser } from "../auth";
import { StickyRepository } from "../repositories/sticky-repository";
import {
  StickyNotFoundError,
  StickyNotOwnedError
} from "./errors/sticky-errors";

interface DeleteStickyUseCaseRequest {
  user: AuthUser;
  stickyId: number;
}

export class DeleteStickyUseCase {
  constructor(private stickyRepository: StickyRepository) {}

  async execute({
    user,
    stickyId,
  }: DeleteStickyUseCaseRequest): Promise<void> {
    const existingSticky = await this.stickyRepository.findById(stickyId);

    if (!existingSticky) {
      throw new StickyNotFoundError();
    }

    if (existingSticky.usuarioId !== user.id) {
      throw new StickyNotOwnedError();
    }

    await this.stickyRepository.delete(stickyId);
  }
}
