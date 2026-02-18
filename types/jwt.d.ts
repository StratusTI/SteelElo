export interface JwtPayload {
  iss: string
  iat: number
  exp: number
  sub: string
  data: string
}
