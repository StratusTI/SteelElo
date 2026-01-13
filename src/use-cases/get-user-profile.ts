import { User } from "../@types/user";
import { UsersRepository } from "../repositories/users-repository";
import { ResourceNotFoundError } from "../use-cases/errors/resource-not-found-error";

interface GetUserProfileUseCaseRequest {
  userId: number
}

interface GetUserProfileUseCaseResponse {
  user: User
}

export class GetUserProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({ userId }: GetUserProfileUseCaseRequest): Promise<GetUserProfileUseCaseResponse> {
    const user = await this.usersRepository.findById(userId);

    if (!user) {
      throw new ResourceNotFoundError();
    }

    return {
      user
    };
  }
}
