import { User } from "@/src/@types/user";
import { prismaSteel } from "@/src/lib/prisma";
import { mapUserRole } from "@/src/utils/user";
import { UsersRepository } from "../users-repository";

export class PrismaUsersRepository implements UsersRepository {
  async findById(id: number): Promise<User | null> {
    const user = await prismaSteel.usuario.findUnique({
        where: { id }
      })

    if (!user || !user.email) return null

    const admin = user.admin ?? false;
    const superadmin = user.superadmin ?? false;

    return {
      id: user.id,
      nome: user.nome ?? '',
      sobrenome: user.sobrenome ?? '',
      email: user.email,
      foto: user.foto ?? '',
      telefone: user.telefone ?? '',
      admin,
      superadmin,
      role: (user.role as User['role']) ?? mapUserRole(admin, superadmin),
      idempresa: user.idempresa ?? null,
      departamento: user.departamento ?? null,
      time: user.time ?? '',
      online: user.online
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prismaSteel.usuario.findUnique({
        where: { email }
      })

    if (!user || !user.email) return null

    const admin = user.admin ?? false;
    const superadmin = user.superadmin ?? false;

    return {
      id: user.id,
      nome: user.nome ?? '',
      sobrenome: user.sobrenome ?? '',
      email: user.email,
      foto: user.foto ?? '',
      telefone: user.telefone ?? '',
      admin,
      superadmin,
      role: (user.role as User['role']) ?? mapUserRole(admin, superadmin),
      idempresa: user.idempresa ?? null,
      departamento: user.departamento ?? null,
      time: user.time ?? '',
      online: user.online
    }
  }
}
