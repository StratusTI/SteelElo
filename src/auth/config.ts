import type { CookieConfig, TokenConfig } from './types'

let _encodedSecret: Uint8Array | null = null

export function getEncodedSecret(): Uint8Array {
  if (_encodedSecret) {
    return _encodedSecret
  }

  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    throw new Error(
      'JWT_SECRET environment variable is required. Please set it in your .env file.'
    )
  }

  _encodedSecret = new TextEncoder().encode(jwtSecret)
  return _encodedSecret
}

export const TOKEN_CONFIG: TokenConfig = {
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'nexo',
  algorithm: 'HS256',
}

export const COOKIE_CONFIG: CookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
}

export const COOKIE_NAMES = {
  accessToken: 'auth_token',
  refreshToken: 'refresh_token',
} as const

export const COOKIE_MAX_AGE = {
  accessToken: 15 * 60,
  refreshToken: 7 * 24 * 60 * 60,
} as const
