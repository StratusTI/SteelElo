import { CreateQuickLinkRequest, QuickLink } from "../@types/quick-link";
import { AuthUser } from "../auth";
import { QuickLinkRepository } from "../repositories/quick-link-repository";
import { validateUrl } from "../utils/quick-link-validation";
import {
  InvalidUrlError,
  QuickLinkAlreadyExistsError
} from "./errors/quick-link-errors";

interface CreateQuickLinkUseCaseRequest {
  user: AuthUser;
  data: CreateQuickLinkRequest;
}

interface CreateQuickLinkUseCaseResponse {
  quickLink: QuickLink;
}

export class CreateQuickLinkUseCase {
  constructor(private quickLinkRepository: QuickLinkRepository) {}

  async execute({
    user,
    data,
  }: CreateQuickLinkUseCaseRequest): Promise<CreateQuickLinkUseCaseResponse> {
    if (!validateUrl(data.url)) {
      throw new InvalidUrlError();
    }

    const existingQuickLink = await this.quickLinkRepository.findByUserIdAndUrl(
      user.id,
      data.url
    );

    if (existingQuickLink) {
      throw new QuickLinkAlreadyExistsError();
    }

    const quickLink = await this.quickLinkRepository.create({
      ...data,
      usuarioId: user.id,
    });

    return { quickLink };
  }
}
