export interface User {
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
  time: string | null
  online: boolean
}
