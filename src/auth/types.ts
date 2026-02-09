import type { NextResponse } from 'next/server'
import type { ErrorResponse } from '@/src/@types/http-response'
import type { User } from '@/src/@types/user'

/**
 * Payload minimalista do JWT - apenas dados essenciais para autenticacao
 */
export interface JwtPayload {
  iss: string
  sub: string
  email: string
  admin: boolean
  superadmin: boolean
  enterpriseId: number
  iat: number
  exp: number
}

/**
 * Payload do refresh token
 */
export interface RefreshTokenPayload {
  iss: string
  sub: string
  type: 'refresh'
  family: string
  iat: number
  exp: number
}

/**
 * Usuario autenticado extraido do JWT
 * Contem apenas dados do token, nao dados completos do banco
 */
export interface AuthUser {
  id: number
  email: string
  admin: boolean
  superadmin: boolean
  enterpriseId: number
}

/**
 * Resultado da verificacao de autenticacao
 */
export interface AuthResult {
  user: AuthUser | null
  error?: NextResponse<ErrorResponse>
  tokensRefreshed?: boolean
}

/**
 * Contexto completo de autenticacao (com dados do banco)
 */
export interface AuthContext {
  user: User
  authUser: AuthUser
  fullName: string
  isAdmin: boolean
  isSuperAdmin: boolean
  initials: string
}

/**
 * Opcoes de configuracao de tokens
 */
export interface TokenConfig {
  accessTokenExpiry: string
  refreshTokenExpiry: string
  issuer: string
  algorithm: 'HS256'
}

/**
 * Opcoes de configuracao de cookies
 */
export interface CookieConfig {
  httpOnly: boolean
  secure: boolean
  sameSite: 'lax' | 'strict' | 'none'
  path: string
}
