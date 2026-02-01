export interface User {
  id: number
  nome: string
  sobrenome: string
  username: string
  email: string
  foto: string
  telefone: string
  admin: boolean
  superadmin: boolean
  idempresa: number
  empresa: string
  departamento: string | null
  time: string | null
  online: boolean
}
