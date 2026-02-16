import { Sticky, StickyFilters } from "../@types/sticky";
import { AuthUser } from "../auth";
import { StickyRepository } from "../repositories/sticky-repository";

interface GetStickiesUseCaseRequest {
  user: AuthUser;
  filters?: StickyFilters;
}

interface GetStickiesUseCaseResponse {
  stickies: Sticky[];
}

export class GetStickiesUseCase {
  constructor(private stickyRepository: StickyRepository) {}

  async execute({
    user,
    filters,
  }: GetStickiesUseCaseRequest): Promise<GetStickiesUseCaseResponse> {
    const stickies = await this.stickyRepository.findByUserId(user.id, filters);

    return { stickies };
  }
}
