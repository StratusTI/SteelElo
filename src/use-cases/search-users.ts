import { User } from "../@types/user";
import { UsersRepository } from "../repositories/users-repository";

interface SearchUsersUseCaseRequest {
  user: User
  query?: string
  excludeProjectId?: string
  limit?: number
}

interface SearchUsersUseCaseResponse {
  users: Array<{
    id: number
    nome: string
    sobrenome: string
    email: string
    foto: string | null
    departamento: string | null
  }>
}

export class SearchUsersUseCase {
  constructor(private usersRepository: UsersRepository) { }

  async execute({
    user,
    query,
    excludeProjectId,
    limit = 10
  }: SearchUsersUseCaseRequest): Promise<SearchUsersUseCaseResponse> {
    const users = await this.usersRepository.searchByCompany({
      companyId: user.idempresa!,
      query,
      excludeProjectId,
      limit
    })

    return {
      users: users.map((u) => ({
        id: u.id,
        nome: u.nome,
        sobrenome: u.sobrenome,
        email: u.email,
        foto: u.foto,
        departamento: u.departamento
      }))
    }
  }
}
