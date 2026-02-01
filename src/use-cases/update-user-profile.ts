import { User } from "../@types/user";
import { UsersRepository } from "../repositories/users-repository";
import { ConflictError } from "./errors/conflict-error";
import { ResourceNotFoundError } from "./errors/resource-not-found-error";

interface UpdateUserProfileUseCaseRequest {
  userId: number
  nome?: string
  sobrenome?: string
  username?: string
}

interface UpdateUserProfileUseCaseResponse {
  user: User
}

export class UpdateUserProfileUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    userId,
    nome,
    sobrenome,
    username
  }: UpdateUserProfileUseCaseRequest): Promise<UpdateUserProfileUseCaseResponse> {
    const existingUser = await this.usersRepository.findById(userId);

    if (!existingUser) {
      throw new ResourceNotFoundError();
    }

    if (username && username !== existingUser.username) {
      const userWithSameUsername = await this.usersRepository.findByUsername(username);

      if (userWithSameUsername && userWithSameUsername.id !== userId) {
        throw new ConflictError('Username já está em uso');
      }
    }

    const updatedUser = await this.usersRepository.updateProfile({
      userId,
      nome,
      sobrenome,
      username
    });

    if (!updatedUser) {
      throw new ResourceNotFoundError();
    }

    return {
      user: updatedUser
    };
  }
}
