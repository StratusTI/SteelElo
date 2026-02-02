import { User } from "@/src/@types/user";
import { SearchUsersParams, UpdateUserProfileParams, UsersRepository } from "../users-repository";

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = [];

  async findById(id: number): Promise<User | null> {
    const user = this.items.find(item => item.id === id)
    return user ?? null
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find(item => item.email === email)
    return user ?? null
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = this.items.find(item => item.username === username)
    return user ?? null
  }

  async searchByCompany(params: SearchUsersParams): Promise<User[]> {
    let users = this.items.filter(user => user.idempresa === params.companyId)

    if (params.query) {
      const query = params.query.toLowerCase()
      users = users.filter(user => {
        const fullName = `${user.nome} ${user.sobrenome}`.toLowerCase()
        const email = user.email.toLowerCase()
        return fullName.includes(query) || email.includes(query)
      })
    }

    if (params.limit) {
      users = users.slice(0, params.limit)
    }

    return users
  }

  async countByCompany(companyId: number): Promise<number> {
    return this.items.filter(user => user.idempresa === companyId).length
  }

  async updateProfile(params: UpdateUserProfileParams): Promise<User | null> {
    const userIndex = this.items.findIndex(item => item.id === params.userId)

    if (userIndex === -1) {
      return null
    }

    const user = this.items[userIndex]

    if (params.nome !== undefined) {
      user.nome = params.nome
    }
    if (params.sobrenome !== undefined) {
      user.sobrenome = params.sobrenome
    }
    if (params.username !== undefined) {
      user.username = params.username
    }

    this.items[userIndex] = user
    return user
  }
}
