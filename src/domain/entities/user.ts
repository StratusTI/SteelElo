export interface UserProps {
  id: number
  nome: string
  email: string
  admin: number
  superadmin: number
  idempresa: number
  empresa: string
}

export class UserEntity implements UserProps {
  constructor(
    public readonly id: number,
    public readonly nome: string,
    public readonly email: string,
    public readonly admin: number,
    public readonly superadmin: number,
    public readonly idempresa: number,
    public readonly empresa: string
  ) {}

  isAdmin(): boolean {
    return this.admin === 1;
  }

  isSuperAdmin(): boolean {
    return this.superadmin === 1;
  }

  static fromJSON(data: UserProps): UserEntity {
    return new UserEntity(
      data.id,
      data.nome,
      data.email,
      data.admin,
      data.superadmin,
      data.idempresa,
      data.empresa
    );
  }
}
