import { User } from "./user";

export interface JwtPayload {
  iss: string
  iat: number
  exp: number
  sub: string
  data: User
}
