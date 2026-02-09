import { QuickLink, UpdateQuickLinkRequest } from "../@types/quick-link";
import { AuthUser } from "../auth";
import { QuickLinkRepository } from "../repositories/quick-link-repository";
import { validateUrl } from "../utils/quick-link-validation";
import {
  InvalidUrlError,
  QuickLinkAlreadyExistsError,
  QuickLinkNotFoundError,
  QuickLinkNotOwnedError
} from "./errors/quick-link-errors";

interface UpdateQuickLinkUseCaseRequest {
  user: AuthUser;
  quickLinkId: number;
  data: UpdateQuickLinkRequest;
}

interface UpdateQuickLinkUseCaseResponse {
  quickLink: QuickLink;
}

export class UpdateQuickLinkUseCase {
  constructor(private quickLinkRepository: QuickLinkRepository) {}

  async execute({
    user,
    quickLinkId,
    data,
  }: UpdateQuickLinkUseCaseRequest): Promise<UpdateQuickLinkUseCaseResponse> {
    const existingQuickLink = await this.quickLinkRepository.findById(quickLinkId);

    if (!existingQuickLink) {
      throw new QuickLinkNotFoundError();
    }

    if (existingQuickLink.usuarioId !== user.id) {
      throw new QuickLinkNotOwnedError();
    }

    if (data.url) {
      if (!validateUrl(data.url)) {
        throw new InvalidUrlError();
      }

      if (data.url !== existingQuickLink.url) {
        const duplicateQuickLink = await this.quickLinkRepository.findByUserIdAndUrl(
          user.id,
          data.url
        );

        if (duplicateQuickLink) {
          throw new QuickLinkAlreadyExistsError();
        }
      }
    }

    const quickLink = await this.quickLinkRepository.update(quickLinkId, data);

    return { quickLink };
  }
}
