import { UserProps } from "@/src/domain/entities/user";

export interface JWTPayload {
  iss: string
  iat: number
  exp: number
  sub: string
  data: UserProps
}
