import { AuthService } from "@/src/application/services/auth-service";
import { UserEntity, UserProps } from "@/src/domain/entities/user";
import * as jose from 'jose';
import { JWTPayload } from "./jwt-payload";

export class JWTService implements AuthService {
  private readonly secret: Uint8Array

  constructor(
    secret?: string
  ) {
    const resolvedSecret = secret || process.env.JWT_SECRET;

    if (!resolvedSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    // Converte a string secret para Uint8Array
    this.secret = new TextEncoder().encode(resolvedSecret);
  }

  async verifyToken(token: string): Promise<UserProps | null> {
    try {
      console.log('🔐 Verificando token...');

      const { payload } = await jose.jwtVerify(token, this.secret);

      console.log('✅ Token válido:', payload.data);
      return UserEntity.fromJSON(payload.data as UserProps)
    } catch (err) {
      console.error('❌ JWT verification failed:', err);
      return null;
    }
  }

  async decodeToken(token: string): Promise<UserProps | null> {
    try {
      const payload = jose.decodeJwt(token);
      return UserEntity.fromJSON(payload.data as UserProps)
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
}
