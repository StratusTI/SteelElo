import { User } from "../@types/user";

export interface SearchUsersParams {
  companyId: number
  query?: string
  excludeProjectId?: number
  limit?: number
}

export interface UpdateUserProfileParams {
  userId: number
  nome?: string
  sobrenome?: string
  username?: string
}

export interface UsersRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  searchByCompany(params: SearchUsersParams): Promise<User[]>;
  countByCompany(companyId: number): Promise<number>;
  updateProfile(params: UpdateUserProfileParams): Promise<User | null>;
}
