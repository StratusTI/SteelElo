import { AuthService } from "@/src/application/services/auth-service";
import { UserEntity, UserProps } from "@/src/domain/entities/user";
import jwt from 'jsonwebtoken';
import { JWTPayload } from "./jwt-payload";

export class JWTService implements AuthService {
  private readonly secret: string

  constructor(
    secret?: string
  ) {
    const resolvedSecret = secret || process.env.JWT_SECRET;

    if (!resolvedSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    this.secret = resolvedSecret;
  }

  async verifyToken(token: string): Promise<UserProps | null> {
    try {
      const decoded = jwt.verify(token, this.secret) as JWTPayload;
      return UserEntity.fromJSON(decoded.data)
    } catch (err) {
      console.error('JWT verification failed:', err);
      return null;
    }
  }

  async decodeToken(token: string): Promise<UserProps | null> {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      return UserEntity.fromJSON(decoded.data)
    } catch (err) {
      console.error('JWT decoding failed:', err);
      return null;
    }
  }

  async generateToken(user: UserProps): Promise<string> {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      iss: 'stratustelecom',
      sub: user.id.toString(),
      data: user
    };

    return jwt.sign(payload, this.secret, {
      expiresIn: '7d'
    });
  }
}
