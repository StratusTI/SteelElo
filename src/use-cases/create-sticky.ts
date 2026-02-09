import { CreateStickyRequest, Sticky } from "../@types/sticky";
import { AuthUser } from "../auth";
import { StickyRepository } from "../repositories/sticky-repository";
import { validateStickyColor } from "../utils/sticky-validation";
import {
  EmptyStickyContentError,
  InvalidStickyColorError
} from "./errors/sticky-errors";

interface CreateStickyUseCaseRequest {
  user: AuthUser;
  data: CreateStickyRequest;
}

interface CreateStickyUseCaseResponse {
  sticky: Sticky;
}

export class CreateStickyUseCase {
  constructor(private stickyRepository: StickyRepository) {}

  async execute({
    user,
    data,
  }: CreateStickyUseCaseRequest): Promise<CreateStickyUseCaseResponse> {
    if (data.backgroundColor && !validateStickyColor(data.backgroundColor)) {
      throw new InvalidStickyColorError();
    }

    const content = data.content?.trim() ?? '';

    const sticky = await this.stickyRepository.create({
      ...data,
      content,
      usuarioId: user.id,
    });

    return { sticky };
  }
}
