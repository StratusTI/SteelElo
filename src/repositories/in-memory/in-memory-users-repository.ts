import { User } from "@/src/@types/user";
import { UsersRepository } from "../users-repository";

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
}
