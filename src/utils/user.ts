import { User } from "../@types/user";
import type { VerifyJWTResult } from "../http/middlewares/verify-jwt";
import { verifyUserRole } from "../http/middlewares/verify-users-role";

export function getUserFullName(user: User): string {
  return `${user.nome} ${user.sobrenome}`.trim()
}

export function isUserAdmin(user: User): boolean {
  return user.admin || user.superadmin;
}

export function isUserSuperAdmin(user: User): boolean {
  return user.superadmin;
}

export async function requireAdmin(): Promise<VerifyJWTResult> {
  return verifyUserRole('admin')
}

export async function requireSuperAdmin(): Promise<VerifyJWTResult> {
  return verifyUserRole('superadmin')
}
