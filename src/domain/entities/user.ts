// src/domain/entities/user.ts

export interface UserProps {
  id: number
  nome: string
  sobrenome: string
  email: string
  foto: string
  telefone: string
  admin: boolean
  superadmin: boolean
  role: 'admin' | 'member' | 'viewer'
  idempresa: number | null
  departamento: string | null
  time: string
  online: boolean
}

export class UserEntity implements UserProps {
  constructor(
    public id: number,
    public nome: string,
    public sobrenome: string,
    public email: string,
    public foto: string,
    public telefone: string,
    public admin: boolean,
    public superadmin: boolean,
    public role: 'admin' | 'member' | 'viewer',
    public idempresa: number | null,
    public departamento: string | null,
    public time: string,
    public online: boolean
  ) { }

  get nomeCompleto(): string {
    return `${this.nome} ${this.sobrenome}`.trim()
  }

  isAdmin(): boolean {
    return this.admin === true
  }

  isSuperAdmin(): boolean {
    return this.superadmin === true
  }

  static fromJSON(data: UserProps): UserEntity {
    return new UserEntity(
      data.id,
      data.nome,
      data.sobrenome,
      data.email,
      data.foto,
      data.telefone,
      data.admin,
      data.superadmin,
      data.role,
      data.idempresa,
      data.departamento,
      data.time,
      data.online
    )
  }

  toJSON(): UserProps {
    return {
      id: this.id,
      nome: this.nome,
      sobrenome: this.sobrenome,
      email: this.email,
      foto: this.foto,
      telefone: this.telefone,
      admin: this.admin,
      superadmin: this.superadmin,
      role: this.role,
      idempresa: this.idempresa,
      departamento: this.departamento,
      time: this.time,
      online: this.online
    }
  }
}
