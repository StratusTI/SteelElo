import { AuthUser } from "../auth";
import { QuickLinkRepository } from "../repositories/quick-link-repository";
import {
  QuickLinkNotFoundError,
  QuickLinkNotOwnedError
} from "./errors/quick-link-errors";

interface DeleteQuickLinkUseCaseRequest {
  user: AuthUser;
  quickLinkId: number;
}

export class DeleteQuickLinkUseCase {
  constructor(private quickLinkRepository: QuickLinkRepository) {}

  async execute({
    user,
    quickLinkId,
  }: DeleteQuickLinkUseCaseRequest): Promise<void> {
    const existingQuickLink = await this.quickLinkRepository.findById(quickLinkId);

    if (!existingQuickLink) {
      throw new QuickLinkNotFoundError();
    }

    if (existingQuickLink.usuarioId !== user.id) {
      throw new QuickLinkNotOwnedError();
    }

    await this.quickLinkRepository.delete(quickLinkId);
  }
}
