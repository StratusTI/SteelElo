// src/application/repositories/user-repository.ts

import { UserEntity } from "@/src/domain/entities/user";

export interface UserRepository {
  findById(id: number): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
}
