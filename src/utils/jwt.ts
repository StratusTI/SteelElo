import * as jose from 'jose';
import { User } from "../@types/user";

const SECRET_STR = process.env.JWT_SECRET;

if (!SECRET_STR) {
  throw new Error('JWT_SECRET is not defined in environment variables');
}

const ENCODED_SECRET = new TextEncoder().encode(SECRET_STR);

function mapPayloadToUser(data: any): User {
  return {
    id: data.id,
    nome: data.nome || '',
    sobrenome: data.sobrenome || '',
    username: data.username || '',
    email: data.email,
    foto: data.foto || '',
    telefone: data.telefone || '',
    admin: !!data.admin,
    superadmin: !!data.superadmin,
    idempresa: data.idempresa ?? null,
    empresa: data.empresa ?? null,
    departamento: data.departamento ?? null,
    time: data.time || '',
    online: !!data.online
  };
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jose.jwtVerify(token, ENCODED_SECRET, {
      algorithms: ['HS256'],
    });

    if (!payload?.data) return null;

    return mapPayloadToUser(payload.data);
  } catch (err) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('JWT Verification failed:', err instanceof Error ? err.message : err);
    }
    return null;
  }
}

export function decodeToken(token: string): User | null {
  try {
    const payload = jose.decodeJwt(token);

    if (!payload?.data) return null;

    return mapPayloadToUser(payload.data);
  } catch (err) {
    return null;
  }
}

export async function generateToken(user: User): Promise<string> {
  const payload = {
    iss: 'stratustelecom',
    sub: String(user.id),
    data: user
  };

  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(ENCODED_SECRET);
}
