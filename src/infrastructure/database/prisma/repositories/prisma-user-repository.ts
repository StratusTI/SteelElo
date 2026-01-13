import { UserRepository } from "@/src/application/repositories/user-repository";
import { UserEntity } from "@/src/domain/entities/user";
import { PrismaClient } from "@prisma/client/extension";

const prisma = new PrismaClient();

export class PrismaUserRepository implements UserRepository {
  async findById(id: number): Promise<UserEntity | null> {
    const user = await prisma.usuarios.findUnique({
      where: { id }
    });

    if (!user) return null;

    return new UserEntity(
      user.id,
      user.nome || '',
      user.sobrenome || '',
      user.email,
      user.foto || '',
      user.telefone || '',
      Boolean(user.admin),
      Boolean(user.superadmin),
      this.mapRole(user.admin, user.superadmin),
      user.idempresa,
      user.departamento || null,
      user.time || '',
      Boolean(user.online)
    );
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.usuarios.findUnique({
      where: { email }
    });

    if (!user) return null;

    return new UserEntity(
      user.id,
      user.nome || '',
      user.sobrenome || '',
      user.email,
      user.foto || '',
      user.telefone || '',
      Boolean(user.admin),
      Boolean(user.superadmin),
      this.mapRole(user.admin, user.superadmin),
      user.idempresa,
      user.departamento || null,
      user.time || '',
      Boolean(user.online)
    );
  }

  private mapRole(admin: number, superadmin: number): 'admin' | 'member' | 'viewer' {
    if (superadmin === 1) return 'admin';
    if (admin === 1) return 'admin';
    return 'member';
  }
}
