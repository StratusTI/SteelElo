import { NextResponse } from "next/server";
import { User } from "../@types/user";
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

export function mapUserRole(admin: boolean | number, superadmin: boolean | number): string {
  if (admin || superadmin) return 'admin';
  return 'member';
}

export async function requireAdmin(): Promise<{ user: User | null; error ?: NextResponse }> {
  return verifyUserRole('admin')
}

export async function requireSuperAdmin(): Promise<{ user: User | null; error ?: NextResponse }> {
  return verifyUserRole('superadmin')
}
