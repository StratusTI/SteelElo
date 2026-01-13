// src/application/services/auth-service.ts

import { UserProps } from "@/src/domain/entities/user";

export interface AuthService {
  verifyToken(token: string): Promise<UserProps | null>;
  generateToken(user: UserProps): Promise<string>;
  decodeToken(token: string): Promise<UserProps | null>;
}
