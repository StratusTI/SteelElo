// src/infrastructure/auth/jwt-service.ts

import { AuthService } from "@/src/application/services/auth-service";
import { UserProps } from "@/src/domain/entities/user";
import * as jose from 'jose';

export class JWTService implements AuthService {
  private readonly secret: Uint8Array;

  constructor(secret?: string) {
    const resolvedSecret = secret || process.env.JWT_SECRET;
    if (!resolvedSecret) {
      throw new Error('JWT_SECRET is not defined');
    }
    this.secret = new TextEncoder().encode(resolvedSecret);
  }

  async verifyToken(token: string): Promise<UserProps | null> {
    try {
      const { payload } = await jose.jwtVerify(token, this.secret);

      // Normaliza os dados do token (converte números para booleanos)
      const data = payload.data as any;

      return {
        id: data.id,
        nome: data.nome || '',
        sobrenome: data.sobrenome || '',
        email: data.email,
        foto: data.foto || '',
        telefone: data.telefone || '',
        admin: Boolean(data.admin),
        superadmin: Boolean(data.superadmin),
        role: this.mapRole(data.admin, data.superadmin),
        idempresa: data.idempresa || null,
        departamento: data.departamento || null,
        time: data.time || '',
        online: Boolean(data.online)
      };
    } catch (err) {
      console.error('❌ JWT verification failed:', err);
      return null;
    }
  }

  async decodeToken(token: string): Promise<UserProps | null> {
    try {
      const payload = jose.decodeJwt(token);
      const data = payload.data as any;

      return {
        id: data.id,
        nome: data.nome || '',
        sobrenome: data.sobrenome || '',
        email: data.email,
        foto: data.foto || '',
        telefone: data.telefone || '',
        admin: Boolean(data.admin),
        superadmin: Boolean(data.superadmin),
        role: this.mapRole(data.admin, data.superadmin),
        idempresa: data.idempresa || null,
        departamento: data.departamento || null,
        time: data.time || '',
        online: Boolean(data.online)
      };
    } catch (err) {
      console.error('JWT decoding failed:', err);
      return null;
    }
  }

  async generateToken(user: UserProps): Promise<string> {
    const payload = {
      iss: 'stratustelecom',
      sub: user.id.toString(),
      data: user
    };

    return await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(this.secret);
  }

  private mapRole(admin: number | boolean, superadmin: number | boolean): 'admin' | 'member' | 'viewer' {
    if (superadmin) return 'admin';
    if (admin) return 'admin';
    return 'member';
  }
}
