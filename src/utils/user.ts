import { User } from "../@types/user";

export function getUserFullName(user: User): string {
  return `${user.nome} ${user.sobrenome}`.trim()
}

export function isUserAdmin(user: User): boolean {
  return user.admin || user.superadmin;
}

export function isUserSuperAdmin(user: User): boolean {
  return user.superadmin;
}

export function getUserInitials(user: User): string {
  const firstName = user.nome?.charAt(0) || '';
  const lastName = user.sobrenome?.charAt(0) || '';
  return `${firstName}${lastName}`.toUpperCase();
}
