import * as jose from 'jose';
import { User } from "../@types/user";
import { mapUserRole } from "./user";

const getSecret = (): Uint8Array => {
  const secret = process.env.JWT_SECRET

  if (!secret) throw new Error('JWT_SECRET is not defined')

  return new TextEncoder().encode(secret)
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jose.jwtVerify(token, getSecret())
    const user = payload.data as any

    const admin = Boolean(user.admin)
    const superadmin = Boolean(user.superadmin)

    return {
      id: user.id,
      nome: user.nome || '',
      sobrenome: user.sobrenome || '',
      email: user.email,
      foto: user.foto || '',
      telefone: user.telefone || '',
      admin,
      superadmin,
      role: (user.role as User['role']) ?? mapUserRole(admin, superadmin),
      idempresa: user.idempresa || null,
      departamento: user.departamento || null,
      time: user.time || '',
      online: Boolean(user.online)
    }
  } catch (err) {
    console.error('JWT verification failed', err)
    return null
  }
}

export async function decodeToken(token: string): Promise<User | null> {
  try {
    const payload = jose.decodeJwt(token)
    const user = payload.data as any

    const admin = Boolean(user.admin)
    const superadmin = Boolean(user.superadmin)

    return {
      id: user.id,
      nome: user.nome || '',
      sobrenome: user.sobrenome || '',
      email: user.email,
      foto: user.foto || '',
      telefone: user.telefone || '',
      admin,
      superadmin,
      role: (user.role as User['role']) ?? mapUserRole(admin, superadmin),
      idempresa: user.idempresa || null,
      departamento: user.departamento || null,
      time: user.time || '',
      online: Boolean(user.online)
    }
  } catch (err) {
    console.error('JWT verification failed', err)
    return null
  }
}

export async function generateToken(user: User): Promise<string> {
  const payload = {
    iss: 'stratustelecom',
    sub: user.id.toString(),
    data: user
  }
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(getSecret())
}
