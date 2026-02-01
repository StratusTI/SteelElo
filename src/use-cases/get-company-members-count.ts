import { User } from "../@types/user";
import { UsersRepository } from "../repositories/users-repository";

interface GetCompanyMembersCountUseCaseRequest {
  user: User
  enterpriseId: number
}

interface GetCompanyMembersCountUseCaseResponse {
  count: number
}

export class GetCompanyMembersCountUseCase {
  constructor(private usersRepository: UsersRepository) { }

  async execute({
    enterpriseId
  }: GetCompanyMembersCountUseCaseRequest): Promise<GetCompanyMembersCountUseCaseResponse> {
    if (!enterpriseId) {
      return { count: 0 }
    }

    const count = await this.usersRepository.countByCompany(enterpriseId)

    return { count }
  }
}
