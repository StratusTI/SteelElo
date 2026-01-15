import { ErrorResponse } from "@/src/@types/http-response";
import { User } from "@/src/@types/user";
import { standardError } from "@/src/utils/http-response";
import { decodeToken, verifyToken } from "@/src/utils/jwt";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function getAuthUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null

  const user = await decodeToken(token)
  return user
}

export interface VerifyJWTResult {
  user: User | null
  error?: NextResponse<ErrorResponse>
}

export async function verifyJWT(): Promise<VerifyJWTResult> {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) {
    return {
      user: null,
      error: standardError('UNAUTHORIZED', 'Authentication token not found'),
    }
  }

  const user = await verifyToken(token)

  if (!user) {
    return {
      user: null,
      error: standardError('INVALID_TOKEN', 'Invalid or expired token'),
    }
  }

  return { user }
}
