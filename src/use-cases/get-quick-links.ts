import { QuickLink } from "../@types/quick-link";
import { AuthUser } from "../auth";
import { QuickLinkRepository } from "../repositories/quick-link-repository";

interface GetQuickLinksUseCaseRequest {
  user: AuthUser;
}

interface GetQuickLinksUseCaseResponse {
  quickLinks: QuickLink[];
}

export class GetQuickLinksUseCase {
  constructor(private quickLinkRepository: QuickLinkRepository) {}

  async execute({
    user,
  }: GetQuickLinksUseCaseRequest): Promise<GetQuickLinksUseCaseResponse> {
    const quickLinks = await this.quickLinkRepository.findByUserId(user.id);

    return { quickLinks };
  }
}
